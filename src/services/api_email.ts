import { Resend } from 'resend'

const resendApiKey = import.meta.env.VITE_RESEND_API_KEY || ''
const ownerEmail = import.meta.env.VITE_OWNER_EMAIL || 'dueno@elbuho.com'

const resend = resendApiKey ? new Resend(resendApiKey) : null

export interface BookingEmailData {
  voucherId: string
  serviceName: string
  barberName: string
  customerName?: string
  customerEmail?: string
  dateDisplay: string
  timeSlot: string
  totalPrice: number
  depositPaid: number
  qrCodeSeed: string
}

export async function sendBookingNotifications(data: BookingEmailData): Promise<{ success: boolean; message: string }> {
  console.log('[Email Service] Preparando envío de notificaciones para el turno:', data.voucherId)

  // 1. Send Notification Email to Owner
  if (resend) {
    try {
      await resend.emails.send({
        from: 'El Búho Dorado <reservas@elbuho.com>',
        to: [ownerEmail],
        subject: `💈 NUEVA RESERVA SEÑADA: ${data.serviceName} (${data.dateDisplay} ${data.timeSlot} hs)`,
        html: `
          <div style="font-family: Arial, sans-serif; background: #0d0b08; color: #f2e6cc; padding: 2rem; border-radius: 4px;">
            <h2 style="color: #c4943a; margin-top: 0;">💈 Nueva Reserva Registrada - Rosario</h2>
            <p><b>Voucher No:</b> <span style="color: #c4943a;">${data.voucherId}</span></p>
            <p><b>Servicio:</b> ${data.serviceName}</p>
            <p><b>Barbero Asignado:</b> ${data.barberName}</p>
            <p><b>Día y Horario:</b> ${data.dateDisplay} a las ${data.timeSlot} hs</p>
            <p><b>Seña Transferida (50%):</b> $ ${data.depositPaid.toLocaleString('es-AR')}</p>
            <p><b>Restante a cobrar en local:</b> $ ${(data.totalPrice - data.depositPaid).toLocaleString('es-AR')}</p>
            <p><b>Ubicación:</b> Calle Urquiza 1315, Rosario</p>
            <hr style="border-color: rgba(196,148,58,0.3);" />
            <p style="font-size: 0.8rem; color: #6b5940;">Notificación automática de El Búho Dorado Barbería Boutique.</p>
          </div>
        `,
      })
      return { success: true, message: `Email enviado al dueño (${ownerEmail}) correctamente` }
    } catch (err: any) {
      console.warn('[Email Service] Error al enviar email con Resend:', err)
      return { success: false, message: err?.message || 'Error en envío de email' }
    }
  }

  // Fallback simulation when API key is not configured yet
  return {
    success: true,
    message: `[Simulación] Notificación enviada al dueño (${ownerEmail}) para la reserva ${data.voucherId}`,
  }
}
