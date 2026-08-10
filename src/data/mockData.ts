import { HairStyle, SampleFace, Service, Barber, HairProduct, FaqItem, Testimonial } from '../types'

export const T = {
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

export const HAIR_STYLES: HairStyle[] = [
  {
    id: 'pompadour',
    name: 'Pompadour Noir',
    subtitle: 'Altura, elegancia y distinción',
    description: 'Elevación frontal con copete voluptuoso y degradé nítido en los laterales. Inspirado en la época dorada del tango porteño.',
    price: 5200,
    duration: '60 min',
    tag: 'TENDENCIA',
    recommendedProduct: 'Pomada Fuerte Noir Búho (Fijación Máxima)',
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
    recommendedProduct: 'Crema de Peinado Brillantina Classic',
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
    recommendedProduct: 'Gel Fluido Moldeador Ligero',
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

export const SAMPLE_FACES: SampleFace[] = [
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

export const SERVICES: Service[] = [
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

export const BARBERS: Barber[] = [
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

export const HAIR_PRODUCTS: HairProduct[] = [
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

export const TIME_SLOTS = ['10:00', '10:45', '11:30', '12:15', '13:00', '14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:00']

export const MP_ALIAS = 'elbuho.dorado.mp'
export const MP_TITULAR = 'El Búho Dorado Barbería'

export const fmt = (n: number) => `$ ${n.toLocaleString('es-AR')}`

export const getThisWeekDays = () => {
  const days = []
  const today = new Date()
  for (let i = 0; i < 14; i++) {
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

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: '¿Es obligatorio reservar turno previo?',
    a: 'Recomendamos reservar con anticipación para garantizar tu horario con tu barbero de preferencia. Sin embargo, recibimos clientes sin turno sujeto a disponibilidad.',
  },
  {
    q: '¿Cómo funciona la seña de reserva del 50%?',
    a: 'Al reservar abonás el 50% mediante Mercado Pago o Transferencia para congelar tu lugar. El 50% restante lo saldás en el local al terminar el servicio.',
  },
  {
    q: '¿Con cuánta anticipación puedo cancelar o reprogramar?',
    a: 'Podés reprogramar o cancelar tu turno con al menos 2 horas de anticipación a través de WhatsApp o llamando al local sin perder tu seña.',
  },
  {
    q: '¿Qué productos utilizan en los servicios?',
    a: 'Utilizamos exclusivamente nuestra línea propia de cosmética capilar masculina "El Búho Dorado", formulada sin sulfatos parabénicos y enriquecida con aceites naturales.',
  },
  {
    q: '¿Cómo funciona el simulador de visagismo con IA?',
    a: 'Podés subir tu foto o seleccionar una de muestra. Nuestra red analiza tus proporciones antropométricas (pómulos, frente, mandíbula) y recomienda el corte que mejor equilibra tus facciones.',
  },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Santiago Benítez',
    role: 'Cliente habitual',
    text: 'Atención impecable. Don Carlos es un maestro con la navaja y el ambiente retro con toallas calientes es de otro nivel. Totalmente recomendado.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
    tag: 'TURNO VERIFICADO',
  },
  {
    id: 't2',
    name: 'Gonzalo Fernández',
    role: 'Empresario',
    text: 'Me hago el corte Fade con Facundo cada dos semanas. La puntualidad y la precisión son imbatibles. Los productos para el cabello son excelentes.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=faces',
    tag: 'COMPRA VERIFICADA',
  },
  {
    id: 't3',
    name: 'Matías Rossi',
    role: 'Diseñador UX',
    text: 'La experiencia web para sacar turno y el probador con IA me volaron la cabeza. Llegué, el turno estaba listo y la cerveza de cortesía un 10.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&crop=faces',
    tag: 'TURNO VERIFICADO',
  },
]
