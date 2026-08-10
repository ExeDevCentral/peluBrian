import React, { memo } from 'react'
import { HAIR_STYLES, fmt } from '../data/mockData'
import { HairStyle } from '../types'

interface HaircutCatalogProps {
  onSelectStyle: (style: HairStyle) => void
  onTryStyleOnAi: (styleId: string) => void
}

const HaircutCatalog: React.FC<HaircutCatalogProps> = memo(({ onSelectStyle, onTryStyleOnAi }) => {
  return (
    <section id="catalog" className="py-24 bg-[#0d0b08] relative cvis">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-extrabold tracking-[0.25em] text-[#c4943a] uppercase mb-3">
            CATÁLOGO DE ESTILOS & TENDENCIAS
          </div>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#f2e6cc] mb-4">
            Cortes Exclusivos Porteños
          </h2>
          <p className="text-sm sm:text-base text-[#f2e6cc]/70">
            Pasa el cursor (o toca en móviles) sobre cada tarjeta para revelar los detalles del corte, productos recomendados y el probador virtual con IA.
          </p>
        </div>

        {/* Grid of Hover Reveal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {HAIR_STYLES.map((style) => (
            <div
              key={style.id}
              className="reveal-card h-[460px] flex flex-col justify-end group cursor-pointer border border-[#c4943a]/20 hover:border-[#c4943a] transition-all"
            >
              {/* Background Art / Card Base */}
              <div className="absolute inset-0 bg-[#161210] overflow-hidden">
                <div 
                  className="w-full h-full bg-cover bg-center reveal-card-img opacity-85 transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: style.id === 'pompadour' 
                      ? 'url(https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=800&fit=crop&q=80)'
                      : style.id === 'clasico'
                      ? 'url(https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&fit=crop&q=80)'
                      : style.id === 'undercut'
                      ? 'url(https://images.unsplash.com/photo-1517832606589-715746203e50?w=800&fit=crop&q=80)'
                      : style.id === 'fade_low'
                      ? 'url(https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=800&fit=crop&q=80)'
                      : style.id === 'slickback'
                      ? 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&fit=crop&q=80)'
                      : 'url(https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&fit=crop&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b08] via-[#0d0b08]/50 to-transparent" />
              </div>

              {/* Shimmer Effect */}
              <div className="shimmer-effect" />

              {/* Visible Header Tag (Default state before full reveal) */}
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-[#c4943a] text-[#0d0b08] rounded">
                    {style.tag}
                  </span>
                  <span className="text-sm font-bold text-[#c4943a] font-mono">
                    {fmt(style.price)}
                  </span>
                </div>
                <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#f2e6cc]">
                  {style.name}
                </h3>
                <p className="text-xs text-[#f2e6cc]/80 font-medium">
                  {style.subtitle}
                </p>
              </div>

              {/* Slide Up Reveal Overlay */}
              <div className="reveal-overlay-slide reveal-content-stagger z-20">
                <div className="text-[10px] font-bold tracking-widest text-[#c4943a] uppercase mb-1">
                  DETALLES DEL CORTE • {style.duration}
                </div>
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#f2e6cc] mb-2">
                  {style.name}
                </h3>
                <p className="text-xs text-[#f2e6cc]/80 leading-relaxed mb-4">
                  {style.description}
                </p>

                {/* Features List */}
                <div className="space-y-1 mb-4">
                  {style.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-[#f2e6cc]/90">
                      <span className="text-[#c4943a]">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Recommended Product Note */}
                <div className="bg-[#161210]/80 p-2.5 rounded border border-[#c4943a]/20 mb-4 text-[11px]">
                  <span className="text-[#c4943a] font-bold">Recomendado: </span>
                  <span className="text-[#f2e6cc]/80">{style.recommendedProduct}</span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#c4943a]/20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onTryStyleOnAi(style.id)
                    }}
                    className="px-3 py-2 bg-[#161210] hover:bg-[#1a1410] text-[#c4943a] border border-[#c4943a]/40 hover:border-[#c4943a] rounded text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1"
                  >
                    <span>✨ Probar IA</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectStyle(style)
                    }}
                    className="px-3 py-2 bg-[#c4943a] hover:bg-[#e5b657] text-[#0d0b08] rounded text-[11px] font-extrabold uppercase transition-all shadow"
                  >
                    Reservar Este
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
})

export default HaircutCatalog
