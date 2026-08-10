import React, { memo } from 'react'
import { SERVICES, fmt } from '../data/mockData'
import { Service } from '../types'

interface ServicesSectionProps {
  onSelectService: (service: Service) => void
}

const ServicesSection: React.FC<ServicesSectionProps> = memo(({ onSelectService }) => {
  return (
    <section id="services" className="py-24 bg-[#0d0b08] relative cvis">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-extrabold tracking-[0.25em] text-[#c4943a] uppercase mb-3">
            RITUALES & CUIDADO PERSONAL
          </div>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#f2e6cc] mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-sm sm:text-base text-[#f2e6cc]/70">
            Cada servicio incluye bebida de cortesía (café expreso o cerveza artesanal), asesoría de visagismo y aplicación de productos premium.
          </p>
        </div>

        {/* Services Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SERVICES.map((srv) => {
            const deposit = srv.price * srv.depositPct

            return (
              <div
                key={srv.id}
                className={`p-8 rounded bg-[#161210] border transition-all flex flex-col justify-between relative ${
                  srv.popular ? 'border-[#c4943a] shadow-lg shadow-[#c4943a]/10' : 'border-[#c4943a]/20 hover:border-[#c4943a]/50'
                }`}
              >
                {srv.popular && (
                  <span className="absolute -top-3 right-6 bg-[#c4943a] text-[#0d0b08] text-[10px] font-black tracking-widest px-3 py-1 rounded uppercase">
                    MÁS SOLICITADO
                  </span>
                )}

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#f2e6cc] mb-1">
                        {srv.name}
                      </h3>
                      <div className="text-xs text-[#c4943a] font-semibold">
                        ⏱ Duración: {srv.duration}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-['Playfair_Display'] text-3xl font-extrabold text-[#c4943a]">
                        {fmt(srv.price)}
                      </div>
                      <div className="text-[10px] text-[#6b5940] uppercase font-bold">
                        Seña online: {fmt(deposit)}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#f2e6cc]/80 leading-relaxed mb-6">
                    {srv.desc}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#c4943a]/15 flex items-center justify-between">
                  <div className="text-[11px] text-[#f2e6cc]/60 flex items-center gap-2">
                    <span className="text-[#25d366]">✓</span> Bebida de cortesía incluida
                  </div>

                  <button
                    onClick={() => onSelectService(srv)}
                    className="px-6 py-3 bg-[#c4943a] hover:bg-[#e5b657] text-[#0d0b08] font-extrabold text-xs uppercase tracking-wider rounded transition-all shadow cursor-pointer"
                  >
                    Reservar Este Servicio
                  </button>
                </div>

              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
})

export default ServicesSection
