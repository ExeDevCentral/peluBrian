import React, { memo } from 'react'

interface HeaderNavbarProps {
  cartCount: number
  onOpenCart: () => void
  onOpenAdmin: () => void
  onNavigate: (sectionId: string) => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const HeaderNavbar: React.FC<HeaderNavbarProps> = memo(({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onNavigate,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0b08]/90 backdrop-blur-md border-b border-[#c4943a]/20 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LOGO */}
        <button
          onClick={() => onNavigate('hero')}
          className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full border border-[#c4943a]/40 bg-[#161210] flex items-center justify-center text-[#c4943a] text-xl font-black group-hover:border-[#c4943a] group-hover:scale-105 transition-all">
            🦉
          </div>
          <div>
            <div className="font-['Playfair_Display'] text-lg font-bold tracking-wide text-[#f2e6cc] group-hover:text-[#c4943a] transition-colors leading-tight">
              PELUQUERÍA BRIAN
            </div>
            <div className="text-[9px] tracking-[0.25em] text-[#c4943a] uppercase font-semibold">
              El Búho Dorado • Est. 1947
            </div>
          </div>
        </button>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider text-[#f2e6cc]/80">
          <button onClick={() => onNavigate('catalog')} className="hover:text-[#c4943a] transition-colors cursor-pointer uppercase">
            Cortes Exclusivos
          </button>
          <button onClick={() => onNavigate('visagismo')} className="hover:text-[#c4943a] transition-colors cursor-pointer uppercase flex items-center gap-1.5">
            <span className="text-[#c4943a]">✨</span> Probador IA
          </button>
          <button onClick={() => onNavigate('services')} className="hover:text-[#c4943a] transition-colors cursor-pointer uppercase">
            Servicios
          </button>
          <button onClick={() => onNavigate('booking')} className="hover:text-[#c4943a] transition-colors cursor-pointer uppercase text-[#c4943a]">
            Reservar Turno
          </button>
          <button onClick={() => onNavigate('products')} className="hover:text-[#c4943a] transition-colors cursor-pointer uppercase">
            Boutique Capilar
          </button>
          <button onClick={() => onNavigate('team')} className="hover:text-[#c4943a] transition-colors cursor-pointer uppercase">
            Barberos
          </button>
        </div>

        {/* ACTIONS (CART & ADMIN & MOBILE TOGGLE) */}
        <div className="flex items-center gap-4">
          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded bg-[#161210] border border-[#c4943a]/30 text-[#f2e6cc] hover:border-[#c4943a] hover:text-[#c4943a] transition-all cursor-pointer"
            title="Ver Carrito de Compras"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#c4943a] text-[#0d0b08] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Lock Button */}
          <button
            onClick={onOpenAdmin}
            className="p-2 rounded bg-[#161210] border border-[#c4943a]/30 text-[#6b5940] hover:text-[#c4943a] hover:border-[#c4943a] transition-all cursor-pointer"
            title="Acceso Administración Local"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 text-[#f2e6cc] focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-[#c4943a]/20 flex flex-col gap-3 text-sm font-semibold tracking-wider text-[#f2e6cc] bg-[#161210]/95 p-4 rounded border">
          <button onClick={() => { onNavigate('catalog'); setIsMobileMenuOpen(false) }} className="py-2 text-left hover:text-[#c4943a]">
            Cortes Exclusivos
          </button>
          <button onClick={() => { onNavigate('visagismo'); setIsMobileMenuOpen(false) }} className="py-2 text-left hover:text-[#c4943a] text-[#c4943a]">
            ✨ Probador con IA
          </button>
          <button onClick={() => { onNavigate('services'); setIsMobileMenuOpen(false) }} className="py-2 text-left hover:text-[#c4943a]">
            Servicios & Rituales
          </button>
          <button onClick={() => { onNavigate('booking'); setIsMobileMenuOpen(false) }} className="py-2 text-left hover:text-[#c4943a]">
            Reservar Turno
          </button>
          <button onClick={() => { onNavigate('products'); setIsMobileMenuOpen(false) }} className="py-2 text-left hover:text-[#c4943a]">
            Boutique Capilar
          </button>
          <button onClick={() => { onNavigate('team'); setIsMobileMenuOpen(false) }} className="py-2 text-left hover:text-[#c4943a]">
            Nuestros Barberos
          </button>
        </div>
      )}
    </nav>
  )
})

export default HeaderNavbar
