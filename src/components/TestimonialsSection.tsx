import React, { memo } from 'react'
import { TESTIMONIALS } from '../data/mockData'

const TestimonialsSection: React.FC = memo(() => {
  return (
    <section className="py-24 bg-[#0d0b08] border-t border-[#c4943a]/20 relative cvis">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-extrabold tracking-[0.25em] text-[#c4943a] uppercase mb-3">
            RESEÑAS REALES DE GOOGLE & WHATSAPP
          </div>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#f2e6cc] mb-4">
            Lo que Dicen Nuestros Clientes
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-[#161210] p-8 rounded border border-[#c4943a]/20 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[#c4943a] text-sm">★★★★★</div>
                  <span className="text-[10px] font-bold bg-[#c4943a]/15 text-[#c4943a] px-2 py-0.5 rounded uppercase">
                    {t.tag}
                  </span>
                </div>

                <p className="text-xs text-[#f2e6cc]/80 italic leading-relaxed mb-6">
                  "{t.text}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#c4943a]/15">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-[#c4943a]/40" />
                <div>
                  <div className="text-xs font-bold text-[#f2e6cc]">{t.name}</div>
                  <div className="text-[10px] text-[#6b5940]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
})

export default TestimonialsSection
