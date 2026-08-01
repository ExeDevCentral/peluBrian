import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '10mb' }))

let openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return openai
}

// Valid haircut style ids that the frontend catalog supports
const VALID_STYLE_IDS = ['pompadour', 'clasico', 'undercut', 'fade_low', 'slickback', 'quiff']

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
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
app.post('/api/webhooks/mercadopago', (req, res) => {
  const { type, data } = req.body
  const signature = req.headers['x-signature']

  console.log(`[Mercado Pago Webhook Received] Type: ${type}, Payment ID: ${data?.id}`)

  // Signature verification logic with MP secret key
  // ...

  res.status(200).send('OK')
})

// Mercado Pago Create Preference Endpoint
app.post('/api/checkout/create-preference', (req, res) => {
  const { serviceId, barberId, dateStr, timeSlot, depositAmount } = req.body

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
