import React, { memo } from 'react'
import { Toast } from '../types'

interface ToastNotificationProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

const ToastNotification: React.FC<ToastNotificationProps> = memo(({ toasts, onRemove }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isGold = toast.type === 'gold'
        const isSuccess = toast.type === 'success'

        return (
          <div
            key={toast.id}
            onClick={() => onRemove(toast.id)}
            className={`pointer-events-auto p-4 rounded shadow-2xl border flex items-center justify-between gap-3 text-xs font-semibold animate-fadeIn cursor-pointer transition-all ${
              isGold
                ? 'bg-[#161210] border-[#c4943a] text-[#f2e6cc]'
                : isSuccess
                ? 'bg-[#0f1f14] border-[#25d366] text-[#25d366]'
                : 'bg-[#161210] border-[#c4943a]/30 text-[#f2e6cc]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{isGold ? '✨' : isSuccess ? '✓' : 'ℹ️'}</span>
              <span>{toast.message}</span>
            </div>
            <button className="text-[#6b5940] hover:text-[#f2e6cc] font-bold">✕</button>
          </div>
        )
      })}
    </div>
  )
})

export default ToastNotification
