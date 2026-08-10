import React, { memo } from 'react'

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void
}

const HeroSection: React.FC<HeroSectionProps> = memo(({ onNavigate }) => {
  return (
    <section id="hero" className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-[#0d0b08]">
      
      {/* Background Graphic Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,#c4943a_0,transparent_60%)]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a1410] border border-[#c4943a]/40 mb-6 text-xs text-[#c4943a] font-bold tracking-widest uppercase">
          <span>💈 BARBERÍA CLÁSICA & SIMULADOR IA</span>
        </div>

        {/* Title */}
        <h1 className="font-['Playfair_Display'] text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#f2e6cc] leading-[1.1] mb-6 max-w-4xl mx-auto">
          Cortes Tradicionales,<br />
          <span className="bg-gradient-to-r from-[#c4943a] via-[#e5b657] to-[#a87830] bg-clip-text text-transparent">
            Estilo Atemporal
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-[#f2e6cc]/80 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          Peluquería Brian rinde homenaje al arte del afeitado tradicional a navaja, cortes ejecutivos de precisión y cosmética masculina de excelencia.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={() => onNavigate('booking')}
            className="w-full sm:w-auto px-8 py-4 bg-[#c4943a] hover:bg-[#e5b657] text-[#0d0b08] font-extrabold text-sm uppercase tracking-wider rounded transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#c4943a]/20 cursor-pointer"
          >
            Reservar Turno Ahora
          </button>
          
          <button
            onClick={() => onNavigate('visagismo')}
            className="w-full sm:w-auto px-8 py-4 bg-[#161210] hover:bg-[#1a1410] text-[#f2e6cc] border border-[#c4943a]/40 hover:border-[#c4943a] font-bold text-sm uppercase tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>✨ Probador IA</span>
          </button>
        </div>

        {/* Quick Highlights / Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto pt-10 border-t border-[#c4943a]/20 text-center">
          <div>
            <div className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold text-[#c4943a]">1947</div>
            <div className="text-xs text-[#6b5940] uppercase font-semibold tracking-wider mt-1">Tradición Porteña</div>
          </div>
          <div>
            <div className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold text-[#c4943a]">5.0 ★</div>
            <div className="text-xs text-[#6b5940] uppercase font-semibold tracking-wider mt-1">Calificación Promedio</div>
          </div>
          <div>
            <div className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold text-[#c4943a]">100%</div>
            <div className="text-xs text-[#6b5940] uppercase font-semibold tracking-wider mt-1">Garantía de Satisfacción</div>
          </div>
          <div>
            <div className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold text-[#c4943a]">IA 3D</div>
            <div className="text-xs text-[#6b5940] uppercase font-semibold tracking-wider mt-1">Visagismo Digital</div>
          </div>
        </div>

      </div>
    </section>
  )
})

export default HeroSection
