export type HairId = 'clasico' | 'pompadour' | 'undercut' | 'slickback' | 'quiff' | 'mullet' | 'fade_low' | 'crew'

export interface HairStyle {
  id: HairId
  name: string
  subtitle: string
  description: string
  price: number
  duration: string
  tag: string
  recommendedProduct: string
  features: string[]
  color: string
}

export interface SampleFace {
  id: string
  label: string
  shape: string
  url: string
}

export interface Service {
  id: string
  name: string
  price: number
  depositPct: number
  duration: string
  desc: string
  popular?: boolean
}

export interface Barber {
  id: string
  name: string
  specialty: string
  avatar: string
  rating: number
}

export interface HairProduct {
  id: string
  name: string
  category: 'Cremas & Pomadas' | 'Geles' | 'Ceras' | 'Aceites & Bálsamos'
  description: string
  hold: string
  shine: string
  price: number
  image: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  image?: string
}

export interface Reservation {
  id: string
  serviceName: string
  barberName: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  dateDisplay: string
  dateStr: string
  time: string
  totalPrice: number
  depositPaid: number
  haircutName?: string | null
  qrCodeSeed: string
  paymentMethod?: 'mercadopago' | 'efectivo' | 'whatsapp'
}

export interface Toast {
  id: string
  message: string
  type?: 'success' | 'info' | 'gold'
}

export interface AiAnalysis {
  faceShape: string
  score: number
  bestStyle: HairStyle
  explanation: string
  recommendedGel: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  text: string
  rating: number
  avatar: string
  tag: string
}
