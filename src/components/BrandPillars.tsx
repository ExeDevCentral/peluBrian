import React, { memo } from 'react'

const BrandPillars: React.FC = memo(() => {
  return (
    <section className="bg-[#161210] border-y border-[#c4943a]/20 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Pillar 1 */}
        <div className="flex items-start gap-4 p-4 rounded bg-[#1a1410]/50 border border-[#c4943a]/10">
          <div className="text-3xl p-3 bg-[#0d0b08] rounded border border-[#c4943a]/30">💈</div>
          <div>
            <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#f2e6cc] mb-1">Cortes & Ritual Tradicional</h3>
            <p className="text-xs text-[#f2e6cc]/70 leading-relaxed">
              Técnicas ancestrales de afeitado con navaja de barbero, toallas calientes y acabado pulido a tijera.
            </p>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="flex items-start gap-4 p-4 rounded bg-[#1a1410]/50 border border-[#c4943a]/10">
          <div className="text-3xl p-3 bg-[#0d0b08] rounded border border-[#c4943a]/30">🧴</div>
          <div>
            <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#f2e6cc] mb-1">Cosmética Masculina Premium</h3>
            <p className="text-xs text-[#f2e6cc]/70 leading-relaxed">
              Línea propia de pomadas, geles y aceites botánicos formulados especialmente para el cuidado del hombre.
            </p>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="flex items-start gap-4 p-4 rounded bg-[#1a1410]/50 border border-[#c4943a]/10">
          <div className="text-3xl p-3 bg-[#0d0b08] rounded border border-[#c4943a]/30">⚡</div>
          <div>
            <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#f2e6cc] mb-1">Turnos Sin Esperas</h3>
            <p className="text-xs text-[#f2e6cc]/70 leading-relaxed">
              Sistema de reservas online con confirmación instantánea por WhatsApp, recordatorios y puntualidad garantizada.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
})

export default BrandPillars
