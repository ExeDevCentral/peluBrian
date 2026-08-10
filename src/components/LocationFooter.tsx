import React, { memo } from 'react'

const LocationFooter: React.FC = memo(() => {
  return (
    <footer className="bg-[#0d0b08] border-t border-[#c4943a]/30 pt-16 pb-12 text-[#f2e6cc]/80">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        
        {/* Col 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#c4943a] bg-[#161210] flex items-center justify-center text-[#c4943a] text-xl font-black">
              🦉
            </div>
            <div>
              <div className="font-['Playfair_Display'] text-lg font-bold text-[#f2e6cc] leading-tight">
                PELUQUERÍA BRIAN
              </div>
              <div className="text-[9px] tracking-[0.2em] text-[#c4943a] uppercase font-semibold">
                El Búho Dorado • Est. 1947
              </div>
            </div>
          </div>
          <p className="text-xs text-[#f2e6cc]/60 leading-relaxed">
            Barbería clásica porteña especializada en cortes de caballero, afeitado con toalla caliente y visagismo antropométrico con IA.
          </p>
        </div>

        {/* Col 2: Hours */}
        <div>
          <h4 className="font-['Playfair_Display'] text-base font-bold text-[#c4943a] mb-4 uppercase tracking-wider">
            Horarios de Atención
          </h4>
          <ul className="text-xs space-y-2">
            <li className="flex justify-between border-b border-[#c4943a]/15 pb-1">
              <span>Lunes a Viernes:</span>
              <span className="font-bold text-[#f2e6cc]">09:30 - 20:00 hs</span>
            </li>
            <li className="flex justify-between border-b border-[#c4943a]/15 pb-1">
              <span>Sábados:</span>
              <span className="font-bold text-[#f2e6cc]">09:00 - 20:30 hs</span>
            </li>
            <li className="flex justify-between text-[#6b5940]">
              <span>Domingos:</span>
              <span>Cerrado</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Location */}
        <div>
          <h4 className="font-['Playfair_Display'] text-base font-bold text-[#c4943a] mb-4 uppercase tracking-wider">
            Ubicación & Contacto
          </h4>
          <div className="text-xs space-y-3">
            <p className="flex items-start gap-2">
              <span>📍</span>
              <span>Calle Urquiza 1315, Rosario, Santa Fe</span>
            </p>
            <p className="flex items-center gap-2">
              <span>📞</span>
              <span>+54 9 341 000-0000</span>
            </p>
            <p className="flex items-center gap-2">
              <span>✉️</span>
              <span>contacto@peluqueriabrian.com.ar</span>
            </p>
          </div>
        </div>

        {/* Col 4: Map Embed Mock / Social */}
        <div>
          <h4 className="font-['Playfair_Display'] text-base font-bold text-[#c4943a] mb-4 uppercase tracking-wider">
            Visítanos en Rosario
          </h4>
          <div className="w-full h-32 rounded bg-[#161210] border border-[#c4943a]/20 overflow-hidden relative group">
            <iframe
              title="Ubicación Peluquería Brian"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3348.1!2d-60.64!3d-32.94!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDU2JzI0LjAiUyA2MMKwMzgnMjQuMCJX!5e0!3m2!1ses!2sar!4v1600000000000!5m2!1ses!2sar"
              className="w-full h-full border-0 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b08] to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2 text-[10px] font-bold text-[#c4943a]">
              Urquiza 1315, Rosario
            </div>
          </div>
        </div>

      </div>

      {/* Subfooter Copyright */}
      <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-[#c4943a]/15 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6b5940]">
        <div>
          © {new Date().getFullYear()} Peluquería Brian. Todos los derechos reservados.
        </div>
        <div className="mt-2 sm:mt-0 font-mono">
          Desarrollado con React 19 & Tailwind CSS v4
        </div>
      </div>
    </footer>
  )
})

export default LocationFooter
