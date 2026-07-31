// ── SERVICIO DE PERSISTENCIA EN LA NUBE 100% GRATUITO (SIN SUPABASE) ─────────

export interface CloudReservationPayload {
  id: string
  serviceName: string
  barberName: string
  customerName?: string
  customerPhone?: string
  dateDisplay: string
  time: string
  totalPrice: number
  depositPaid: number
  status: string
}

// 1. Integración con Google Sheets (vía Google Apps Script o SheetBest / Stein API)
export async function syncReservationToGoogleSheets(
  reservation: CloudReservationPayload,
  googleSheetEndpointUrl?: string
): Promise<{ success: boolean; message: string }> {
  if (!googleSheetEndpointUrl) {
    console.log('[Cloud Sync] Google Sheet URL no configurada aún. Usando persistencia local + WhatsApp.')
    return { success: true, message: 'Google Sheet no configurado' }
  }

  try {
    const response = await fetch(googleSheetEndpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'Voucher ID': reservation.id,
        'Fecha': reservation.dateDisplay,
        'Hora': reservation.time,
        'Servicio': reservation.serviceName,
        'Barbero': reservation.barberName,
        'Seña Abonada': `$ ${reservation.depositPaid.toLocaleString('es-AR')}`,
        'Total': `$ ${reservation.totalPrice.toLocaleString('es-AR')}`,
        'Estado': reservation.status,
        'Fecha Registro': new Date().toLocaleString('es-AR'),
      }),
    })

    if (response.ok) {
      return { success: true, message: 'Reserva guardada en Google Sheets exitosamente' }
    }
    return { success: false, message: 'Error en respuesta de Google Sheets' }
  } catch (err: any) {
    console.warn('[Cloud Sync] Error al conectar con Google Sheets:', err)
    return { success: false, message: err?.message || 'Error de red' }
  }
}

// 2. Integración con FormSubmit.co (Envía email directo a la casilla del dueño sin registrarse)
export async function sendEmailViaFormSubmit(
  reservation: CloudReservationPayload,
  ownerEmail: string = 'dueno@gmail.com'
): Promise<{ success: boolean }> {
  try {
    await fetch(`https://formsubmit.co/ajax/${ownerEmail}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: `💈 NUEVO TURNO RESERVADO: ${reservation.serviceName} (${reservation.dateDisplay} ${reservation.time} hs)`,
        Voucher_ID: reservation.id,
        Servicio: reservation.serviceName,
        Barbero: reservation.barberName,
        Dia: reservation.dateDisplay,
        Hora: `${reservation.time} hs`,
        Sena_Abonada: `$ ${reservation.depositPaid}`,
        Direccion: 'Calle Urquiza 1315, Rosario',
      }),
    })
    return { success: true }
  } catch (e) {
    console.warn('[FormSubmit] Error al enviar email:', e)
    return { success: false }
  }
}
