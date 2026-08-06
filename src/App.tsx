import React, { useState, useEffect, useRef } from 'react'
import AdminPanel, { AdminReservation } from './components/AdminPanel'
  import { validateUploadedImage, BarberiaAPI } from './services/api'
import { sendBookingNotifications } from './services/api_email'
import { syncReservationToGoogleSheets } from './services/cloud_sync'

// ── TYPES & INTERFACES ──────────────────────────────────────────────────────

type HairId = 'clasico' | 'pompadour' | 'undercut' | 'slickback' | 'quiff' | 'mullet' | 'fade_low' | 'crew'

interface HairStyle {
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

interface SampleFace {
  id: string
  label: string
  shape: string
  url: string
}

interface Service {
  id: string
  name: string
  price: number
  depositPct: number
  duration: string
  desc: string
  popular?: boolean
}

interface Barber {
  id: string
  name: string
  specialty: string
  avatar: string
  rating: number
}

interface HairProduct {
  id: string
  name: string
  category: 'Cremas & Pomadas' | 'Geles' | 'Ceras' | 'Aceites & Bálsamos'
  description: string
  hold: string
  shine: string
  price: number
  image: string
}

interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  image?: string
}

interface Reservation {
  id: string
  serviceName: string
  barberName: string
  dateDisplay: string
  time: string
  totalPrice: number
  depositPaid: number
  haircutName?: string | null
  qrCodeSeed: string
}

interface Toast {
  id: string
  message: string
  type?: 'success' | 'info' | 'gold'
}

interface AiAnalysis {
  faceShape: string
  score: number
  bestStyle: HairStyle
  explanation: string
  recommendedGel: string
}

// ── TOKENS & PALETTE ────────────────────────────────────────────────────────

const T = {
  noir: '#0d0b08',
  card: '#1a1410',
  card2: '#161210',
  cream: '#f2e6cc',
  creamMuted: 'rgba(242,230,204,0.72)',
  brass: '#c4943a',
  brassLight: '#e5b657',
  muted: '#6b5940',
  border: 'rgba(196,148,58,0.2)',
  goldGrad: 'linear-gradient(135deg, #c4943a 0%, #d4a84a 50%, #a87830 100%)',
  greenSuccess: '#25d366',
}

// ── DATA PRESETS ────────────────────────────────────────────────────────────

const HAIR_STYLES: HairStyle[] = [
  {
    id: 'pompadour',
    name: 'Pompadour Noir',
    subtitle: 'Altura, elegancia y distinción',
    description: 'Elevación frontal con copete voluptuoso y degradé nítido en los laterales. Inspirado en la época dorada del tango porteño.',
    price: 5200,
    duration: '60 min',
    tag: 'TENDENCIA',
    recommendedProduct: 'Pomada Fuerte Noir (Fijación Máxima)',
    features: ['Volumen frontal alto', 'Degradé en costados', 'Fijación de alta duración'],
    color: '#3a2718',
  },
  {
    id: 'clasico',
    name: 'Clásico Porteño',
    subtitle: 'La elegancia atemporal del caballero',
    description: 'Raya lateral neta con sienes al número 2. El peinado distinguido de la diplomacia argentina desde 1947.',
    price: 4500,
    duration: '45 min',
    tag: 'CLÁSICO',
    recommendedProduct: 'Crema Modeladora Brillo Noblé',
    features: ['Raya lateral exacta', 'Patillas pulidas', 'Brillo tradicional'],
    color: '#2a1a0e',
  },
  {
    id: 'undercut',
    name: 'Undercut Vintage',
    subtitle: 'Contraste audaz y carácter fuerte',
    description: 'Corte desconectado con marcada división entre la parte superior larga y costados rapados al ras.',
    price: 4800,
    duration: '50 min',
    tag: 'VINTAGE',
    recommendedProduct: 'Cera Mate Rioplatense',
    features: ['Lados rapados', 'Largo superior peinable', 'Línea de transición limpia'],
    color: '#1b120c',
  },
  {
    id: 'fade_low',
    name: 'Fade Bajo & Textura',
    subtitle: 'Sutileza moderna y frescura',
    description: 'Degradé suave que inicia bajo en la nuca y patillas, manteniendo movimiento natural en la copa.',
    price: 5000,
    duration: '50 min',
    tag: 'MODERNO',
    recommendedProduct: 'Gel Fluido Ultra Moldeador',
    features: ['Degradé progresivo', 'Textura superior', 'Acabado natural'],
    color: '#2d1e14',
  },
  {
    id: 'slickback',
    name: 'Slick Back Ejecutivo',
    subtitle: 'Poder, presencia y postura',
    description: 'Cabello peinado completamente hacia atrás con acabado impecable. Ideal para hombres de negocios.',
    price: 4200,
    duration: '40 min',
    tag: 'EJECUTIVO',
    recommendedProduct: 'Gel Extra Forte Efecto Húmedo',
    features: ['Peinado atrás firme', 'Sienes definidas', 'Brillo noble'],
    color: '#1c150e',
  },
  {
    id: 'quiff',
    name: 'Quiff Buenos Aires',
    subtitle: 'Movimiento libre y versátil',
    description: 'Frente ligeramente levantado con caída desenfadada y costados en degradé medio.',
    price: 5000,
    duration: '55 min',
    tag: 'ESTILIZADO',
    recommendedProduct: 'Cera Mate Rioplatense',
    features: ['Frente con textura', 'Lateral comprimido', 'Versatilidad diaria'],
    color: '#332317',
  },
]

const SAMPLE_FACES: SampleFace[] = [
  {
    id: 'face_1',
    label: 'Rostro Ovalado',
    shape: 'Ovalado',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop&crop=faces&q=80',
  },
  {
    id: 'face_2',
    label: 'Rostro Cuadrado',
    shape: 'Cuadrado',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=750&fit=crop&crop=faces&q=80',
  },
  {
    id: 'face_3',
    label: 'Rostro Redondo',
    shape: 'Redondo',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=750&fit=crop&crop=faces&q=80',
  },
  {
    id: 'face_4',
    label: 'Rostro Diamante',
    shape: 'Diamante',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=750&fit=crop&crop=faces&q=80',
  },
]

const SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Corte de Cabello Porteño',
    price: 4500,
    depositPct: 0.5,
    duration: '45 min',
    desc: 'Lavado revitalizante, corte a tijera/máquina, perfilado y peinado con producto premium.',
    popular: true,
  },
  {
    id: 's2',
    name: 'Afeitado Tradicional a Navaja',
    price: 3800,
    depositPct: 0.5,
    duration: '40 min',
    desc: 'Ritual de toallas calientes aromatizadas, espumado con brocha de tejón, navaja y bálsamo reparador.',
  },
  {
    id: 's3',
    name: 'Combo Completo: Corte + Barba',
    price: 7200,
    depositPct: 0.5,
    duration: '75 min',
    desc: 'El servicio insignia del Búho Dorado. Tratamiento integral de cabello y barba en una sola sesión.',
    popular: true,
  },
  {
    id: 's4',
    name: 'Tratamiento Capilar con Carbón',
    price: 5500,
    depositPct: 0.5,
    duration: '60 min',
    desc: 'Exfoliación capilar con carbón activado, masaje craneal descontracturante y aceites botánicos.',
  },
]

const BARBERS: Barber[] = [
  {
    id: 'carlos',
    name: 'Don Carlos Méndez',
    specialty: 'CORTES CLÁSICOS & NAVAJA',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=faces',
    rating: 5.0,
  },
  {
    id: 'facundo',
    name: 'Facundo Reyes',
    specialty: 'FADE MODERNO & TEXTURAS',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces',
    rating: 4.9,
  },
  {
    id: 'marcelo',
    name: 'Marcelo Giordano',
    specialty: 'POMPADOUR & ESCULTURA DE BARBA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces',
    rating: 4.9,
  },
  {
    id: 'any',
    name: 'Primer Barbero Disponible',
    specialty: 'ASIGNACIÓN RÁPIDA DE TURNO',
    avatar: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=300&h=300&fit=crop&crop=faces',
    rating: 5.0,
  },
]

// CATALOGUE OF CREAMS, GELS, WAXES & OILS FOR HAIR
const HAIR_PRODUCTS: HairProduct[] = [
  {
    id: 'pomada_noir',
    name: 'Pomada Fuerte Noir Búho',
    category: 'Cremas & Pomadas',
    description: 'Fijación máxima a base de agua sin residuos. Aporta estructura limpia a copetes Pompadour y Undercut.',
    hold: 'Alta (5/5)',
    shine: 'Medio Noble',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1775126250999-806ca8419dcb?w=400&h=480&fit=crop&auto=format',
  },
  {
    id: 'gel_extra_forte',
    name: 'Gel Extra Forte Efecto Húmedo',
    category: 'Geles',
    description: 'Gel concentrado con pro-vitamina B5. Brinda fijación blindada todo el día con acabado brillante espejo.',
    hold: 'Extrema (5/5)',
    shine: 'Brillo Espejo',
    price: 2900,
    image: 'https://images.unsplash.com/photo-1775126251074-cd5f4cfdf7c9?w=400&h=480&fit=crop&auto=format',
  },
  {
    id: 'cera_mate',
    name: 'Cera Mate Rioplatense',
    category: 'Ceras',
    description: 'Acabado 100% mate sin sensación grasosa. Aporta volumen natural y textura remoldeable para Quiff y Fade.',
    hold: 'Media-Alta (4/5)',
    shine: 'Mate Total (0/5)',
    price: 2700,
    image: 'https://images.unsplash.com/photo-1638383257225-f810a62c634e?w=400&h=480&fit=crop&auto=format',
  },
  {
    id: 'crema_peinar',
    name: 'Crema de Peinado Brillantina Classic',
    category: 'Cremas & Pomadas',
    description: 'La fórmula original porteña de 1947. Suaviza la fibra capilar, controla el frizz y facilita la raya lateral.',
    hold: 'Media Flexible (3/5)',
    shine: 'Brillo Tradicional',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=480&fit=crop&auto=format',
  },
  {
    id: 'aceite_imperial',
    name: 'Aceite Nutritivo Capilar & Barba',
    category: 'Aceites & Bálsamos',
    description: 'Blend botánico de argán, jojoba y madera de cedro. Nutre el cabello seco, aporta sedosidad y perfuma.',
    hold: 'Nutrición / Ligero',
    shine: 'Luminosidad Natural',
    price: 3800,
    image: 'https://images.unsplash.com/photo-1776843448493-eb35a803489b?w=400&h=480&fit=crop&auto=format',
  },
  {
    id: 'gel_fluido',
    name: 'Gel Fluido Moldeador Ligero',
    category: 'Geles',
    description: 'Gel ligero sin alcohol de secado rápido. Ideal para peinados casuales con movimiento y flexibilidad.',
    hold: 'Media (3/5)',
    shine: 'Satinado',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1638383257653-4217e9161b11?w=400&h=480&fit=crop&auto=format',
  },
]

const TIME_SLOTS = ['10:00', '10:45', '11:30', '12:15', '13:00', '14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:00']

const MP_ALIAS = 'elbuho.dorado.mp'
const MP_TITULAR = 'El Búho Dorado Barbería'

const fmt = (n: number) => `$ ${n.toLocaleString('es-AR')}`

const getThisWeekDays = () => {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      dateObj: d,
      dateStr: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'HOY' : i === 1 ? 'MAÑANA' : d.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase(),
      dayNum: d.getDate(),
      monthName: d.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase(),
      isSunday: d.getDay() === 0,
    })
  }
  return days
}

// ── OVERLAY GRAPHICS COMPONENT FOR HAIRCUT TRY-ON ───────────────────────────

function HaircutOverlaySVG({ styleId, scale = 1, yOffset = 0, color = '#3a2718' }: { styleId: HairId; scale?: number; yOffset?: number; color?: string }) {
  const transform = `translate(0, ${yOffset}px) scale(${scale})`

  switch (styleId) {
    case 'pompadour':
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full pointer-events-none drop-shadow-2xl" style={{ transform, transformOrigin: 'center 35%' }}>
          <path d="M 130 150 C 120 90, 160 30, 200 25 C 240 30, 280 90, 270 150 C 285 140, 290 190, 275 220 C 265 200, 255 180, 245 165 C 230 145, 170 145, 155 165 C 145 180, 135 200, 125 220 C 110 190, 115 140, 130 150 Z" fill={color} opacity="0.95" />
          <path d="M 150 140 C 170 50, 230 50, 250 140 C 220 110, 180 110, 150 140 Z" fill={T.brass} opacity="0.22" />
        </svg>
      )
    case 'clasico':
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full pointer-events-none drop-shadow-xl" style={{ transform, transformOrigin: 'center 35%' }}>
          <path d="M 125 160 C 125 90, 160 50, 200 48 C 240 50, 275 90, 275 160 C 260 160, 250 130, 200 130 C 150 130, 140 160, 125 160 Z" fill={color} opacity="0.95" />
          <line x1="150" y1="90" x2="165" y2="155" stroke={T.brass} strokeWidth="2.5" opacity="0.8" />
        </svg>
      )
    case 'undercut':
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full pointer-events-none drop-shadow-2xl" style={{ transform, transformOrigin: 'center 35%' }}>
          <path d="M 135 155 C 140 70, 170 40, 200 38 C 230 40, 260 70, 265 155 C 245 140, 220 120, 200 120 C 180 120, 155 140, 135 155 Z" fill={color} opacity="0.96" />
        </svg>
      )
    case 'fade_low':
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full pointer-events-none drop-shadow-xl" style={{ transform, transformOrigin: 'center 35%' }}>
          <path d="M 130 165 C 135 85, 165 45, 200 42 C 235 45, 265 85, 270 165 C 250 145, 220 135, 200 135 C 180 135, 150 145, 130 165 Z" fill={color} opacity="0.94" />
        </svg>
      )
    case 'slickback':
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full pointer-events-none drop-shadow-2xl" style={{ transform, transformOrigin: 'center 35%' }}>
          <path d="M 128 170 C 130 80, 165 45, 200 45 C 235 45, 270 80, 272 170 C 260 150, 245 130, 200 125 C 155 130, 140 150, 128 170 Z" fill={color} opacity="0.97" />
          <path d="M 140 90 Q 200 70 260 90" stroke={T.brass} strokeWidth="2" fill="none" opacity="0.6" />
        </svg>
      )
    case 'quiff':
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full pointer-events-none drop-shadow-xl" style={{ transform, transformOrigin: 'center 35%' }}>
          <path d="M 132 160 C 130 95, 155 35, 195 30 C 240 32, 275 85, 270 160 C 255 145, 230 130, 195 132 C 160 130, 145 145, 132 160 Z" fill={color} opacity="0.95" />
        </svg>
      )
    default:
      return null
  }
}

// ── MAIN APPLICATION COMPONENT ─────────────────────────────────────────────

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Photo Haircut Studio States ("Subí tu foto y elegí tu corte con IA")
  const [userPhoto, setUserPhoto] = useState<string | null>(SAMPLE_FACES[0].url)
  const [selectedFaceShape, setSelectedFaceShape] = useState<string>('Ovalado')
  const [selectedStyleId, setSelectedStyleId] = useState<HairId>('pompadour')
  const [hairScale, setHairScale] = useState<number>(1.0)
  const [hairOffsetY, setHairOffsetY] = useState<number>(0)
  const [hairColor, setHairColor] = useState<string>('#3a2718')
  
  // AI Face Scanner & Advisor States
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false)
  const [scanProgress, setScanProgress] = useState<number>(0)
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null)
  const [aiRenderImage, setAiRenderImage] = useState<string | null>(null)
  const [isAiRendering, setIsAiRendering] = useState<boolean>(false)
  const [aiRenderStyleId, setAiRenderStyleId] = useState<HairId | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Paid Booking System States ("Venta de Reservas en el Día o la Semana")
  const thisWeekDays = getThisWeekDays()
  const [bookingStep, setBookingStep] = useState<number>(0)
  const [selectedServiceId, setSelectedServiceId] = useState<string>('s1')
  const [selectedBarberId, setSelectedBarberId] = useState<string>('carlos')
  const [selectedDateStr, setSelectedDateStr] = useState<string>(thisWeekDays[0].dateStr)
  const [selectedTime, setSelectedTime] = useState<string>('16:00')
  const [attachedReference, setAttachedReference] = useState<boolean>(true)
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null)

  // Admin Panel & Local Storage State (100% Sin Base de Datos / Gratuito)
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false)
  const [adminReservations, setAdminReservations] = useState<AdminReservation[]>(() => {
    try {
      const saved = localStorage.getItem('buho_admin_reservations')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.warn('Error al leer reservas de localStorage', e)
    }
    return [
      {
        id: 'EBD-8492',
        serviceName: 'Corte de Cabello Porteño',
        barberName: 'Don Carlos Méndez',
        customerName: 'Santiago Rossi',
        customerPhone: '+54 341 5543-9988',
        dateDisplay: 'HOY 31 JUL',
        time: '16:00',
        totalPrice: 4500,
        depositPaid: 2250,
        status: 'CONFIRMADO',
      },
      {
        id: 'EBD-3104',
        serviceName: 'Combo Completo: Corte + Barba',
        barberName: 'Facundo Reyes',
        customerName: 'Gonzalo Fernández',
        customerPhone: '+54 341 4432-1100',
        dateDisplay: 'MAÑANA 01 AGO',
        time: '11:15',
        totalPrice: 7200,
        depositPaid: 3600,
        status: 'PENDIENTE',
      },
    ]
  })

  // Persist reservations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('buho_admin_reservations', JSON.stringify(adminReservations))
    } catch (e) {
      console.warn('Error al guardar reservas en localStorage', e)
    }
  }, [adminReservations])

  // E-commerce Cart & Hair Products (Cremas, Geles, Ceras, Aceites)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCartDrawer, setShowCartDrawer] = useState(false)
  const [productCategoryFilter, setProductCategoryFilter] = useState('Todos')
  const [isBuyingCart, setIsBuyingCart] = useState(false)

  // Toast Notifications
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: Toast['type'] = 'gold') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3800)
  }

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Trigger Real AI Face Analysis & Haircut Recommendation
  const runAiFacialAnalysis = async () => {
    setIsAiScanning(true)
    setScanProgress(0)
    setAiAnalysis(null)

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 92) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.floor(Math.random() * 22 + 12)
      })
    }, 180)

    try {
      const result = await BarberiaAPI.analyzeFaceVision({
        imageBase64: userPhoto || '',
      })

      const bestStyle = HAIR_STYLES.find(h => h.id === result.bestStyleId) || HAIR_STYLES[0]

      const analysis: AiAnalysis = {
        faceShape: result.faceShape,
        score: result.score,
        bestStyle: bestStyle,
        explanation: result.explanation,
        recommendedGel: result.recommendedProduct,
      }

      setSelectedFaceShape(result.faceShape)
      setAiAnalysis(analysis)
      addToast(`✨ IA: ${analysis.score}% de compatibilidad detectada para ${bestStyle.name}`, 'gold')
    } catch (err) {
      console.warn('[AI] Error al analizar rostro:', err)
      addToast('⚠️ No se pudo analizar la foto. Probá con otra imagen.', 'gold')
    } finally {
      clearInterval(interval)
      setScanProgress(100)
      setIsAiScanning(false)
    }
  }

  // Render the chosen haircut on the user's photo via Gemini (real) with SVG fallback
  const runAiStyleRender = async (styleId: HairId) => {
    const style = HAIR_STYLES.find(h => h.id === styleId)
    const name = style?.name || 'este corte'
    setIsAiRendering(true)
    setAiRenderStyleId(styleId)
    setAiRenderImage(null)
    try {
      const result = await BarberiaAPI.renderStyle({
        image: userPhoto || SAMPLE_FACES[0].url,
        styleId,
      })
      setAiRenderImage(result.data)
      addToast(`✨ Corte ${name} generado sobre tu foto`, 'success')
    } catch (err: any) {
      console.warn('[AI Render] No disponible, usando overlay local:', err?.message || err)
      addToast('⚠️ Modo previsualización local activado (agregá GEMINI_API_KEY para render real).', 'gold')
    } finally {
      setIsAiRendering(false)
      setAiRenderStyleId(null)
    }
  }

  // Copy Alias to Clipboard
  const copyAliasToClipboard = () => {
    navigator.clipboard.writeText(MP_ALIAS)
    addToast(`¡Alias "${MP_ALIAS}" copiado al portapapeles!`, 'success')
  }

  // Handle Photo Upload with Security Validation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateUploadedImage(file)
      if (!validation.valid) {
        addToast(`⚠️ ${validation.error}`, 'gold')
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setUserPhoto(reader.result as string)
        setSelectedFaceShape('Tu Foto')
        setAiRenderImage(null)
        addToast('¡Foto verificada y cargada! Presioná "Analizar mi Rostro con IA".', 'success')
      }
      reader.readAsDataURL(file)
    }
  }

  // Cart Functions
  const addToCart = (product: HairProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, image: product.image }]
    })
    addToast(`${product.name} agregado al carrito`, 'info')
  }

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta
        return newQty > 0 ? { ...item, qty: newQty } : item
      }
      return item
    }))
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  // Booking Flow Helpers
  const currentService = SERVICES.find(s => s.id === selectedServiceId) || SERVICES[0]
  const currentBarber = BARBERS.find(b => b.id === selectedBarberId) || BARBERS[0]
  const currentStyle = HAIR_STYLES.find(h => h.id === selectedStyleId)
  const depositAmount = Math.round(currentService.price * currentService.depositPct)

  const selectedDayObj = thisWeekDays.find(d => d.dateStr === selectedDateStr) || thisWeekDays[0]
  const dateDisplayStr = `${selectedDayObj.dayName} ${selectedDayObj.dayNum} ${selectedDayObj.monthName}`

  // Create Reservation & Generate Ticket
  const createReservation = () => {
    const newRes: Reservation = {
      id: `EBD-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceName: currentService.name,
      barberName: currentBarber.name,
      dateDisplay: dateDisplayStr,
      time: selectedTime,
      totalPrice: currentService.price,
      depositPaid: depositAmount,
      haircutName: attachedReference && currentStyle ? currentStyle.name : null,
      qrCodeSeed: `EBD-QR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    }
    setConfirmedReservation(newRes)

    // Add to Admin Reservations List
    const adminResItem: AdminReservation = {
      id: newRes.id,
      serviceName: newRes.serviceName,
      barberName: newRes.barberName,
      customerName: 'Cliente Web',
      customerPhone: '+54 11 ---- ----',
      dateDisplay: newRes.dateDisplay,
      time: newRes.time,
      totalPrice: newRes.totalPrice,
      depositPaid: newRes.depositPaid,
      status: 'CONFIRMADO',
    }
    setAdminReservations(prev => [adminResItem, ...prev])

    // Trigger WhatsApp + Email notifications (backend, con fallback FormSubmit)
    sendBookingNotifications({
      voucherId: newRes.id,
      serviceName: newRes.serviceName,
      barberName: newRes.barberName,
      customerName: adminResItem.customerName,
      customerPhone: adminResItem.customerPhone,
      dateDisplay: newRes.dateDisplay,
      timeSlot: newRes.time,
      totalPrice: newRes.totalPrice,
      depositPaid: newRes.depositPaid,
      qrCodeSeed: newRes.qrCodeSeed,
    })

    setBookingStep(3)
    addToast('¡Reserva registrada y notificaciones enviadas al dueño!', 'success')
    return newRes
  }

  // Send WhatsApp Confirmation with Deposit Details
  const sendWhatsAppConfirmation = () => {
    const res = confirmedReservation || createReservation()
    const text = `Hola El Búho Dorado! 👋 Quiero confirmar mi turno:\n\n✂️ *Servicio*: ${res.serviceName}\n💈 *Barbero*: ${res.barberName}\n📅 *Día*: ${res.dateDisplay}\n⏰ *Hora*: ${res.time} hs\n💰 *Seña Abonada*: ${fmt(res.depositPaid)} al Alias ${MP_ALIAS}\n🔖 *Código Voucher*: ${res.id}\n\nAdjunto el comprobante de transferencia.`
    const encoded = encodeURIComponent(text)
    window.open(`https://wa.me/5434143628800?text=${encoded}`, '_blank')
  }

  // Smooth Scroll
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const filteredProducts = productCategoryFilter === 'Todos'
    ? HAIR_PRODUCTS
    : HAIR_PRODUCTS.filter(p => p.category === productCategoryFilter)

  return (
    <div style={{ background: T.noir, color: T.cream, minHeight: '100vh', fontFamily: "'Work Sans', system-ui, sans-serif" }}>

      {/* ═══════════════ TOAST NOTIFICATIONS ═══════════════ */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              background: toast.type === 'success' ? '#142e18' : T.card,
              border: `1px solid ${toast.type === 'success' ? '#25d366' : T.brass}`,
              color: T.cream,
              padding: '0.85rem 1.4rem',
              borderRadius: '4px',
              fontSize: '0.82rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <span style={{ color: T.brass }}>◈</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* ═══════════════ NAVIGATION HEADER ═══════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: scrolled ? '0.75rem 2.5rem' : '1.35rem 2.5rem',
        background: scrolled ? 'rgba(13,11,8,0.96)' : 'linear-gradient(to bottom, rgba(13,11,8,0.9), transparent)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? `1px solid ${T.border}` : '1px solid transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.4s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }} onClick={() => scrollTo('inicio')}>
          <div style={{ width: 38, height: 38, background: T.goldGrad, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#1a0e00', fontWeight: 800, boxShadow: '0 0 20px rgba(196,148,58,0.3)' }}>◈</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.04em' }}>El Búho Dorado</div>
            <div style={{ fontSize: '0.54rem', letterSpacing: '0.35em', color: T.brass, textTransform: 'uppercase' }}>Barbería Boutique · Rosario, Santa Fe · Est. 1947</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
          {/* Desktop Nav Links */}
          <div className="mob-hide" style={{ display: 'flex', gap: '1.6rem', alignItems: 'center' }}>
            {[
              ['Inicio', 'inicio'],
              ['Tarjetas Hover Reveal', 'hover-reveal-section'],
              ['Probá tu Corte (IA)', 'estudio-foto'],
              ['Reservas de la Semana', 'reservas'],
              ['Cremas & Geles', 'tienda-geles'],
            ].map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{ background: 'none', border: 'none', color: T.creamMuted, cursor: 'pointer', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', transition: 'color 0.2s', padding: 0, whiteSpace: 'nowrap' }}
                onMouseEnter={e => (e.currentTarget.style.color = T.brass)}
                onMouseLeave={e => (e.currentTarget.style.color = T.creamMuted)}
              >
                {label}
              </button>
            ))}

            {/* Admin Panel Button */}
            <button
              onClick={() => setShowAdminPanel(true)}
              style={{
                background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 2, padding: '0.45rem 0.85rem',
                color: T.brass, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                fontWeight: 700, transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,148,58,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              🔑 Panel Barberos
            </button>
          </div>

          {/* Cart Icon Button */}
          <button
            onClick={() => setShowCartDrawer(true)}
            style={{ position: 'relative', background: 'none', border: 'none', color: T.cream, cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, padding: '0.35rem' }}
            aria-label="Abrir carrito"
          >
            🛒
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -6, background: T.brass, color: '#1a0e00', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            className="mob-nav-toggle"
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 2, color: T.cream, cursor: 'pointer', fontSize: '1.05rem', lineHeight: 1, padding: '0.45rem 0.65rem', display: 'none' }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          {/* Reserve CTA (desktop) */}
          <button
            className="mob-hide"
            onClick={() => scrollTo('reservas')}
            style={{
              background: T.goldGrad, border: 'none', borderRadius: 2, padding: '0.55rem 1.4rem',
              color: '#1a0e00', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(196,148,58,0.25)', transition: 'transform 0.2s, opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Reservar Turno
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="mob-menu" style={{ position: 'fixed', top: scrolled ? 62 : 81, left: 0, right: 0, zIndex: 190, background: 'rgba(13,11,8,0.98)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${T.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem 1.25rem 1.25rem' }}>
            {[
              ['Inicio', 'inicio'],
              ['Tarjetas Hover Reveal', 'hover-reveal-section'],
              ['Probá tu Corte (IA)', 'estudio-foto'],
              ['Reservas de la Semana', 'reservas'],
              ['Cremas & Geles', 'tienda-geles'],
            ].map(([label, id]) => (
              <button
                key={id}
                onClick={() => {
                  setMobileMenuOpen(false)
                  scrollTo(id)
                }}
                style={{ background: 'none', border: 'none', borderBottom: `1px solid ${T.border}`, color: T.cream, cursor: 'pointer', fontSize: '0.95rem', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'left', padding: '0.95rem 0.5rem', fontWeight: 600 }}
              >
                {label}
              </button>
            ))}
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setShowAdminPanel(true)
                }}
                style={{ flex: 1, background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 2, padding: '0.8rem', color: T.brass, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700 }}
              >
                🔑 Panel Barberos
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  scrollTo('reservas')
                }}
                style={{ flex: 1.4, background: T.goldGrad, border: 'none', borderRadius: 2, padding: '0.8rem', color: '#1a0e00', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                📅 Reservar Turno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section id="inicio" style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
        <img
          src="https://images.unsplash.com/photo-1759134155377-4207d89b39ec?w=1800&h=1000&fit=crop&auto=format&crop=top"
          alt="El Búho Dorado — Barbería Boutique Rosario"
          fetchPriority="high"
          decoding="async"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0d0b08 0%, rgba(13,11,8,0.75) 45%, rgba(13,11,8,0.25) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(13,11,8,0.8) 0%, transparent 60%)' }} />

        <div className="hero-inner" style={{ position: 'relative', padding: '0 4rem 6.5rem', maxWidth: 880 }}>
          <div style={{ fontSize: '0.62rem', letterSpacing: '0.45em', color: T.brass, textTransform: 'uppercase', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ display: 'inline-block', width: 36, height: 1, background: T.brass }} />
            Urquiza 1315, Rosario · Horarios de 10 a 18 hs
          </div>
          <h1 className="hero-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(3.4rem, 7.5vw, 6.8rem)', fontWeight: 900, lineHeight: 0.95, marginBottom: '1.75rem', letterSpacing: '-0.02em' }}>
            El Arte del<br />
            <em style={{ color: T.brass, fontStyle: 'italic' }}>Caballero</em><br />
            Rosarino
          </h1>
          <p style={{ fontFamily: "'Lora', serif", fontSize: '1.08rem', color: T.creamMuted, maxWidth: 520, lineHeight: 1.8, marginBottom: '2.75rem' }}>
            Subí tu foto para recibir la recomendación de corte ideal con nuestro Escáner de Visión por IA, reservá tu turno para hoy o esta semana y adquirí los mejores geles y pomadas.
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => scrollTo('estudio-foto')}
              style={{
                background: T.goldGrad, border: 'none', borderRadius: 2, padding: '1.05rem 2.4rem',
                color: '#1a0e00', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer',
                boxShadow: '0 6px 28px rgba(196,148,58,0.3)',
              }}
            >
              ✨ Probar Mi Foto Con IA
            </button>
            <button
              onClick={() => scrollTo('reservas')}
              style={{
                background: 'transparent', border: `1px solid ${T.brass}`, borderRadius: 2, padding: '1.05rem 2.4rem',
                color: T.brass, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,148,58,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              📅 Reservar Turno Esta Semana
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════ GALERÍA DE TARJETAS CON HOVER REVEAL ═══════════════ */}
      <section id="hover-reveal-section" className="app-section cvis" style={{ padding: '7rem 2.5rem', background: '#0d0b08', borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'left', marginBottom: '4rem', maxWidth: 760 }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.45em', color: T.brass, textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ display: 'inline-block', width: 22, height: 1, background: T.brass }} />
              Diseño Visual Moderno & Microinteracciones
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: '1.25rem' }}>
              Galería de Tarjetas con<br />
              <em style={{ color: T.brass, fontStyle: 'italic' }}>Efectos Hover Reveal</em>
            </h2>
            <p style={{ fontFamily: "'Lora', serif", color: T.creamMuted, fontSize: '1rem', lineHeight: 1.8 }}>
              Pasa el cursor sobre cada tarjeta para activar la revelación de contenido dinámico, efectos de cristal esmerilado (glassmorphism), animación de brillo (shimmer pass) y microinteracciones.
            </p>
          </div>

          {/* Grid of Interactive Hover Reveal Image Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            {/* HOVER REVEAL CARD 1: Glassmorphism Slide Up */}
            <div className="reveal-card" style={{ height: 460 }}>
              <img
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=1000&fit=crop&auto=format"
                alt="Pompadour Noir Corte Porteño"
                className="reveal-card-img"
                loading="lazy"
                decoding="async"
              />
              <div className="shimmer-effect" />
              
              {/* Permanent Badge (Visible always) */}
              <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', zIndex: 10, background: 'rgba(13,11,8,0.85)', backdropFilter: 'blur(8px)', border: `1px solid ${T.border}`, padding: '0.35rem 0.85rem', borderRadius: 2, fontSize: '0.62rem', letterSpacing: '0.2em', color: T.brass, textTransform: 'uppercase', fontWeight: 800 }}>
                Corte Insignia
              </div>

              {/* Reveal Overlay on Hover */}
              <div className="reveal-overlay-slide reveal-content-stagger">
                <div style={{ fontSize: '0.6rem', color: T.brass, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>
                  San Telmo Studio · 5.0 ★
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 800, color: T.cream, marginBottom: '0.5rem' }}>
                  Pompadour Noir Vintage
                </h3>
                <p style={{ fontFamily: "'Lora', serif", fontSize: '0.82rem', color: T.creamMuted, lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Copete de alto volumen esculpido a tijera con degradé progresivo en laterales. Incluye perfilado de patillas y fijación con pomada.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.55rem', color: T.muted, textTransform: 'uppercase', display: 'block' }}>Precio Servicio</span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: T.brass, fontWeight: 800 }}>$ 5.200</span>
                  </div>
                  <button
                    onClick={() => scrollTo('reservas')}
                    style={{ background: T.goldGrad, border: 'none', borderRadius: 2, padding: '0.65rem 1.25rem', color: '#1a0e00', fontWeight: 800, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
                  >
                    Reservar Este Corte
                  </button>
                </div>
              </div>
            </div>

            {/* HOVER REVEAL CARD 2: Ritual Afeitado Navaja */}
            <div className="reveal-card" style={{ height: 460 }}>
              <img
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=1000&fit=crop&auto=format"
                alt="Afeitado Tradicional Navaja"
                className="reveal-card-img"
                loading="lazy"
                decoding="async"
              />
              <div className="shimmer-effect" />

              <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', zIndex: 10, background: 'rgba(13,11,8,0.85)', backdropFilter: 'blur(8px)', border: `1px solid ${T.border}`, padding: '0.35rem 0.85rem', borderRadius: 2, fontSize: '0.62rem', letterSpacing: '0.2em', color: T.brass, textTransform: 'uppercase', fontWeight: 800 }}>
                Ritual Tradicional
              </div>

              <div className="reveal-overlay-slide reveal-content-stagger">
                <div style={{ fontSize: '0.6rem', color: T.brass, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>
                  Ritual de Toallas Calientes
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 800, color: T.cream, marginBottom: '0.5rem' }}>
                  Afeitado a Navaja Libre
                </h3>
                <p style={{ fontFamily: "'Lora', serif", fontSize: '0.82rem', color: T.creamMuted, lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Espumado tradicional con brocha de tejón, hidratación profunda con aceites esenciales y bálsamo de eucalipto reparador.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.55rem', color: T.muted, textTransform: 'uppercase', display: 'block' }}>Duración 40 min</span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: T.brass, fontWeight: 800 }}>$ 3.800</span>
                  </div>
                  <button
                    onClick={() => scrollTo('reservas')}
                    style={{ background: T.goldGrad, border: 'none', borderRadius: 2, padding: '0.65rem 1.25rem', color: '#1a0e00', fontWeight: 800, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
                  >
                    Agendar Afeitado
                  </button>
                </div>
              </div>
            </div>

            {/* HOVER REVEAL CARD 3: Productos Capilares Premium */}
            <div className="reveal-card" style={{ height: 460 }}>
              <img
                src="https://images.unsplash.com/photo-1775126250999-806ca8419dcb?w=800&h=1000&fit=crop&auto=format"
                alt="Pomada Fuerte Noir Búho Dorado"
                className="reveal-card-img"
                loading="lazy"
                decoding="async"
              />
              <div className="shimmer-effect" />

              <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', zIndex: 10, background: 'rgba(13,11,8,0.85)', backdropFilter: 'blur(8px)', border: `1px solid ${T.border}`, padding: '0.35rem 0.85rem', borderRadius: 2, fontSize: '0.62rem', letterSpacing: '0.2em', color: T.brass, textTransform: 'uppercase', fontWeight: 800 }}>
                Producto Exclusivo
              </div>

              <div className="reveal-overlay-slide reveal-content-stagger">
                <div style={{ fontSize: '0.6rem', color: T.brass, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>
                  Fijación Máxima (5/5)
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 800, color: T.cream, marginBottom: '0.5rem' }}>
                  Pomada Fuerte Noir 120g
                </h3>
                <p style={{ fontFamily: "'Lora', serif", fontSize: '0.82rem', color: T.creamMuted, lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Fórmula soluble en agua de alta fijación. Define el peinado durante 24hs sin dejar residuos grasos ni caspa.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.55rem', color: T.muted, textTransform: 'uppercase', display: 'block' }}>Edición Limitada</span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: T.brass, fontWeight: 800 }}>$ 3.200</span>
                  </div>
                  <button
                    onClick={() => scrollTo('tienda-geles')}
                    style={{ background: T.goldGrad, border: 'none', borderRadius: 2, padding: '0.65rem 1.25rem', color: '#1a0e00', fontWeight: 800, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
                  >
                    Ver en Tienda
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════ ESTUDIO INTERACTIVO & ASESOR IA ═══════════════ */}
      <section id="estudio-foto" className="app-section cvis" style={{ padding: '7rem 2.5rem', background: '#0a0806', borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          
          <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '2rem', alignItems: 'end', marginBottom: '3.5rem' }}>
            <div>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.45em', color: T.brass, textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ display: 'inline-block', width: 22, height: 1, background: T.brass }} />
                Inteligencia Artificial Facial
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)', fontWeight: 700, lineHeight: 1.05 }}>
                Subí tu foto y la IA te<br />
                <em style={{ color: T.brass }}>recomienda tu corte</em>
              </h2>
            </div>
            <p style={{ fontFamily: "'Lora', serif", color: T.creamMuted, lineHeight: 1.85, fontSize: '0.94rem' }}>
              Nuestro algoritmo de Inteligencia Artificial analiza la forma de tu rostro (ovalado, cuadrado, redondo, diamante) y te recomienda cuál de nuestros cortes resalta mejor tus facciones.
            </p>
          </div>

          <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2.5rem', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: INTERACTIVE CANVAS VIEWPORT & AI SCANNER */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 2, padding: '1.75rem', position: 'relative' }}>
              
              {/* Top Controls Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: `1px solid ${T.border}` }}>
                <div>
                  <div style={{ fontSize: '0.6rem', color: T.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Estructura Detectada</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: T.brass, fontWeight: 600 }}>{selectedFaceShape}</div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: T.goldGrad, border: 'none', borderRadius: 2, padding: '0.55rem 1.1rem',
                      color: '#1a0e00', fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                    }}
                  >
                    📷 Subir Foto de Mi Rostro
                  </button>
                </div>
              </div>

              {/* Sample Faces Selector Row */}
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.62rem', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', alignSelf: 'center', marginRight: '0.2rem' }}>Prueba rápida:</span>
                {SAMPLE_FACES.map(sf => (
                  <button
                    key={sf.id}
                    onClick={() => {
                      setUserPhoto(sf.url)
                      setSelectedFaceShape(sf.shape)
                      setAiRenderImage(null)
                      addToast(`Foto de prueba "${sf.shape}" cargada`, 'info')
                    }}
                    style={{
                      border: `1px solid ${userPhoto === sf.url ? T.brass : 'rgba(196,148,58,0.2)'}`,
                      background: userPhoto === sf.url ? 'rgba(196,148,58,0.15)' : T.card2,
                      padding: '0.35rem 0.65rem', borderRadius: 2, cursor: 'pointer', color: userPhoto === sf.url ? T.brass : T.creamMuted,
                      fontSize: '0.65rem', whiteSpace: 'nowrap', transition: 'all 0.2s',
                    }}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>

              {/* Photo Viewport Canvas Container */}
              <div style={{ position: 'relative', width: '100%', height: 440, background: '#050403', borderRadius: 2, overflow: 'hidden', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {userPhoto ? (
                  <>
                    <img
                      src={userPhoto}
                      alt="Rostro para análisis IA"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.92) contrast(1.05)' }}
                    />

                    {/* Hair Overlay Layer: real AI render if present, else SVG fallback */}
                    {aiRenderImage ? (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <img
                          src={aiRenderImage}
                          alt="Corte generado por IA"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', animation: 'fadeIn 0.4s ease' }}
                        />
                      </div>
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <HaircutOverlaySVG
                          styleId={selectedStyleId}
                          scale={hairScale}
                          yOffset={hairOffsetY}
                          color={hairColor}
                        />
                      </div>
                    )}

                    {/* AI Facial Landmarking Scanning Grid Simulation */}
                    {isAiScanning && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,11,8,0.7)', backdropFilter: 'blur(3px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <div style={{ width: 150, height: 150, border: `2px dashed ${T.brass}`, borderRadius: '50%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 100, height: 100, border: `1px solid ${T.brassLight}`, borderRadius: '50%' }} />
                          <div style={{ position: 'absolute', width: '100%', height: 2, background: T.brass, top: `${scanProgress}%` }} />
                        </div>
                        <div style={{ fontSize: '0.68rem', letterSpacing: '0.35em', color: T.brass, textTransform: 'uppercase', marginTop: '1.5rem', fontWeight: 800 }}>
                          IA Analizando Métrica Facial... {scanProgress}%
                        </div>
                        <div style={{ width: 220, height: 3, background: 'rgba(196,148,58,0.2)', marginTop: '0.8rem', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: T.goldGrad, width: `${scanProgress}%`, transition: 'width 0.2s ease' }} />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: T.muted }}>
                    <div style={{ fontSize: 32, marginBottom: '0.5rem' }}>📷</div>
                    <div style={{ fontSize: '0.8rem' }}>No hay foto cargada</div>
                  </div>
                )}

                {/* Badge Overlay */}
                <div style={{ position: 'absolute', bottom: '0.85rem', left: '0.85rem', background: 'rgba(13,11,8,0.85)', backdropFilter: 'blur(6px)', padding: '0.4rem 0.85rem', border: `1px solid ${T.border}`, borderRadius: 2, fontSize: '0.65rem', color: T.brass }}>
                  Estilo Visualizado: <strong style={{ color: T.cream }}>{currentStyle?.name}</strong>
                </div>
              </div>

              {/* Adjustments Controls (Scale, Position, Color) */}
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: T.card2, border: `1px solid ${T.border}`, borderRadius: 2 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: T.muted, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      <span>Escala</span>
                      <span>{Math.round(hairScale * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0.7"
                      max="1.4"
                      step="0.05"
                      value={hairScale}
                      onChange={e => setHairScale(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: T.brass }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: T.muted, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      <span>Altura</span>
                      <span>{hairOffsetY}px</span>
                    </label>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      step="2"
                      value={hairOffsetY}
                      onChange={e => setHairOffsetY(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: T.brass }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.6rem', color: T.muted, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Tono
                    </label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {[
                        { label: 'Negro', hex: '#1c130d' },
                        { label: 'Castaño', hex: '#3a2718' },
                        { label: 'Rubio', hex: '#9e7641' },
                      ].map(c => (
                        <button
                          key={c.hex}
                          onClick={() => setHairColor(c.hex)}
                          style={{
                            width: 20, height: 20, borderRadius: '50%', background: c.hex,
                            border: `2px solid ${hairColor === c.hex ? T.brass : 'transparent'}`,
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Scan Button */}
              <button
                onClick={runAiFacialAnalysis}
                disabled={isAiScanning}
                style={{
                  width: '100%', marginTop: '1.25rem', background: T.goldGrad, border: 'none', borderRadius: 2, padding: '0.95rem',
                  color: '#1a0e00', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: isAiScanning ? 'wait' : 'pointer',
                  boxShadow: '0 4px 20px rgba(196,148,58,0.25)',
                }}
              >
                {isAiScanning ? 'Escaneando Métrica Facial...' : '✨ Analizar Mi Rostro con IA'}
              </button>
            </div>

            {/* RIGHT COLUMN: AI RECOMMENDATION RESULT & HAIRCUT CATALOG */}
            <div>
              {/* AI Result Card */}
              {aiAnalysis ? (
                <div style={{ background: T.card2, border: `2px solid ${T.brass}`, padding: '1.75rem', borderRadius: 2, marginBottom: '1.5rem', animation: 'fadeIn 0.4s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.62rem', color: T.brass, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 800 }}>
                      ✨ RECOMENDACIÓN OFICIAL DE LA IA
                    </div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: T.brass, fontWeight: 800 }}>
                      {aiAnalysis.score}% <span style={{ fontSize: '0.65rem', color: T.muted }}>MATCH</span>
                    </div>
                  </div>

                  <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', color: T.cream, fontWeight: 700, marginBottom: '0.5rem' }}>
                    Estilo Recomendado: <span style={{ color: T.brass }}>{aiAnalysis.bestStyle.name}</span>
                  </h4>

                  <p style={{ fontFamily: "'Lora', serif", color: T.creamMuted, fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                    {aiAnalysis.explanation}
                  </p>

                  <div style={{ fontSize: '0.72rem', color: T.brass, marginBottom: '1.25rem', background: 'rgba(196,148,58,0.1)', padding: '0.6rem 0.85rem', borderRadius: 2 }}>
                    🧴 Producto sugerido por IA para peinar este estilo: <strong>{aiAnalysis.recommendedGel}</strong>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedStyleId(aiAnalysis.bestStyle.id)
                      setAttachedReference(true)
                      scrollTo('reservas')
                      addToast(`Corte ${aiAnalysis.bestStyle.name} seleccionado para tu turno`, 'success')
                    }}
                    style={{
                      width: '100%', background: T.goldGrad, border: 'none', borderRadius: 2, padding: '0.85rem',
                      color: '#1a0e00', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                    }}
                  >
                    Reservar Este Corte Recomendado por IA →
                  </button>
                </div>
              ) : (
                <div style={{ background: T.card2, border: `1px dashed ${T.border}`, padding: '1.5rem', borderRadius: 2, marginBottom: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: '0.4rem' }}>✨</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: T.brass, marginBottom: '0.3rem' }}>
                    ¿No sabés qué corte te queda mejor?
                  </div>
                  <div style={{ fontSize: '0.78rem', color: T.muted, fontFamily: "'Lora', serif" }}>
                    Presioná el botón <strong>"✨ Analizar Mi Rostro con IA"</strong> para obtener una recomendación personalizada en tiempo real.
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.6rem', color: T.brass, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 700 }}>
                Catálogo Completo de Cortes
              </div>

              <div className="styles-grid mob-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', maxHeight: 420, overflowY: 'auto', paddingRight: '0.4rem' }}>
                {HAIR_STYLES.map(style => {
                  const isSel = selectedStyleId === style.id
                  return (
                    <div
                      key={style.id}
                      onClick={() => {
                        setSelectedStyleId(style.id)
                        addToast(`Estilo ${style.name} seleccionado`, 'info')
                      }}
                      style={{
                        background: isSel ? 'rgba(196,148,58,0.08)' : T.card,
                        border: `1px solid ${isSel ? T.brass : T.border}`,
                        borderRadius: 2, padding: '1rem', cursor: 'pointer', transition: 'all 0.25s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.52rem', letterSpacing: '0.25em', color: T.brass, background: 'rgba(196,148,58,0.12)', padding: '0.15rem 0.45rem', borderRadius: 1, fontWeight: 700 }}>
                          {style.tag}
                        </span>
                        {isSel && <span style={{ color: T.brass, fontSize: 13, fontWeight: 'bold' }}>✓</span>}
                      </div>

                      <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.2rem' }}>{style.name}</h4>
                      <p style={{ color: T.muted, fontSize: '0.72rem', fontFamily: "'Lora', serif", fontStyle: 'italic', marginBottom: '0.75rem', lineHeight: 1.4 }}>{style.subtitle}</p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `1px solid ${T.border}`, paddingTop: '0.6rem' }}>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', color: T.brass, fontWeight: 700 }}>{fmt(style.price)}</span>
                        <span style={{ fontSize: '0.62rem', color: T.muted }}>{style.duration}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          runAiStyleRender(style.id)
                        }}
                        disabled={isAiRendering}
                        style={{
                          width: '100%', marginTop: '0.7rem', background: isSel ? T.goldGrad : 'transparent',
                          border: isSel ? 'none' : `1px solid ${T.brass}`, borderRadius: 2, padding: '0.55rem',
                          color: isSel ? '#1a0e00' : T.brass, fontWeight: 800, fontSize: '0.62rem',
                          letterSpacing: '0.12em', textTransform: 'uppercase', cursor: isAiRendering ? 'wait' : 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {isAiRendering && aiRenderStyleId === style.id
                          ? 'Generando Corte...'
                          : '✨ Probar este corte'}
                      </button>
                    </div>
                  )
                })}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════ VENTA DE RESERVAS EN EL DÍA O LA SEMANA ═══════════════ */}
      <section id="reservas" className="app-section cvis" style={{ padding: '7rem 2.5rem', maxWidth: 1320, margin: '0 auto' }}>
        <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start', marginBottom: '3.5rem' }}>
          <div>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.45em', color: T.brass, textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ display: 'inline-block', width: 22, height: 1, background: T.brass }} />
              Turnos Disponibles Hoy y Esta Semana
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: 700, lineHeight: 1.05 }}>
              Reservas Pagas<br /><em style={{ color: T.brass }}>en el día / semana</em>
            </h2>
          </div>
          <p style={{ fontFamily: "'Lora', serif", color: T.creamMuted, lineHeight: 1.85, fontSize: '0.92rem', paddingTop: '0.5rem' }}>
            Asegurá tu turno enviando la seña del 50% por transferencia al Alias de Mercado Pago. Es rápido, privado y no requiere claves.
          </p>
        </div>

        {/* Wizard Container */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 2, overflow: 'hidden' }}>
          
          {/* Step Indicator Header */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: T.card2 }}>
            {[
              '1. Servicio & Seña',
              '2. Día de esta semana & Hora',
              '3. Seña al Alias MP (Súper Fácil)',
              '4. Ticket de Reserva Confirmada',
            ].map((label, index) => {
              const isActive = bookingStep === index
              const isDone = bookingStep > index
              return (
                <div
                  key={label}
                  style={{
                    flex: 1, padding: '1.2rem 0.5rem', textAlign: 'center', fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: isActive ? T.brass : isDone ? 'rgba(196,148,58,0.5)' : T.muted,
                    borderBottom: isActive ? `3px solid ${T.brass}` : '3px solid transparent',
                    background: isActive ? 'rgba(196,148,58,0.06)' : 'transparent',
                    fontWeight: isActive ? 700 : 500, transition: 'all 0.3s',
                  }}
                >
                  <span style={{ marginRight: 6 }}>{isDone ? '✓' : `0${index + 1}`}</span>
                  {label}
                </div>
              )
            })}
          </div>

          <div className="wizard-body" style={{ padding: '3rem 2.75rem' }}>

            {/* ── STEP 0: SERVICE SELECT ── */}
            {bookingStep === 0 && (
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '1.75rem', fontWeight: 700 }}>
                  Elegí el servicio para tu corte
                </h3>

                <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                  {SERVICES.map(s => {
                    const isSel = selectedServiceId === s.id
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedServiceId(s.id)}
                        style={{
                          padding: '1.5rem', border: `1px solid ${isSel ? T.brass : T.border}`,
                          borderRadius: 2, cursor: 'pointer', background: isSel ? 'rgba(196,148,58,0.08)' : T.card2,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                          <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700 }}>{s.name}</h4>
                          {isSel && <span style={{ color: T.brass, fontSize: 16, fontWeight: 800 }}>✓</span>}
                        </div>
                        <p style={{ color: T.muted, fontSize: '0.8rem', fontFamily: "'Lora', serif", fontStyle: 'italic', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                          {s.desc}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `1px solid ${T.border}`, paddingTop: '0.85rem' }}>
                          <div>
                            <span style={{ color: T.brass, fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700 }}>{fmt(s.price)}</span>
                            <span style={{ fontSize: '0.65rem', color: T.muted, marginLeft: '0.5rem' }}>(Seña 50%: {fmt(Math.round(s.price * s.depositPct))})</span>
                          </div>
                          <span style={{ color: T.muted, fontSize: '0.68rem' }}>⏱ {s.duration}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 1: DAY OF THE WEEK & HOUR SELECTOR ── */}
            {bookingStep === 1 && (
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', marginBottom: '1.25rem', fontWeight: 700 }}>
                  Elegí tu día de la semana & horario disponible
                </h3>

                {/* Days of this Week Selector Tabs */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {thisWeekDays.map(day => {
                    const isSel = selectedDateStr === day.dateStr
                    return (
                      <button
                        key={day.dateStr}
                        disabled={day.isSunday}
                        onClick={() => !day.isSunday && setSelectedDateStr(day.dateStr)}
                        style={{
                          flex: 1, minWidth: 100, padding: '1rem 0.6rem', textAlign: 'center',
                          borderRadius: 2, cursor: day.isSunday ? 'not-allowed' : 'pointer',
                          background: isSel ? T.goldGrad : T.card2,
                          border: `1px solid ${isSel ? T.brass : T.border}`,
                          color: day.isSunday ? 'rgba(107,89,64,0.3)' : isSel ? '#1a0e00' : T.cream,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: '0.62rem', letterSpacing: '0.15em', fontWeight: 800 }}>{day.dayName}</div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 800, margin: '2px 0' }}>{day.dayNum}</div>
                        <div style={{ fontSize: '0.55rem', opacity: 0.8 }}>{day.monthName}</div>
                      </button>
                    )
                  })}
                </div>

                <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3rem', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', marginBottom: '1rem' }}>
                      Horarios Disponibles para {dateDisplayStr}
                    </h4>
                    <div className="slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem', marginBottom: '1.5rem' }}>
                      {TIME_SLOTS.map(slot => {
                        const isSel = selectedTime === slot
                        return (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            style={{
                              padding: '0.7rem', textAlign: 'center', fontSize: '0.82rem',
                              border: `1px solid ${isSel ? T.brass : T.border}`,
                              borderRadius: 2, cursor: 'pointer',
                              color: isSel ? '#1a0e00' : T.cream,
                              background: isSel ? T.goldGrad : T.card2,
                              fontWeight: isSel ? 800 : 500, transition: 'all 0.2s',
                            }}
                          >
                            {slot} hs
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', marginBottom: '1rem' }}>
                      Elegí tu Maestro Barbero
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {BARBERS.map(b => {
                        const isSel = selectedBarberId === b.id
                        return (
                          <div
                            key={b.id}
                            onClick={() => setSelectedBarberId(b.id)}
                            style={{
                              padding: '0.85rem 1rem', border: `1px solid ${isSel ? T.brass : T.border}`,
                              borderRadius: 2, cursor: 'pointer', background: isSel ? 'rgba(196,148,58,0.08)' : T.card2,
                              display: 'flex', alignItems: 'center', gap: '0.85rem', transition: 'all 0.2s',
                            }}
                          >
                            <img src={b.avatar} alt={b.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${T.brass}` }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.95rem', fontWeight: 700 }}>{b.name}</div>
                              <div style={{ color: T.brass, fontSize: '0.58rem', textTransform: 'uppercase' }}>{b.specialty}</div>
                            </div>
                            {isSel && <span style={{ color: T.brass, fontWeight: 'bold' }}>✓</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: SUPER SIMPLE MERCADO PAGO ALIAS PAYMENT ── */}
            {bookingStep === 2 && (
              <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3.5rem', alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: '0.62rem', color: T.brass, textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '0.5rem', fontWeight: 800 }}>
                    PAGO DIRECTO SÚPER FÁCIL & SEGURO
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                    Enviá la Seña al Alias de Mercado Pago
                  </h3>

                  {/* Big Alias Card */}
                  <div style={{ background: T.card2, border: `2px solid ${T.brass}`, borderRadius: 4, padding: '2rem', marginBottom: '1.75rem' }}>
                    <div style={{ fontSize: '0.6rem', color: T.muted, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      ALIAS MERCADO PAGO / BANCO
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: '#0a0806', border: `1px solid ${T.border}`, padding: '1rem 1.25rem', borderRadius: 2, marginBottom: '1rem' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '1.35rem', color: T.brass, fontWeight: 800, letterSpacing: '0.05em' }}>
                        {MP_ALIAS}
                      </span>
                      <button
                        onClick={copyAliasToClipboard}
                        style={{
                          background: T.goldGrad, border: 'none', borderRadius: 2, padding: '0.55rem 1rem',
                          color: '#1a0e00', fontWeight: 800, fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                        }}
                      >
                        📋 Copiar Alias
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: T.creamMuted }}>
                      <div>Titular: <strong style={{ color: T.cream }}>{MP_TITULAR}</strong></div>
                      <div>Monto Seña 50%: <strong style={{ color: T.brass, fontSize: '1.1rem' }}>{fmt(depositAmount)}</strong></div>
                    </div>
                  </div>

                  {/* Two Simple Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                      onClick={sendWhatsAppConfirmation}
                      style={{
                        background: '#25d366', border: 'none', borderRadius: 2, padding: '1rem',
                        color: '#fff', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                        boxShadow: '0 4px 20px rgba(37,211,102,0.3)',
                      }}
                    >
                      <span>💬</span>
                      <span>Enviar Comprobante por WhatsApp</span>
                    </button>

                    <button
                      onClick={() => {
                        createReservation()
                      }}
                      style={{
                        background: T.goldGrad, border: 'none', borderRadius: 2, padding: '1rem',
                        color: '#1a0e00', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                        boxShadow: '0 4px 20px rgba(196,148,58,0.25)',
                      }}
                    >
                      <span>🎟</span>
                      <span>Confirmar y Generar Ticket QR Digital</span>
                    </button>
                  </div>
                </div>

                {/* Summary Box */}
                <div style={{ background: T.card2, padding: '2rem', borderRadius: 2, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '0.22em', color: T.muted, textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 700 }}>
                    Resumen de Tu Turno
                  </div>

                  {[
                    ['Servicio', currentService.name],
                    ['Barbero', currentBarber.name],
                    ['Día', dateDisplayStr],
                    ['Horario', `${selectedTime} hs`],
                    ['Corte Ref.', attachedReference && currentStyle ? currentStyle.name : 'Sin foto'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.82rem' }}>
                      <span style={{ color: T.muted }}>{k}</span>
                      <span style={{ textTransform: 'capitalize', textAlign: 'right', maxWidth: 160, color: T.cream, fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}

                  <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: '1.1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
                      <span style={{ color: T.muted }}>Total Servicio:</span>
                      <span style={{ color: T.cream }}>{fmt(currentService.price)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ color: T.brass, fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Seña a Transferir (50%):</span>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: T.brass, fontWeight: 800 }}>
                        {fmt(depositAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: TICKET DE RESERVA CONFIRMADA ── */}
            {bookingStep === 3 && confirmedReservation && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: 72, height: 72, background: T.goldGrad, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 1.5rem', color: '#1a0e00', boxShadow: '0 8px 30px rgba(196,148,58,0.35)' }}>
                  ✓
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.4rem', marginBottom: '0.5rem', fontWeight: 800 }}>
                  ¡Reserva Confirmada!
                </h3>
                <p style={{ fontFamily: "'Lora', serif", color: T.creamMuted, fontSize: '0.96rem', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: 540, margin: '0 auto 2.5rem' }}>
                  Te esperamos el <strong style={{ color: T.cream, textTransform: 'capitalize' }}>{confirmedReservation.dateDisplay}</strong> a las <strong style={{ color: T.cream }}>{confirmedReservation.time} hs</strong> en San Telmo.
                </p>

                {/* Printable Ticket */}
                <div style={{ maxWidth: 480, margin: '0 auto 2.5rem', background: T.card2, border: `2px solid ${T.brass}`, padding: '2.25rem', borderRadius: 4, textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}`, paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700 }}>El Búho Dorado</div>
                      <div style={{ fontSize: '0.52rem', color: T.brass, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Ticket de Reserva Pagada</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.55rem', color: T.muted }}>VOUCHER NO.</div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: T.brass, fontWeight: 800 }}>{confirmedReservation.id}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.58rem', color: T.muted, textTransform: 'uppercase' }}>SERVICIO</div>
                      <div style={{ color: T.cream, fontWeight: 600 }}>{confirmedReservation.serviceName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.58rem', color: T.muted, textTransform: 'uppercase' }}>BARBERO</div>
                      <div style={{ color: T.cream, fontWeight: 600 }}>{confirmedReservation.barberName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.58rem', color: T.muted, textTransform: 'uppercase' }}>DÍA Y HORA</div>
                      <div style={{ color: T.cream, fontWeight: 600 }}>{confirmedReservation.dateDisplay} · {confirmedReservation.time} hs</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.58rem', color: T.muted, textTransform: 'uppercase' }}>SEÑA PAGADA</div>
                      <div style={{ color: T.brass, fontWeight: 700 }}>{fmt(confirmedReservation.depositPaid)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: `1px dashed ${T.border}`, paddingTop: '1.25rem' }}>
                    <div style={{ width: 64, height: 64, background: '#fff', padding: 4, borderRadius: 2, flexShrink: 0 }}>
                      <svg viewBox="0 0 100 100" width="56" height="56">
                        <rect width="100" height="100" fill="#fff" />
                        <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" fill="#000" />
                        <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" fill="#000" />
                        <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" fill="#000" />
                        <rect x="40" y="40" width="20" height="20" fill="#000" />
                      </svg>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: T.muted, lineHeight: 1.5 }}>
                      Presentá este comprobante en la recepción de Calle Urquiza 1315, Rosario (Horarios: 10:00 a 18:00 hs). Restante a abonar en el local: {fmt(confirmedReservation.totalPrice - confirmedReservation.depositPaid)}.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => window.print()}
                    style={{
                      background: T.goldGrad, border: 'none', borderRadius: 2, padding: '0.85rem 1.8rem',
                      color: '#1a0e00', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                    }}
                  >
                    🖨 Imprimir / Guardar Ticket
                  </button>
                  <button
                    onClick={() => setBookingStep(0)}
                    style={{
                      background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 2, padding: '0.85rem 1.8rem',
                      color: T.muted, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                    }}
                  >
                    Nueva Reserva
                  </button>
                </div>
              </div>
            )}

            {/* Step Navigation Buttons */}
            {bookingStep < 2 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.75rem', borderTop: `1px solid ${T.border}` }}>
                <button
                  onClick={() => bookingStep > 0 && setBookingStep(prev => prev - 1)}
                  disabled={bookingStep === 0}
                  style={{
                    background: 'transparent', border: `1px solid ${bookingStep === 0 ? 'rgba(107,89,64,0.15)' : T.border}`,
                    borderRadius: 2, padding: '0.75rem 1.75rem', color: bookingStep === 0 ? 'rgba(107,89,64,0.3)' : T.muted,
                    fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: bookingStep === 0 ? 'default' : 'pointer',
                  }}
                >
                  ← Anterior
                </button>

                <button
                  onClick={() => setBookingStep(prev => prev + 1)}
                  style={{
                    background: T.goldGrad,
                    border: 'none', borderRadius: 2, padding: '0.75rem 2rem',
                    color: '#1a0e00', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(196,148,58,0.2)',
                  }}
                >
                  Continuar a Pago por Alias →
                </button>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ═══════════════ CATÁLOGO DE CREMAS, GELES Y POMADAS ═══════════════ */}
      <section id="tienda-geles" className="app-section cvis" style={{ padding: '7rem 2.5rem', maxWidth: 1320, margin: '0 auto' }}>
        <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'end', marginBottom: '3.5rem' }}>
          <div>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.45em', color: T.brass, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <span style={{ display: 'inline-block', width: 22, height: 1, background: T.brass, marginRight: '0.6rem', verticalAlign: 'middle' }} />
              Venta de Productos Capilares
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: 700, lineHeight: 1.05 }}>
              Catálogo de Cremas,<br /><em style={{ color: T.brass }}>Geles y Pomadas</em>
            </h2>
          </div>
          
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignSelf: 'end' }}>
            {['Todos', 'Cremas & Pomadas', 'Geles', 'Ceras', 'Aceites & Bálsamos'].map(cat => (
              <button
                key={cat}
                onClick={() => setProductCategoryFilter(cat)}
                style={{
                  background: productCategoryFilter === cat ? T.goldGrad : 'transparent',
                  border: `1px solid ${productCategoryFilter === cat ? T.brass : T.border}`,
                  borderRadius: 2, padding: '0.55rem 1.1rem', color: productCategoryFilter === cat ? '#1a0e00' : T.muted,
                  fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                  fontWeight: productCategoryFilter === cat ? 800 : 400, transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mob-stack prod-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: T.border }}>
          {filteredProducts.map(p => {
            const inCartItem = cart.find(i => i.id === p.id)
            return (
              <div key={p.id} style={{ background: T.card, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ position: 'relative', height: 270, overflow: 'hidden', background: '#070605' }}>
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    className="prod-img-zoom"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  />
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', fontSize: '0.52rem', letterSpacing: '0.3em', color: T.brass, background: 'rgba(13,11,8,0.85)', padding: '0.2rem 0.55rem', borderRadius: 1, textTransform: 'uppercase', fontWeight: 700 }}>
                    {p.category}
                  </div>
                </div>

                <div style={{ padding: '1.75rem' }}>
                  <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>{p.name}</h4>
                  <p style={{ color: T.muted, fontSize: '0.78rem', fontFamily: "'Lora', serif", fontStyle: 'italic', lineHeight: 1.55, marginBottom: '1rem' }}>{p.description}</p>
                  
                  <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.6rem', background: 'rgba(196,148,58,0.1)', color: T.brass, border: `1px solid ${T.border}`, padding: '0.2rem 0.55rem', borderRadius: 1 }}>
                      Fijación: {p.hold}
                    </span>
                    <span style={{ fontSize: '0.6rem', background: 'rgba(196,148,58,0.1)', color: T.brass, border: `1px solid ${T.border}`, padding: '0.2rem 0.55rem', borderRadius: 1 }}>
                      {p.shine}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${T.border}`, paddingTop: '1rem' }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: T.brass, fontWeight: 700 }}>{fmt(p.price)}</span>
                    <button
                      onClick={() => addToCart(p)}
                      style={{
                        background: inCartItem ? 'rgba(196,148,58,0.15)' : 'transparent',
                        border: `1px solid ${inCartItem ? T.brass : T.border}`,
                        borderRadius: 2, padding: '0.55rem 1.1rem', cursor: 'pointer',
                        color: inCartItem ? T.brass : T.muted, fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                        fontWeight: 700, transition: 'all 0.2s',
                      }}
                    >
                      {inCartItem ? `En Carrito (${inCartItem.qty})` : '+ Comprar'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="app-section" style={{ background: '#060504', borderTop: `1px solid ${T.border}`, padding: '5rem 2.5rem 3rem' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2.5rem', marginBottom: '4rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 36, height: 36, background: T.goldGrad, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#1a0e00', fontWeight: 800 }}>◈</div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700 }}>El Búho Dorado</div>
                  <div style={{ fontSize: '0.52rem', letterSpacing: '0.3em', color: T.brass, textTransform: 'uppercase' }}>Barbería · Est. 1947</div>
                </div>
              </div>
              <p style={{ fontFamily: "'Lora', serif", color: T.muted, fontSize: '0.82rem', lineHeight: 1.75, maxWidth: 300, fontStyle: 'italic' }}>
                Asesoría de cortes con Inteligencia Artificial, reservas en el día o la semana y venta exclusiva de cremas, geles y pomadas de peinado.
              </p>
            </div>

            {[
              { title: 'Navegación', links: ['Inicio', 'Probá tu Corte (IA)', 'Reservas de la Semana', 'Cremas & Geles'] },
              { title: 'Productos', links: ['Pomada Fuerte Noir', 'Gel Extra Forte', 'Cera Mate Rioplatense', 'Crema Brillantina'] },
              { title: 'Ubicación & Contacto', links: ['Calle Urquiza 1315, Rosario', 'Rosario, Santa Fe, Argentina', 'Horarios: 10:00 a 18:00 hs', '+54 341 4362-8800'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.35em', color: T.brass, textTransform: 'uppercase', marginBottom: '1.25rem', fontWeight: 700 }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {col.links.map(l => (
                    <span key={l} style={{ fontSize: '0.78rem', color: T.muted, cursor: 'pointer', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = T.cream)}
                      onMouseLeave={e => (e.currentTarget.style.color = T.muted)}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: T.muted }}>© 2026 El Búho Dorado. Todos los derechos reservados.</div>
          </div>
        </div>
      </footer>

      {/* ═══════════════ CART DRAWER ═══════════════ */}
      {showCartDrawer && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(13,11,8,0.75)', backdropFilter: 'blur(5px)' }}
          onClick={e => e.target === e.currentTarget && setShowCartDrawer(false)}
        >
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 420, background: T.card, borderLeft: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.75rem', borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700 }}>Carrito de Cremas & Geles</div>
              <button onClick={() => setShowCartDrawer(false)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: T.muted, fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: '0.9rem' }}>
                  Tu carrito está vacío
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 0', borderBottom: `1px solid ${T.border}` }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 2 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: T.brass }}>{fmt(item.price)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button onClick={() => updateCartQty(item.id, -1)} style={{ background: T.card2, border: `1px solid ${T.border}`, width: 24, height: 24, color: T.cream, cursor: 'pointer' }}>-</button>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{item.qty}</span>
                      <button onClick={() => updateCartQty(item.id, 1)} style={{ background: T.card2, border: `1px solid ${T.border}`, width: 24, height: 24, color: T.cream, cursor: 'pointer' }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', paddingLeft: '0.5rem' }}>✕</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '1.75rem', borderTop: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
                  <span style={{ color: T.muted, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: T.brass, fontWeight: 800 }}>{fmt(cartTotal)}</span>
                </div>
                <button
                  disabled={isBuyingCart}
                  onClick={() => {
                    setIsBuyingCart(true)
                    setTimeout(() => {
                      setIsBuyingCart(false)
                      setCart([])
                      setShowCartDrawer(false)
                      addToast('¡Compra de productos confirmada! Te los entregamos en San Telmo o por correo.', 'success')
                    }, 1800)
                  }}
                  style={{
                    width: '100%', background: T.goldGrad, border: 'none', borderRadius: 2, padding: '0.9rem',
                    color: '#1a0e00', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer',
                  }}
                >
                  {isBuyingCart ? 'Procesando Pago...' : 'Pagar Productos Online →'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ ADMIN PANEL MODAL ═══════════════ */}
      {showAdminPanel && (
        <AdminPanel
          reservations={adminReservations}
          onUpdateStatus={(id, newStatus) => {
            setAdminReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
            addToast(`Estado de la reserva ${id} actualizado a ${newStatus}`, 'info')
          }}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {/* ═══════════════ MOBILE STICKY CTA BAR ═══════════════ */}
      <div className="mob-cta-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 180, background: 'rgba(13,11,8,0.97)', backdropFilter: 'blur(14px)', borderTop: `1px solid ${T.border}`, display: 'none', gap: '0.75rem', padding: '0.75rem 1.25rem', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <button
          onClick={() => setShowCartDrawer(true)}
          style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 2, padding: '0.9rem 1rem', color: T.cream, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
        >
          🛒 {cartCount > 0 ? `(${cartCount})` : ''}
        </button>
        <button
          onClick={() => scrollTo('reservas')}
          style={{ flex: 1, background: T.goldGrad, border: 'none', borderRadius: 2, padding: '0.9rem', color: '#1a0e00', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 4px 20px rgba(196,148,58,0.35)' }}
        >
          📅 Reservar Turno
        </button>
      </div>

    </div>
  )
}
