import React, { memo } from 'react'
import { BARBERS } from '../data/mockData'

const TeamSection: React.FC = memo(() => {
  return (
    <section id="team" className="py-24 bg-[#161210] border-t border-[#c4943a]/20 relative cvis">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-extrabold tracking-[0.25em] text-[#c4943a] uppercase mb-3">
            EQUIPO PROFESIONAL
          </div>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#f2e6cc] mb-4">
            Maestros Barberos
          </h2>
          <p className="text-sm sm:text-base text-[#f2e6cc]/70">
            Años de experiencia combinada en barbería clásica, degradés modernos y escultura artesanal de barba.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BARBERS.filter(b => b.id !== 'any').map((barber) => (
            <div
              key={barber.id}
              className="bg-[#0d0b08] rounded border border-[#c4943a]/20 hover:border-[#c4943a]/60 transition-all p-6 text-center group shadow-xl"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 border-2 border-[#c4943a]/40 group-hover:border-[#c4943a] transition-all">
                <img
                  src={barber.avatar}
                  alt={barber.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="text-xs font-bold text-[#c4943a] uppercase tracking-wider mb-1">
                {barber.specialty}
              </div>

              <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#f2e6cc] mb-2">
                {barber.name}
              </h3>

              <div className="inline-flex items-center gap-1 text-xs font-bold bg-[#161210] px-3 py-1 rounded-full border border-[#c4943a]/30 text-[#c4943a]">
                <span>{barber.rating}</span>
                <span>★★★★★</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
})

export default TeamSection
