import React, { useState, useCallback } from 'react'

// Subcomponents
import HeaderNavbar from './components/HeaderNavbar'
import HeroSection from './components/HeroSection'
import BrandPillars from './components/BrandPillars'
import HaircutCatalog from './components/HaircutCatalog'
import AiVisagismoModal from './components/AiVisagismoModal'
import ServicesSection from './components/ServicesSection'
import BookingWizard from './components/BookingWizard'
import ProductBoutique from './components/ProductBoutique'
import CartDrawer from './components/CartDrawer'
import TeamSection from './components/TeamSection'
import TestimonialsSection from './components/TestimonialsSection'
import FaqSection from './components/FaqSection'
import LocationFooter from './components/LocationFooter'
import ToastNotification from './components/ToastNotification'
import AdminPanel, { AdminReservation } from './components/AdminPanel'

// Types & Hooks & Data
import { HairStyle, Service, HairProduct, CartItem, Reservation, Toast, HairId } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { SERVICES } from './data/mockData'

export default function App() {
  // Reactive LocalStorage Persistence
  const [cart, setCart] = useLocalStorage<CartItem[]>('peluqueria_brian_cart', [])
  const [reservations, setReservations] = useLocalStorage<Reservation[]>('peluqueria_brian_reservations', [])

  // Modals & UI States
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Booking Preselections
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<HairStyle | null>(null)

  // AI Visagismo Initial Style state
  const [aiInitialStyleId, setAiInitialStyleId] = useState<HairId>('pompadour')

  // Toast System
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast['type'] = 'gold') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Navigation Handler
  const handleNavigate = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // Cart Operations
  const handleAddToCart = useCallback((product: HairProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, image: product.image }]
    })
    addToast(`"${product.name}" agregado al carrito.`, 'success')
  }, [setCart, addToast])

  const handleUpdateQty = useCallback((id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter(item => item.qty > 0)
    )
  }, [setCart])

  const handleRemoveItem = useCallback((id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }, [setCart])

  const handleCheckoutCart = useCallback(() => {
    if (cart.length === 0) return
    const textLines = cart.map(i => `• ${i.name} x${i.qty} ($ ${i.price * i.qty})`)
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
    const message = `💈 *PEDIDO BOUTIQUE CAPILAR - PELUQUERÍA BRIAN*\n\n${textLines.join('\n')}\n\n*Total Estimado:* $ ${total.toLocaleString('es-AR')}\n\nHola, me gustaría coordinar el retiro/envío de estos productos.`
    window.open(`https://wa.me/5493410000000?text=${encodeURIComponent(message)}`, '_blank')
  }, [cart])

  // Catalog & Visagismo Interaction
  const handleSelectStyleFromCatalog = useCallback((style: HairStyle) => {
    setSelectedStyle(style)
    const matchedService = SERVICES.find(s => s.name.includes('Corte')) || SERVICES[0]
    setSelectedService(matchedService)
    handleNavigate('booking')
    addToast(`Seleccionaste el corte ${style.name}. Elijé tu barbero y fecha.`, 'gold')
  }, [handleNavigate, addToast])

  const handleTryStyleOnAi = useCallback((styleId: string) => {
    setAiInitialStyleId(styleId as HairId)
    handleNavigate('visagismo')
  }, [handleNavigate])

  const handleBookWithStyle = useCallback((style: HairStyle) => {
    setSelectedStyle(style)
    const matchedService = SERVICES.find(s => s.name.includes('Corte')) || SERVICES[0]
    setSelectedService(matchedService)
    handleNavigate('booking')
    addToast(`Estilo ${style.name} cargado en la reserva.`, 'gold')
  }, [handleNavigate, addToast])

  const handleSelectServiceFromMenu = useCallback((service: Service) => {
    setSelectedService(service)
    handleNavigate('booking')
    addToast(`Servicio "${service.name}" seleccionado.`, 'gold')
  }, [handleNavigate, addToast])

  // Reservations Operation
  const handleSaveReservation = useCallback((newReservation: Reservation) => {
    setReservations(prev => [newReservation, ...prev])
  }, [setReservations])

  // Admin Reservations Adaptor & Status update
  const handleUpdateReservationStatus = useCallback((id: string, newStatus: AdminReservation['status']) => {
    setReservations(prev =>
      prev.map(r => r.id === id ? { ...r, paymentMethod: r.paymentMethod } : r)
    )
  }, [setReservations])

  const adminReservations: AdminReservation[] = reservations.map(r => ({
    id: r.id,
    serviceName: r.serviceName,
    barberName: r.barberName,
    customerName: r.customerName || 'Cliente',
    customerPhone: r.customerPhone || '',
    dateDisplay: r.dateDisplay,
    time: r.time,
    totalPrice: r.totalPrice,
    depositPaid: r.depositPaid,
    status: 'CONFIRMADO',
  }))

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  return (
    <div className="min-h-screen bg-[#0d0b08] text-[#f2e6cc] font-['Work_Sans',sans-serif] selection:bg-[#c4943a] selection:text-[#0d0b08]">
      
      {/* Header Navigation */}
      <HeaderNavbar
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onNavigate={handleNavigate}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Sections */}
      <main>
        <HeroSection onNavigate={handleNavigate} />
        
        <BrandPillars />

        <HaircutCatalog
          onSelectStyle={handleSelectStyleFromCatalog}
          onTryStyleOnAi={handleTryStyleOnAi}
        />

        <AiVisagismoModal
          initialStyleId={aiInitialStyleId}
          onBookWithStyle={handleBookWithStyle}
          onAddToast={addToast}
        />

        <ServicesSection onSelectService={handleSelectServiceFromMenu} />

        <BookingWizard
          preselectedService={selectedService}
          preselectedStyle={selectedStyle}
          existingReservations={reservations}
          onSaveReservation={handleSaveReservation}
          onAddToast={addToast}
        />

        <ProductBoutique onAddToCart={handleAddToCart} />

        <TeamSection />

        <TestimonialsSection />

        <FaqSection />
      </main>

      {/* Footer */}
      <LocationFooter />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckoutCart}
      />

      {/* Admin Panel Modal */}
      {isAdminOpen && (
        <AdminPanel
          reservations={adminReservations}
          onUpdateStatus={handleUpdateReservationStatus}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* Toast Notifications System */}
      <ToastNotification toasts={toasts} onRemove={removeToast} />

      {/* Sticky Mobile CTA Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0b08]/95 backdrop-blur border-t border-[#c4943a]/40 p-3 bottom-cta-safe flex items-center gap-2 shadow-2xl">
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative px-4 py-3 bg-[#161210] border border-[#c4943a]/40 text-[#f2e6cc] font-bold text-xs rounded flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>🛒</span>
          {cartCount > 0 && (
            <span className="bg-[#c4943a] text-[#0d0b08] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => handleNavigate('booking')}
          className="flex-1 py-3 bg-[#c4943a] hover:bg-[#e5b657] text-[#0d0b08] font-extrabold text-xs uppercase tracking-wider rounded text-center shadow-lg cursor-pointer"
        >
          📅 RESERVAR TURNO AHORA
        </button>
      </div>

    </div>
  )
}
