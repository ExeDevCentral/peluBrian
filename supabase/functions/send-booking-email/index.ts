// Supabase Edge Function (Deno TypeScript)
// Deploy command: supabase functions deploy send-booking-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@0.15.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const OWNER_EMAIL = Deno.env.get('OWNER_EMAIL') || 'dueno@elbuho.com'

const resend = new Resend(RESEND_API_KEY)

serve(async (req) => {
  try {
    const { record } = await req.json()

    if (!record) {
      return new Response(JSON.stringify({ error: 'No payload record provided' }), { status: 400 })
    }

    // Send email to owner
    await resend.emails.send({
      from: 'El Búho Dorado <reservas@elbuho.com>',
      to: [OWNER_EMAIL],
      subject: `💈 NUEVA RESERVA SEÑADA: ${record.service_name} (${record.date_display} ${record.time_slot} hs)`,
      html: `
        <h2>¡Nuevo Turno Registrado en Rosario!</h2>
        <p><b>Voucher ID:</b> ${record.id}</p>
        <p><b>Servicio:</b> ${record.service_name}</p>
        <p><b>Barbero:</b> ${record.barber_name}</p>
        <p><b>Día y Hora:</b> ${record.date_display} · ${record.time_slot} hs</p>
        <p><b>Seña Abonada:</b> $ ${record.deposit_paid}</p>
        <p><b>Dirección:</b> Urquiza 1315, Rosario</p>
      `,
    })

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
