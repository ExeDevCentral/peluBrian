import React, { memo } from 'react'

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void
}

const HeroSection: React.FC<HeroSectionProps> = memo(({ onNavigate }) => {
  return (
    <section id="hero" className="relative min-h-[92vh] md:min-h-screen flex items-end overflow-hidden bg-[#0d0b08]">
      
      {/* Background Hero Cover Photo */}
      <img
        src="https://images.unsplash.com/photo-1759134155377-4207d89b39ec?w=1800&h=1000&fit=crop&auto=format&crop=top"
        alt="Peluquería Brian — Barbería Boutique Rosario"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-[center_20%] scale-105 transition-transform duration-1000"
      />

      {/* Dark Luxury Gradient Overlays for High Contrast Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b08] via-[#0d0b08]/75 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b08]/90 via-[#0d0b08]/50 to-transparent" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 md:pb-24 pt-32 w-full">
        
        {/* Top Location Badge */}
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-[1px] bg-[#c4943a]" />
          <span className="text-[11px] font-extrabold tracking-[0.35em] text-[#c4943a] uppercase">
            Calle Urquiza 1315, Rosario • Est. 1947
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="font-['Playfair_Display'] text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#f2e6cc] leading-[0.98] tracking-tight mb-6 max-w-4xl">
          El Arte del<br />
          <em className="text-[#c4943a] not-italic bg-gradient-to-r from-[#c4943a] via-[#e5b657] to-[#a87830] bg-clip-text text-transparent">
            Caballero
          </em><br />
          Rosarino
        </h1>

        {/* Subtitle */}
        <p className="font-['Lora',serif] text-base sm:text-lg md:text-xl text-[#f2e6cc]/85 max-w-2xl leading-relaxed mb-8">
          Subí tu foto para recibir la recomendación de corte ideal con nuestro Escáner de Visión por IA, reservá tu turno para hoy o esta semana y adquirí los mejores geles y pomadas.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-lg mb-12">
          <button
            onClick={() => onNavigate('booking')}
            className="px-8 py-4 bg-[#c4943a] hover:bg-[#e5b657] text-[#0d0b08] font-extrabold text-xs uppercase tracking-[0.15em] rounded transition-all transform hover:-translate-y-0.5 shadow-xl shadow-[#c4943a]/25 cursor-pointer text-center"
          >
            📅 Reservar Turno en Rosario
          </button>
          
          <button
            onClick={() => onNavigate('visagismo')}
            className="px-8 py-4 bg-[#161210]/90 backdrop-blur hover:bg-[#1a1410] text-[#f2e6cc] border border-[#c4943a]/50 hover:border-[#c4943a] font-bold text-xs uppercase tracking-[0.15em] rounded transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
          >
            <span>✨ Probador de Corte (IA)</span>
          </button>
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-[#c4943a]/20 max-w-3xl">
          <div>
            <div className="font-['Playfair_Display'] text-2xl font-bold text-[#c4943a]">1947</div>
            <div className="text-[10px] text-[#6b5940] uppercase font-bold tracking-widest mt-0.5">Tradición Porteña</div>
          </div>
          <div>
            <div className="font-['Playfair_Display'] text-2xl font-bold text-[#c4943a]">5.0 ★</div>
            <div className="text-[10px] text-[#6b5940] uppercase font-bold tracking-widest mt-0.5">Valoración Clientes</div>
          </div>
          <div>
            <div className="font-['Playfair_Display'] text-2xl font-bold text-[#c4943a]">100%</div>
            <div className="text-[10px] text-[#6b5940] uppercase font-bold tracking-widest mt-0.5">Atención Personalizada</div>
          </div>
          <div>
            <div className="font-['Playfair_Display'] text-2xl font-bold text-[#c4943a]">IA 3D</div>
            <div className="text-[10px] text-[#6b5940] uppercase font-bold tracking-widest mt-0.5">Simulador de Corte</div>
          </div>
        </div>

      </div>
    </section>
  )
})

export default HeroSection
