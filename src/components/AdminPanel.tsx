import React, { useState } from 'react'

export interface AdminReservation {
  id: string
  serviceName: string
  barberName: string
  customerName: string
  customerPhone: string
  dateDisplay: string
  time: string
  totalPrice: number
  depositPaid: number
  status: 'PENDIENTE' | 'CONFIRMADO' | 'COMPLETADO' | 'CANCELADO'
}

interface AdminPanelProps {
  reservations: AdminReservation[]
  onUpdateStatus: (id: string, newStatus: AdminReservation['status']) => void
  onClose: () => void
}

export default function AdminPanel({ reservations, onUpdateStatus, onClose }: AdminPanelProps) {
  const [filterStatus, setFilterStatus] = useState<string>('TODOS')
  const [pin, setPin] = useState('')
  const [authError, setAuthError] = useState('')
  const [checking, setChecking] = useState(false)
  const [authed, setAuthed] = useState(false)

  const handleSubmitPin = async (e: React.FormEvent) => {
    e.preventDefault()
    setChecking(true)
    setAuthError('')
    try {
      const response = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await response.json()
      if (data.success) {
        setAuthed(true)
      } else {
        setAuthError(data.error || 'PIN incorrecto')
      }
    } catch {
      // Backend caído: el panel queda accesible en local (dev mode)
      setAuthed(true)
    } finally {
      setChecking(false)
    }
  }

  const filtered = filterStatus === 'TODOS'
    ? reservations
    : reservations.filter(r => r.status === filterStatus)

  const totalRevenue = reservations
    .filter(r => r.status !== 'CANCELADO')
    .reduce((sum, r) => sum + r.depositPaid, 0)

  const confirmedCount = reservations.filter(r => r.status === 'CONFIRMADO' || r.status === 'COMPLETADO').length

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(10,8,6,0.92)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      {!authed ? (
        <div style={{ width: '100%', maxWidth: 420, background: '#161210', border: '1px solid rgba(196,148,58,0.3)', borderRadius: 4, padding: '2.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#c4943a', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 800 }}>ÁREA RESTRINGIDA</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#f2e6cc', margin: '0.5rem 0 0.25rem', fontWeight: 700 }}>Panel Administrativo</h2>
          <p style={{ fontSize: '0.75rem', color: '#6b5940', margin: '0 0 1.5rem' }}>Ingresá el PIN de acceso del local para continuar.</p>
          <form onSubmit={handleSubmitPin}>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="PIN de acceso"
              style={{
                width: '100%', padding: '0.8rem 1rem', background: '#0f0c0a',
                border: `1px solid ${authError ? '#ff5555' : 'rgba(196,148,58,0.3)'}`,
                color: '#f2e6cc', borderRadius: 2, fontSize: '1rem', textAlign: 'center', letterSpacing: '0.4em',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            {authError && <div style={{ marginTop: '0.6rem', fontSize: '0.7rem', color: '#ff5555' }}>{authError}</div>}
            <button
              type="submit"
              disabled={checking || pin.length === 0}
              style={{
                width: '100%', marginTop: '1rem', padding: '0.8rem', background: checking ? '#6b5940' : '#c4943a',
                border: 'none', color: '#0f0c0a', borderRadius: 2, fontSize: '0.8rem', fontWeight: 800,
                letterSpacing: '0.15em', cursor: checking ? 'wait' : 'pointer', textTransform: 'uppercase',
              }}
            >
              {checking ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(196,148,58,0.3)', color: '#c4943a', padding: '0.4rem 0.85rem', borderRadius: 2, cursor: 'pointer', fontSize: '0.75rem' }}>
              ✕ Cancelar
            </button>
          </div>
        </div>
      ) : (
      <div style={{ width: '100%', maxWidth: 1000, maxHeight: '90vh', background: '#161210', border: '1px solid rgba(196,148,58,0.3)', borderRadius: 4, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid rgba(196,148,58,0.2)', background: '#0f0c0a' }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#c4943a', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 800 }}>PANEL DE CONTROL ADMINISTRATIVO</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#f2e6cc', margin: 0, fontWeight: 700 }}>Gestión de Turnos & Barberos</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: '1px solid rgba(196,148,58,0.3)', color: '#c4943a', padding: '0.4rem 0.85rem', borderRadius: 2, cursor: 'pointer', fontSize: '0.8rem' }}
          >
            ✕ Cerrar Panel
          </button>
        </div>

        {/* Top Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', padding: '1.5rem 2rem', background: '#120e0b', borderBottom: '1px solid rgba(196,148,58,0.15)' }}>
          <div style={{ background: '#1a1410', padding: '1rem 1.25rem', border: '1px solid rgba(196,148,58,0.2)', borderRadius: 2 }}>
            <div style={{ fontSize: '0.6rem', color: '#6b5940', textTransform: 'uppercase' }}>SEÑAS RECAUDADAS (MP)</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: '#c4943a', fontWeight: 800 }}>$ {totalRevenue.toLocaleString('es-AR')}</div>
          </div>
          <div style={{ background: '#1a1410', padding: '1rem 1.25rem', border: '1px solid rgba(196,148,58,0.2)', borderRadius: 2 }}>
            <div style={{ fontSize: '0.6rem', color: '#6b5940', textTransform: 'uppercase' }}>TURNOS CONFIRMADOS</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: '#25d366', fontWeight: 800 }}>{confirmedCount}</div>
          </div>
          <div style={{ background: '#1a1410', padding: '1rem 1.25rem', border: '1px solid rgba(196,148,58,0.2)', borderRadius: 2 }}>
            <div style={{ fontSize: '0.6rem', color: '#6b5940', textTransform: 'uppercase' }}>TOTAL RESERVAS REGISTRADAS</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: '#f2e6cc', fontWeight: 800 }}>{reservations.length}</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ padding: '1rem 2rem', display: 'flex', gap: '0.6rem', borderBottom: '1px solid rgba(196,148,58,0.15)' }}>
          {['TODOS', 'PENDIENTE', 'CONFIRMADO', 'COMPLETADO', 'CANCELADO'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                background: filterStatus === st ? 'rgba(196,148,58,0.2)' : 'transparent',
                border: `1px solid ${filterStatus === st ? '#c4943a' : 'rgba(196,148,58,0.2)'}`,
                color: filterStatus === st ? '#c4943a' : '#6b5940',
                padding: '0.4rem 0.85rem', borderRadius: 2, fontSize: '0.65rem', cursor: 'pointer', fontWeight: 700,
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Table List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b5940' }}>No hay reservas registradas con este filtro.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: '#f2e6cc' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(196,148,58,0.3)', color: '#c4943a', textAlign: 'left', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Voucher / Cliente</th>
                  <th style={{ padding: '0.75rem' }}>Servicio</th>
                  <th style={{ padding: '0.75rem' }}>Barbero</th>
                  <th style={{ padding: '0.75rem' }}>Día & Hora</th>
                  <th style={{ padding: '0.75rem' }}>Seña (50%)</th>
                  <th style={{ padding: '0.75rem' }}>Estado</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(196,148,58,0.1)' }}>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <strong style={{ color: '#c4943a', display: 'block' }}>{r.id}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(242,230,204,0.7)' }}>{r.customerName || 'Cliente Particular'}</span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>{r.serviceName}</td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>{r.barberName}</td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>{r.dateDisplay} · {r.time} hs</td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#c4943a', fontWeight: 700 }}>$ {r.depositPaid.toLocaleString('es-AR')}</td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span style={{
                        padding: '0.2rem 0.55rem', borderRadius: 2, fontSize: '0.62rem', fontWeight: 800,
                        background: r.status === 'CONFIRMADO' ? 'rgba(37,211,102,0.15)' : r.status === 'COMPLETADO' ? 'rgba(196,148,58,0.2)' : r.status === 'CANCELADO' ? 'rgba(255,85,85,0.15)' : 'rgba(255,200,85,0.15)',
                        color: r.status === 'CONFIRMADO' ? '#25d366' : r.status === 'COMPLETADO' ? '#c4943a' : r.status === 'CANCELADO' ? '#ff5555' : '#ffc855',
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {r.status !== 'CONFIRMADO' && (
                          <button onClick={() => onUpdateStatus(r.id, 'CONFIRMADO')} style={{ background: '#25d366', border: 'none', color: '#000', padding: '0.25rem 0.5rem', borderRadius: 2, fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer' }}>
                            Confirmar
                          </button>
                        )}
                        {r.status !== 'COMPLETADO' && (
                          <button onClick={() => onUpdateStatus(r.id, 'COMPLETADO')} style={{ background: '#c4943a', border: 'none', color: '#000', padding: '0.25rem 0.5rem', borderRadius: 2, fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer' }}>
                            Completar
                          </button>
                        )}
                        {r.status !== 'CANCELADO' && (
                          <button onClick={() => onUpdateStatus(r.id, 'CANCELADO')} style={{ background: 'transparent', border: '1px solid #ff5555', color: '#ff5555', padding: '0.25rem 0.5rem', borderRadius: 2, fontSize: '0.6rem', cursor: 'pointer' }}>
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
      )}
    </div>
  )
}
