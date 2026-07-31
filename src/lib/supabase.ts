import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('tu-proyecto'))

// Single Supabase Client instance
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface DatabaseAppointment {
  id: string
  service_name: string
  barber_name: string
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  date_display: string
  time_slot: string
  total_price: number
  deposit_paid: number
  haircut_name?: string | null
  status: 'PENDIENTE' | 'CONFIRMADO' | 'COMPLETADO' | 'CANCELADO'
  qr_code_seed: string
}
