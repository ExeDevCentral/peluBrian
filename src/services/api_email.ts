// ── SERVICIO DE NOTIFICACIONES DE RESERVA ────────────────────────────────────
// Las API keys viven en el servidor (server/index.ts). El frontend llama al
// endpoint /api/notifications/booking-confirmation y, si el backend no está
// disponible, cae a FormSubmit.co (envío de email gratuito al dueño).

export interface BookingEmailData {
  voucherId: string
  serviceName: string
  barberName: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  dateDisplay: string
  timeSlot: string
  totalPrice: number
  depositPaid: number
  qrCodeSeed: string
}

export async function sendBookingNotifications(data: BookingEmailData): Promise<{ success: boolean; message: string }> {
  console.log('[Notifications] Enviando notificaciones para el turno:', data.voucherId)

  const apiKey = import.meta.env.VITE_API_SECRET_KEY || ''
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['x-api-key'] = apiKey

  try {
    const response = await fetch('/api/notifications/booking-confirmation', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errBody = await response.json().catch(() => null)
      throw new Error(errBody?.error || `Backend respondió ${response.status}`)
    }

    const result = await response.json()
    const whatsappOk = result?.whatsapp?.success
    const emailOk = result?.email?.success

    if (whatsappOk || emailOk) {
      return {
        success: true,
        message: `Notificaciones enviadas (WhatsApp: ${whatsappOk ? 'OK' : 'no configurado'}, Email: ${emailOk ? 'OK' : 'no configurado'})`,
      }
    }

    return { success: false, message: 'Backend sin credenciales de notificación configuradas' }
  } catch (err: any) {
    console.warn('[Notifications] Backend no disponible, usando fallback FormSubmit:', err)

    // Fallback: FormSubmit.co sends an email to the owner inbox for free
    try {
      const ownerEmail = 'dueno@gmail.com'
      const res = await fetch(`https://formsubmit.co/ajax/${ownerEmail}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `💈 NUEVO TURNO RESERVADO: ${data.serviceName} (${data.dateDisplay} ${data.timeSlot} hs)`,
          Voucher_ID: data.voucherId,
          Servicio: data.serviceName,
          Barbero: data.barberName,
          Dia: data.dateDisplay,
          Hora: `${data.timeSlot} hs`,
          Sena_Abonada: `$ ${data.depositPaid}`,
          Direccion: 'Calle Urquiza 1315, Rosario',
        }),
      })

      return res.ok
        ? { success: true, message: 'Notificación de respaldo enviada por FormSubmit' }
        : { success: false, message: 'Fallback FormSubmit falló' }
    } catch (e: any) {
      console.warn('[Notifications] Fallback FormSubmit falló:', e)
      return { success: false, message: e?.message || 'Error de red en fallback' }
    }
  }
}
