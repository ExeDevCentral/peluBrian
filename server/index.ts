import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import crypto from 'node:crypto'
import OpenAI from 'openai'
import { Resend } from 'resend'

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ── SECURITY MIDDLEWARE ─────────────────────────────────────────────────────

// Rate limit: basic abuse protection for all /api routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})

// Stricter rate limit for auth attempts (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de acceso. Probá de nuevo en 15 minutos.' },
})

app.use('/api', apiLimiter)

// Simple shared-secret protection for sensitive endpoints. The frontend
// service must send the header `x-api-key`. If API_SECRET_KEY is not set,
// sensitive endpoints stay open (local/dev mode) — set it in production.
function requireApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
  const secret = process.env.API_SECRET_KEY
  if (!secret) return next()
  const provided = req.header('x-api-key')
  if (!provided || provided !== secret) {
    return res.status(401).json({ error: 'API key inválida o faltante' })
  }
  next()
}

// Constant-time comparison helper for PIN verification
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

let openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return openai
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const WHATSAPP_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0'

// Valid haircut style ids that the frontend catalog supports
const VALID_STYLE_IDS = ['pompadour', 'clasico', 'undercut', 'fade_low', 'slickback', 'quiff']

// ── NOTIFICATIONS HELPERS (WhatsApp Cloud API + Resend) ────────────────────

function waMessageText(to: string, body: string): string | null {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_ID
  if (!token || !phoneId) return null

  return `https://graph.facebook.com/${WHATSAPP_VERSION}/${phoneId}/messages`
}

async function sendWhatsAppText(to: string, body: string): Promise<{ success: boolean; message: string }> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_ID
  if (!token || !phoneId) {
    return { success: false, message: 'WHATSAPP_TOKEN / WHATSAPP_PHONE_ID no configurados' }
  }

  try {
    const response = await fetch(waMessageText(to, body)!, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return { success: false, message: `WhatsApp Cloud API ${response.status}: ${errText.slice(0, 300)}` }
    }

    return { success: true, message: `Mensaje WhatsApp enviado a ${to}` }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Error de red al enviar WhatsApp' }
  }
}

async function sendOwnerEmail(subject: string, html: string): Promise<{ success: boolean; message: string }> {
  const ownerEmail = process.env.OWNER_EMAIL || 'dueno@elbuho.com'
  if (!resend) {
    return { success: false, message: 'RESEND_API_KEY no configurada' }
  }

  try {
    await resend.emails.send({
      from: 'El Búho Dorado <reservas@elbuho.com>',
      to: [ownerEmail],
      subject,
      html,
    })
    return { success: true, message: `Email enviado a ${ownerEmail}` }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Error al enviar email con Resend' }
  }
}

// ── NOTIFICATION ENDPOINT: Booking Confirmation (WhatsApp + Email) ──────────

// Simple HTML escaper to prevent injection into the email body
function escapeHtml(v: unknown): string {
  return String(v ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

app.post('/api/notifications/booking-confirmation', requireApiKey, async (req, res) => {
  try {
    const {
      voucherId,
      serviceName,
      barberName,
      customerName,
      customerPhone,
      dateDisplay,
      timeSlot,
      totalPrice,
      depositPaid,
      qrCodeSeed,
    } = req.body

    if (!isNonEmptyString(voucherId) || !isNonEmptyString(serviceName) || !isNonEmptyString(dateDisplay) || !isNonEmptyString(timeSlot)) {
      return res.status(400).json({ error: 'Faltan datos obligatorios de la reserva' })
    }

    const fmt = (n: number) => `$ ${Number(n || 0).toLocaleString('es-AR')}`
    const remaining = Math.max(0, Number(totalPrice || 0) - Number(depositPaid || 0))

    // Sanitize all values interpolated into WhatsApp / email
    const e = escapeHtml
    const voucherIdSafe = e(voucherId)
    const serviceNameSafe = e(serviceName)
    const barberNameSafe = e(barberName)
    const customerNameSafe = e(customerName)
    const customerPhoneSafe = e(customerPhone)

    const whatsappBody =
      `💈 *NUEVA RESERVA SEÑADA - El Búho Dorado*\n\n` +
      `🎟 *Voucher:* ${voucherIdSafe}\n` +
      `✂️ *Servicio:* ${serviceNameSafe}\n` +
      `💈 *Barbero:* ${barberNameSafe}\n` +
      `📅 *Día:* ${dateDisplay}\n` +
      `⏰ *Hora:* ${timeSlot} hs\n` +
      `💰 *Seña abonada (50%):* ${fmt(depositPaid)}\n` +
      `🧾 *Restante en local:* ${fmt(remaining)}\n` +
      `👤 *Cliente:* ${customerNameSafe || 'Cliente Web'}\n` +
      `📱 *Teléfono:* ${customerPhoneSafe || '-'}\n\n` +
      `📍 Calle Urquiza 1315, Rosario`

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background: #0d0b08; color: #f2e6cc; padding: 2rem; border-radius: 4px;">
        <h2 style="color: #c4943a; margin-top: 0;">💈 Nueva Reserva Registrada - Rosario</h2>
        <p><b>Voucher No:</b> <span style="color: #c4943a;">${voucherIdSafe}</span></p>
        <p><b>Servicio:</b> ${serviceNameSafe}</p>
        <p><b>Barbero Asignado:</b> ${barberNameSafe || 'Por asignar'}</p>
        <p><b>Día y Horario:</b> ${e(dateDisplay)} a las ${e(timeSlot)} hs</p>
        <p><b>Seña Transferida (50%):</b> ${fmt(depositPaid)}</p>
        <p><b>Restante a cobrar en local:</b> ${fmt(remaining)}</p>
        <p><b>Cliente:</b> ${customerNameSafe || 'Cliente Web'} (${customerPhoneSafe || '-'})</p>
        <hr style="border-color: rgba(196,148,58,0.3);" />
        <p style="font-size: 0.8rem; color: #6b5940;">Notificación automática de El Búho Dorado Barbería Boutique.</p>
      </div>
    `

    const ownerPhone = process.env.OWNER_PHONE
    const [whatsappResult, emailResult] = await Promise.all([
      ownerPhone ? sendWhatsAppText(ownerPhone, whatsappBody) : Promise.resolve({ success: false, message: 'OWNER_PHONE no configurado' }),
      sendOwnerEmail(`💈 NUEVA RESERVA SEÑADA: ${serviceNameSafe} (${e(dateDisplay)} ${e(timeSlot)} hs)`, emailHtml),
    ])

    res.json({ whatsapp: whatsappResult, email: emailResult })
  } catch (err: any) {
    console.error('[Notifications] Error:', err?.message || err)
    res.status(500).json({ error: err?.message || 'Error al enviar notificaciones' })
  }
})

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── ADMIN AUTH: Verify PIN (server-side, brute-force protected) ─────────────
// The PIN lives only in the server env (ADMIN_PIN). Without it, the panel
// stays open (dev mode) — set it in production.
app.post('/api/auth/verify-pin', authLimiter, (req, res) => {
  const { pin } = req.body
  const adminPin = process.env.ADMIN_PIN

  if (!adminPin) {
    return res.json({ success: true, openMode: true })
  }

  if (typeof pin !== 'string' || pin.length === 0) {
    return res.status(400).json({ success: false, error: 'Ingresá el PIN de acceso' })
  }

  if (safeEqual(pin, adminPin)) {
    return res.json({ success: true })
  }

  return res.status(401).json({ success: false, error: 'PIN incorrecto' })
})

// Real AI Facial Analysis via OpenAI Vision (gpt-4o-mini)
app.post('/api/ai/analyze-face', async (req, res) => {
  try {
    const { image } = req.body

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Falta la imagen (campo "image")' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'OPENAI_API_KEY no configurada en el servidor',
        fallback: true,
      })
    }

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Eres un barbero experto con visión artificial. Analizás la foto del rostro de un cliente y devolvés SOLO JSON válido sin texto adicional, con este esquema exacto:
{
  "faceShape": "Ovalado" | "Cuadrado" | "Redondo" | "Diamante",
  "score": 70,
  "bestStyleId": "pompadour" | "clasico" | "undercut" | "fade_low" | "slickback" | "quiff",
  "explanation": "Explicación en español de 1-2 oraciones sobre por qué ese corte favorece la estructura facial detectada",
  "recommendedProduct": "Nombre de un producto capilar premium de peinado en español"
}

Reglas:
- "score" es un entero entre 70 y 98 que representa la compatibilidad estimada del corte recomendado con el rostro.
- "bestStyleId" debe ser uno de los ids válidos y elegir el corte que mejor resalte las facciones según la forma de rostro.
- Si no podés identificar el rostro, usá "bestStyleId": "clasico" con score bajo y explicación honesta.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: image },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    })

    const content = completion.choices?.[0]?.message?.content
    if (!content) {
      return res.status(500).json({ error: 'OpenAI no devolvió contenido' })
    }

    const parsed = JSON.parse(content)

    // Sanitize: ensure bestStyleId is a valid id the frontend understands
    const bestStyleId = VALID_STYLE_IDS.includes(parsed.bestStyleId) ? parsed.bestStyleId : 'clasico'

    res.json({
      faceShape: parsed.faceShape || 'Ovalado',
      score: Math.min(98, Math.max(70, Math.round(Number(parsed.score) || 85))),
      bestStyleId,
      explanation: parsed.explanation || 'Estructura facial analizada correctamente.',
      recommendedProduct: parsed.recommendedProduct || 'Pomada Fuerte Noir Búho (Fijación Máxima)',
    })
  } catch (err: any) {
    console.error('[AI Vision] Error:', err?.message || err)
    res.status(500).json({ error: err?.message || 'Error al analizar la imagen', fallback: true })
  }
})

// Mercado Pago Webhook Route
// NOTE: webhooks arrive signed by Mercado Pago with the x-signature header,
// so this route intentionally stays open (no API key). In production you must
// validate the signature using the notification secret to avoid forgery.
app.post('/api/webhooks/mercadopago', (req, res) => {
  const { type, data } = req.body
  const signature = req.headers['x-signature']

  console.log(`[Mercado Pago Webhook Received] Type: ${type}, Payment ID: ${data?.id}`)

  // Signature verification logic with MP secret key
  // ...

  res.status(200).send('OK')
})

// Mercado Pago Create Preference Endpoint (protected)
app.post('/api/checkout/create-preference', requireApiKey, (req, res) => {
  const { serviceId, barberId, dateStr, timeSlot, depositAmount } = req.body

  if (!isNonEmptyString(serviceId) || !isNonEmptyString(barberId) || !isNonEmptyString(dateStr) || !isNonEmptyString(timeSlot)) {
    return res.status(400).json({ error: 'Faltan datos obligatorios de la preferencia' })
  }

  // Call Mercado Pago Node SDK Preference API
  const preferenceId = `PREF-${Date.now()}`
  res.json({
    preferenceId,
    initPoint: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`,
  })
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`💈 El Búho Dorado Backend API server running on port ${PORT}`)
  })
}

export default app
