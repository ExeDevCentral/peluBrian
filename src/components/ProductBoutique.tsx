import React, { useState, memo } from 'react'
import { HAIR_PRODUCTS, fmt } from '../data/mockData'
import { HairProduct } from '../types'

interface ProductBoutiqueProps {
  onAddToCart: (product: HairProduct) => void
}

const ProductBoutique: React.FC<ProductBoutiqueProps> = memo(({ onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const categories = ['TODOS', 'Cremas & Pomadas', 'Geles', 'Ceras', 'Aceites & Bálsamos']

  const filteredProducts = HAIR_PRODUCTS.filter(p => {
    const matchesCategory = selectedCategory === 'TODOS' || p.category === selectedCategory
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <section id="products" className="py-24 bg-[#0d0b08] border-t border-[#c4943a]/20 relative cvis">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-extrabold tracking-[0.25em] text-[#c4943a] uppercase mb-3">
            COSMÉTICA MASCULINA EXCLUSIVA
          </div>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#f2e6cc] mb-4">
            Boutique Capilar Porteña
          </h2>
          <p className="text-sm sm:text-base text-[#f2e6cc]/70">
            Formulaciones artesanales para el peinado y nutrición capilar diaria. Retirá en local o recibí a domicilio.
          </p>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 max-w-4xl mx-auto">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto max-w-full pb-2 scrollbar-thin">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#c4943a] text-[#0d0b08]'
                    : 'bg-[#161210] text-[#f2e6cc]/70 border border-[#c4943a]/20 hover:border-[#c4943a]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full pl-9 pr-4 py-2 bg-[#161210] border border-[#c4943a]/30 rounded text-xs text-[#f2e6cc] outline-none focus:border-[#c4943a]"
            />
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-[#6b5940]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-[#161210] rounded border border-[#c4943a]/20 hover:border-[#c4943a]/60 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
            >
              {/* Product Image */}
              <div className="relative h-64 overflow-hidden bg-[#1a1410]">
                <img
                  src={prod.image}
                  alt={prod.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 bg-[#0d0b08]/80 backdrop-blur border border-[#c4943a]/40 text-[#c4943a] text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                  {prod.category}
                </span>
              </div>

              {/* Product Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#f2e6cc] mb-2">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-[#f2e6cc]/70 leading-relaxed mb-4">
                    {prod.description}
                  </p>
                  
                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#0d0b08] p-3 rounded border border-[#c4943a]/15 mb-4">
                    <div>
                      <span className="text-[#6b5940] block font-bold">Fijación:</span>
                      <span className="text-[#c4943a] font-semibold">{prod.hold}</span>
                    </div>
                    <div>
                      <span className="text-[#6b5940] block font-bold">Brillo:</span>
                      <span className="text-[#c4943a] font-semibold">{prod.shine}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Price & Add Button */}
                <div className="flex items-center justify-between pt-4 border-t border-[#c4943a]/20">
                  <div className="font-['Playfair_Display'] text-2xl font-extrabold text-[#c4943a]">
                    {fmt(prod.price)}
                  </div>

                  <button
                    onClick={() => onAddToCart(prod)}
                    className="px-4 py-2.5 bg-[#c4943a] hover:bg-[#e5b657] text-[#0d0b08] font-extrabold text-xs uppercase tracking-wider rounded transition-all flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <span>+ Agregar</span>
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

export default ProductBoutique
