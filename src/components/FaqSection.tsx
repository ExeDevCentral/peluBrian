import React, { useState, memo } from 'react'
import { FAQ_ITEMS } from '../data/mockData'

const FaqSection: React.FC = memo(() => {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <section className="py-24 bg-[#161210] border-t border-[#c4943a]/20 relative cvis">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-xs font-extrabold tracking-[0.25em] text-[#c4943a] uppercase mb-3">
            RESPUESTAS RÁPIDAS
          </div>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-extrabold text-[#f2e6cc] mb-4">
            Preguntas Frecuentes
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIdx === idx

            return (
              <div
                key={idx}
                className="bg-[#0d0b08] rounded border border-[#c4943a]/20 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-['Playfair_Display'] text-base font-bold text-[#f2e6cc]">
                    {item.q}
                  </span>
                  <span className="text-[#c4943a] font-mono text-lg font-bold">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-xs text-[#f2e6cc]/70 leading-relaxed border-t border-[#c4943a]/10 pt-4 animate-fadeIn">
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
})

export default FaqSection
