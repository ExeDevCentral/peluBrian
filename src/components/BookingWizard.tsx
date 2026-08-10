import React, { useState, memo } from 'react'
import { SERVICES, BARBERS, TIME_SLOTS, getThisWeekDays, MP_ALIAS, MP_TITULAR, fmt } from '../data/mockData'
import { Service, Barber, HairStyle, Reservation } from '../types'
import { sendBookingNotifications } from '../services/api_email'

interface BookingWizardProps {
  preselectedService?: Service | null
  preselectedStyle?: HairStyle | null
  existingReservations: Reservation[]
  onSaveReservation: (reservation: Reservation) => void
  onAddToast: (msg: string, type?: 'success' | 'info' | 'gold') => void
}

const BookingWizard: React.FC<BookingWizardProps> = memo(({
  preselectedService,
  preselectedStyle,
  existingReservations,
  onSaveReservation,
  onAddToast,
}) => {
  const weekDays = getThisWeekDays()

  // Wizard state
  const [step, setStep] = useState<number>(1)
  const [selectedService, setSelectedService] = useState<Service>(preselectedService || SERVICES[0])
  const [selectedBarber, setSelectedBarber] = useState<Barber>(BARBERS[0])
  const [selectedDay, setSelectedDay] = useState(weekDays[0])
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[0])
  
  // Customer details
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'efectivo' | 'whatsapp'>('mercadopago')
  const [createdVoucher, setCreatedVoucher] = useState<Reservation | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if a time slot is already booked for this barber on this date
  const isSlotBooked = (timeSlot: string) => {
    return existingReservations.some(
      r => r.barberName === selectedBarber.name && r.dateStr === selectedDay.dateStr && r.time === timeSlot
    )
  }

  const depositAmount = selectedService.price * selectedService.depositPct
  const remainingAmount = selectedService.price - depositAmount

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName.trim() || !customerPhone.trim()) {
      onAddToast('Por favor completá tu nombre y teléfono para continuar.', 'info')
      return
    }

    setIsSubmitting(true)

    const voucherId = `PUB-${Math.floor(100000 + Math.random() * 900000)}`
    const qrSeed = `PELUQUERIA-BRIAN-${voucherId}-${selectedDay.dateStr}-${selectedTime}`

    const newReservation: Reservation = {
      id: voucherId,
      serviceName: selectedService.name,
      barberName: selectedBarber.name,
      customerName,
      customerPhone,
      customerEmail,
      dateDisplay: `${selectedDay.dayName} ${selectedDay.dayNum} ${selectedDay.monthName}`,
      dateStr: selectedDay.dateStr,
      time: selectedTime,
      totalPrice: selectedService.price,
      depositPaid: depositAmount,
      haircutName: preselectedStyle?.name || null,
      qrCodeSeed: qrSeed,
      paymentMethod,
    }

    // Save locally
    onSaveReservation(newReservation)
    setCreatedVoucher(newReservation)
    setStep(4)

    // Send notifications in background
    sendBookingNotifications({
      voucherId,
      serviceName: selectedService.name,
      barberName: selectedBarber.name,
      customerName,
      customerEmail,
      customerPhone,
      dateDisplay: newReservation.dateDisplay,
      timeSlot: selectedTime,
      totalPrice: selectedService.price,
      depositPaid: depositAmount,
      qrCodeSeed: qrSeed,
    }).catch(err => console.warn('Notification error:', err))

    setIsSubmitting(false)
    onAddToast('¡Turno reservado exitosamente! Tu comprobante fue generado.', 'gold')
  }

  const handleCopyAlias = () => {
    navigator.clipboard.writeText(MP_ALIAS)
    onAddToast(`Alias "${MP_ALIAS}" copiado al portapapeles.`, 'success')
  }

  const handleShareWhatsApp = () => {
    if (!createdVoucher) return
    const text = `💈 Hola Peluquería Brian, reservé el turno ID: ${createdVoucher.id} para ${createdVoucher.serviceName} con ${createdVoucher.barberName} el día ${createdVoucher.dateDisplay} a las ${createdVoucher.time} hs. Nombre: ${createdVoucher.customerName}`
    const url = `https://wa.me/5493410000000?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <section id="booking" className="py-24 bg-[#161210] border-t border-[#c4943a]/20">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-xs font-extrabold tracking-[0.25em] text-[#c4943a] uppercase mb-2">
            RESERVA DE TURNOS EN LÍNEA
          </div>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-extrabold text-[#f2e6cc] mb-3">
            Asegurá Tu Lugar
          </h2>
          <p className="text-sm text-[#f2e6cc]/70 max-w-xl mx-auto">
            Proceso de 3 sencillos pasos. Selecciona tu servicio, tu barbero de confianza y congela tu turno.
          </p>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="flex items-center justify-between max-w-md mx-auto mb-10 text-xs font-bold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#c4943a]' : 'text-[#6b5940]'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center border ${step >= 1 ? 'border-[#c4943a] bg-[#c4943a]/20' : 'border-[#6b5940]'}`}>1</span>
            <span>Servicio & Barbero</span>
          </div>
          <div className="h-0.5 flex-1 bg-[#c4943a]/20 mx-3" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#c4943a]' : 'text-[#6b5940]'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center border ${step >= 2 ? 'border-[#c4943a] bg-[#c4943a]/20' : 'border-[#6b5940]'}`}>2</span>
            <span>Fecha & Hora</span>
          </div>
          <div className="h-0.5 flex-1 bg-[#c4943a]/20 mx-3" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#c4943a]' : 'text-[#6b5940]'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center border ${step >= 3 ? 'border-[#c4943a] bg-[#c4943a]/20' : 'border-[#6b5940]'}`}>3</span>
            <span>Confirmación</span>
          </div>
        </div>

        {/* STEP 1: SERVICE & BARBER */}
        {step === 1 && (
          <div className="bg-[#0d0b08] p-8 rounded border border-[#c4943a]/30 space-y-8 animate-fadeIn">
            
            {/* Service Select */}
            <div>
              <label className="block text-xs font-extrabold text-[#c4943a] uppercase tracking-widest mb-4">
                1. Selecciona el Servicio
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICES.map(srv => (
                  <button
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    className={`p-4 rounded border text-left transition-all cursor-pointer ${
                      selectedService.id === srv.id
                        ? 'bg-[#c4943a]/15 border-[#c4943a] text-[#f2e6cc]'
                        : 'bg-[#161210] border-[#c4943a]/10 text-[#f2e6cc]/70 hover:border-[#c4943a]/40'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm">{srv.name}</span>
                      <span className="text-xs text-[#c4943a] font-mono">{fmt(srv.price)}</span>
                    </div>
                    <div className="text-[11px] text-[#6b5940]">{srv.duration}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Barber Select */}
            <div>
              <label className="block text-xs font-extrabold text-[#c4943a] uppercase tracking-widest mb-4">
                2. Selecciona tu Barbero
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BARBERS.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBarber(b)}
                    className={`p-3 rounded border text-center transition-all cursor-pointer flex flex-col items-center ${
                      selectedBarber.id === b.id
                        ? 'bg-[#c4943a]/15 border-[#c4943a] text-[#f2e6cc]'
                        : 'bg-[#161210] border-[#c4943a]/10 text-[#f2e6cc]/70 hover:border-[#c4943a]/40'
                    }`}
                  >
                    <img src={b.avatar} alt={b.name} className="w-14 h-14 rounded-full object-cover mb-2 border border-[#c4943a]/30" />
                    <div className="text-xs font-bold leading-tight">{b.name}</div>
                    <div className="text-[10px] text-[#c4943a] mt-1">{b.rating} ★</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-[#c4943a] hover:bg-[#e5b657] text-[#0d0b08] font-extrabold text-sm uppercase tracking-wider rounded transition-all cursor-pointer shadow"
            >
              Continuar Seleccionando Horario →
            </button>
          </div>
        )}

        {/* STEP 2: DATE & TIME */}
        {step === 2 && (
          <div className="bg-[#0d0b08] p-8 rounded border border-[#c4943a]/30 space-y-8 animate-fadeIn">
            
            {/* Days Horizontal Picker */}
            <div>
              <label className="block text-xs font-extrabold text-[#c4943a] uppercase tracking-widest mb-4">
                1. Selecciona la Fecha
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {weekDays.map((day, idx) => (
                  <button
                    key={idx}
                    disabled={day.isSunday}
                    onClick={() => setSelectedDay(day)}
                    className={`min-w-[75px] p-3 rounded border text-center transition-all cursor-pointer ${
                      day.isSunday
                        ? 'opacity-40 border-gray-800 bg-gray-900 cursor-not-allowed'
                        : selectedDay.dateStr === day.dateStr
                        ? 'bg-[#c4943a] border-[#c4943a] text-[#0d0b08] font-extrabold'
                        : 'bg-[#161210] border-[#c4943a]/20 text-[#f2e6cc] hover:border-[#c4943a]'
                    }`}
                  >
                    <div className="text-[10px] uppercase">{day.dayName}</div>
                    <div className="text-lg font-bold my-0.5">{day.dayNum}</div>
                    <div className="text-[9px] uppercase">{day.monthName}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Slots Grid */}
            <div>
              <label className="block text-xs font-extrabold text-[#c4943a] uppercase tracking-widest mb-4">
                2. Selecciona la Hora Libre
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.map((slot) => {
                  const booked = isSlotBooked(slot)

                  return (
                    <button
                      key={slot}
                      disabled={booked}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-3 rounded border text-center text-xs font-bold transition-all cursor-pointer ${
                        booked
                          ? 'bg-red-950/30 border-red-900/40 text-red-400 opacity-60 cursor-not-allowed line-through'
                          : selectedTime === slot
                          ? 'bg-[#c4943a] border-[#c4943a] text-[#0d0b08]'
                          : 'bg-[#161210] border-[#c4943a]/20 text-[#f2e6cc] hover:border-[#c4943a]'
                      }`}
                    >
                      {slot} hs {booked && '(Ocupado)'}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="py-4 px-6 bg-[#161210] border border-[#c4943a]/30 text-[#f2e6cc] text-xs font-bold rounded uppercase cursor-pointer"
              >
                ← Volver
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-4 bg-[#c4943a] hover:bg-[#e5b657] text-[#0d0b08] font-extrabold text-sm uppercase tracking-wider rounded transition-all cursor-pointer shadow"
              >
                Continuar a Confirmación →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMATION FORM */}
        {step === 3 && (
          <form onSubmit={handleConfirmBooking} className="bg-[#0d0b08] p-8 rounded border border-[#c4943a]/30 space-y-6 animate-fadeIn">
            
            {/* Booking Summary Box */}
            <div className="bg-[#161210] p-4 rounded border border-[#c4943a]/30 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6b5940] uppercase font-bold">Servicio:</span>
                <span className="text-[#f2e6cc] font-bold">{selectedService.name} ({fmt(selectedService.price)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b5940] uppercase font-bold">Barbero:</span>
                <span className="text-[#f2e6cc] font-bold">{selectedBarber.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b5940] uppercase font-bold">Fecha & Hora:</span>
                <span className="text-[#c4943a] font-bold">{selectedDay.dayName} {selectedDay.dayNum} {selectedDay.monthName} a las {selectedTime} hs</span>
              </div>
              <div className="pt-2 border-t border-[#c4943a]/20 flex justify-between font-bold text-sm text-[#c4943a]">
                <span>Seña 50% a Abonar Ahora:</span>
                <span>{fmt(depositAmount)}</span>
              </div>
            </div>

            {/* Customer Details Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#c4943a] uppercase mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full p-3 bg-[#161210] border border-[#c4943a]/30 rounded text-sm text-[#f2e6cc] focus:border-[#c4943a] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#c4943a] uppercase mb-1">Teléfono WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="Ej: 341 1234567"
                    className="w-full p-3 bg-[#161210] border border-[#c4943a]/30 rounded text-sm text-[#f2e6cc] focus:border-[#c4943a] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#c4943a] uppercase mb-1">Email (Opcional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="ejemplo@email.com"
                    className="w-full p-3 bg-[#161210] border border-[#c4943a]/30 rounded text-sm text-[#f2e6cc] focus:border-[#c4943a] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div>
              <label className="block text-xs font-bold text-[#c4943a] uppercase mb-3">Medio de Pago para la Seña</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mercadopago')}
                  className={`p-3 rounded border text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'mercadopago' ? 'bg-[#c4943a]/20 border-[#c4943a] text-[#c4943a]' : 'bg-[#161210] border-[#c4943a]/20 text-[#f2e6cc]/60'
                  }`}
                >
                  💳 Mercado Pago / Alias
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('efectivo')}
                  className={`p-3 rounded border text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'efectivo' ? 'bg-[#c4943a]/20 border-[#c4943a] text-[#c4943a]' : 'bg-[#161210] border-[#c4943a]/20 text-[#f2e6cc]/60'
                  }`}
                >
                  💵 Efectivo en Local
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('whatsapp')}
                  className={`p-3 rounded border text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'whatsapp' ? 'bg-[#c4943a]/20 border-[#c4943a] text-[#c4943a]' : 'bg-[#161210] border-[#c4943a]/20 text-[#f2e6cc]/60'
                  }`}
                >
                  📱 Coordinar WhatsApp
                </button>
              </div>
            </div>

            {/* Mercado Pago Alias Copy Box */}
            {paymentMethod === 'mercadopago' && (
              <div className="bg-[#161210] p-4 rounded border border-[#c4943a]/40 text-xs flex items-center justify-between">
                <div>
                  <div className="text-[#6b5940] uppercase font-bold text-[10px]">Alias MP:</div>
                  <div className="text-sm font-mono font-bold text-[#c4943a]">{MP_ALIAS}</div>
                  <div className="text-[10px] text-[#f2e6cc]/60">{MP_TITULAR}</div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAlias}
                  className="px-3 py-1.5 bg-[#c4943a] text-[#0d0b08] font-bold rounded text-[11px] hover:bg-[#e5b657]"
                >
                  Copiar Alias
                </button>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-4 px-6 bg-[#161210] border border-[#c4943a]/30 text-[#f2e6cc] text-xs font-bold rounded uppercase cursor-pointer"
              >
                ← Volver
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 bg-[#c4943a] hover:bg-[#e5b657] text-[#0d0b08] font-extrabold text-sm uppercase tracking-wider rounded transition-all cursor-pointer shadow disabled:opacity-50"
              >
                {isSubmitting ? 'Procesando Reserva...' : `Confirmar & Reservar por ${fmt(depositAmount)}`}
              </button>
            </div>

          </form>
        )}

        {/* STEP 4: VOUCHER TICKET DISPLAY */}
        {step === 4 && createdVoucher && (
          <div className="bg-[#0d0b08] p-8 rounded border border-[#c4943a] space-y-6 text-center animate-fadeIn shadow-2xl">
            
            <div className="w-16 h-16 bg-[#c4943a]/20 border border-[#c4943a] rounded-full flex items-center justify-center mx-auto text-3xl text-[#c4943a]">
              ✓
            </div>

            <div>
              <div className="text-xs font-bold text-[#c4943a] uppercase tracking-widest mb-1">
                ¡TURNO RESERVADO CON ÉXITO!
              </div>
              <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#f2e6cc]">
                Comprobante de Reserva #{createdVoucher.id}
              </h3>
            </div>

            {/* Voucher Card Details */}
            <div className="bg-[#161210] p-6 rounded border border-[#c4943a]/30 max-w-md mx-auto text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-[#c4943a]/20 pb-2">
                <span className="text-[#6b5940]">Cliente:</span>
                <span className="font-bold text-[#f2e6cc]">{createdVoucher.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-[#c4943a]/20 pb-2">
                <span className="text-[#6b5940]">Servicio:</span>
                <span className="font-bold text-[#f2e6cc]">{createdVoucher.serviceName}</span>
              </div>
              <div className="flex justify-between border-b border-[#c4943a]/20 pb-2">
                <span className="text-[#6b5940]">Barbero:</span>
                <span className="font-bold text-[#f2e6cc]">{createdVoucher.barberName}</span>
              </div>
              <div className="flex justify-between border-b border-[#c4943a]/20 pb-2">
                <span className="text-[#6b5940]">Fecha & Hora:</span>
                <span className="font-bold text-[#c4943a]">{createdVoucher.dateDisplay} a las {createdVoucher.time} hs</span>
              </div>
              <div className="flex justify-between border-b border-[#c4943a]/20 pb-2">
                <span className="text-[#6b5940]">Seña Registrada:</span>
                <span className="font-bold text-[#25d366]">{fmt(createdVoucher.depositPaid)}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm text-[#f2e6cc]">
                <span>Saldo a Abonar en Local:</span>
                <span>{fmt(createdVoucher.totalPrice - createdVoucher.depositPaid)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <button
                onClick={handleShareWhatsApp}
                className="px-6 py-3 bg-[#25d366] hover:bg-[#1ebd59] text-white font-extrabold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2"
              >
                <span>💬 Enviar por WhatsApp</span>
              </button>
              
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-[#161210] hover:bg-[#1a1410] border border-[#c4943a]/40 text-[#f2e6cc] font-bold text-xs uppercase tracking-wider rounded"
              >
                🖨️ Imprimir Ticket
              </button>
            </div>

            <button
              onClick={() => {
                setStep(1)
                setCreatedVoucher(null)
              }}
              className="text-xs text-[#c4943a] underline font-bold cursor-pointer"
            >
              + Reservar Otro Turno
            </button>

          </div>
        )}

      </div>
    </section>
  )
})

export default BookingWizard
