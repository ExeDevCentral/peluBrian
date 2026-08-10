import React, { memo } from 'react'
import { fmt } from '../data/mockData'
import { CartItem } from '../types'

interface CartDrawerProps {
  isOpen: boolean
  cart: CartItem[]
  onClose: () => void
  onUpdateQty: (id: string, delta: number) => void
  onRemoveItem: (id: string) => void
  onCheckout: () => void
}

const CartDrawer: React.FC<CartDrawerProps> = memo(({
  isOpen,
  cart,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#0d0b08]/80 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#161210] border-l border-[#c4943a]/30 shadow-2xl flex flex-col justify-between p-6">
          
          {/* Cart Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#c4943a]/20 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛍️</span>
                <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#f2e6cc]">
                  Tu Carrito Capilar
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-[#6b5940] hover:text-[#f2e6cc] text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="text-center py-16 text-[#6b5940]">
                <div className="text-4xl mb-3">🛒</div>
                <p className="text-sm font-semibold">Tu carrito está vacío</p>
                <p className="text-xs text-[#f2e6cc]/40 mt-1">Explora nuestra boutique capilar y agrega tus productos preferidos.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#0d0b08] rounded border border-[#c4943a]/20 flex items-center justify-between gap-3"
                  >
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded border border-[#c4943a]/30" />
                    )}

                    <div className="flex-1">
                      <div className="text-xs font-bold text-[#f2e6cc] leading-tight mb-1">
                        {item.name}
                      </div>
                      <div className="text-xs text-[#c4943a] font-mono font-bold">
                        {fmt(item.price)}
                      </div>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 bg-[#161210] border border-[#c4943a]/20 rounded px-2 py-1">
                      <button
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="text-xs text-[#c4943a] font-bold px-1 hover:text-[#f2e6cc]"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold text-[#f2e6cc]">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="text-xs text-[#c4943a] font-bold px-1 hover:text-[#f2e6cc]"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-400 hover:text-red-300 text-xs p-1 cursor-pointer"
                      title="Eliminar del carrito"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer Total & Checkout */}
          {cart.length > 0 && (
            <div className="pt-6 border-t border-[#c4943a]/20 space-y-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-[#f2e6cc]">Total Estimado:</span>
                <span className="font-['Playfair_Display'] text-2xl text-[#c4943a] font-extrabold">
                  {fmt(total)}
                </span>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-4 bg-[#c4943a] hover:bg-[#e5b657] text-[#0d0b08] font-extrabold text-xs uppercase tracking-wider rounded transition-all shadow cursor-pointer"
              >
                Finalizar Pedido por WhatsApp →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
})

export default CartDrawer
