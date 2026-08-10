import React, { useState, useRef, memo } from 'react'
import { HAIR_STYLES, SAMPLE_FACES, T } from '../data/mockData'
import { HairId, HairStyle, SampleFace, AiAnalysis } from '../types'
import { BarberiaAPI, validateUploadedImage } from '../services/api'

interface HaircutOverlaySVGProps {
  styleId: HairId
  scale?: number
  yOffset?: number
  color?: string
}

const HaircutOverlaySVG: React.FC<HaircutOverlaySVGProps> = ({ styleId, scale = 1, yOffset = 0, color = '#3a2718' }) => {
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
        <svg viewBox="0 0 400 400" className="w-full h-full pointer-events-none drop-shadow-xl" style={{ transform, transformOrigin: 'center 35%' }}>
          <path d="M 130 160 C 130 80, 165 40, 200 38 C 235 40, 270 80, 270 160 C 250 150, 220 130, 200 130 C 180 130, 150 150, 130 160 Z" fill={color} opacity="0.96" />
        </svg>
      )
    case 'quiff':
    default:
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full pointer-events-none drop-shadow-2xl" style={{ transform, transformOrigin: 'center 35%' }}>
          <path d="M 130 155 C 130 90, 150 40, 195 30 C 240 30, 275 80, 270 155 C 250 145, 220 135, 200 135 C 180 135, 150 145, 130 155 Z" fill={color} opacity="0.95" />
        </svg>
      )
  }
}

interface AiVisagismoModalProps {
  initialStyleId?: HairId
  onBookWithStyle: (style: HairStyle) => void
  onAddToast: (msg: string, type?: 'success' | 'info' | 'gold') => void
}

const AiVisagismoModal: React.FC<AiVisagismoModalProps> = memo(({
  initialStyleId = 'pompadour',
  onBookWithStyle,
  onAddToast,
}) => {
  const [selectedStyleId, setSelectedStyleId] = useState<HairId>(initialStyleId)
  const [selectedSampleFace, setSelectedSampleFace] = useState<SampleFace>(SAMPLE_FACES[0])
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState<boolean>(false)
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null)
  const [scale, setScale] = useState<number>(1)
  const [yOffset, setYOffset] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeStyle = HAIR_STYLES.find(s => s.id === selectedStyleId) || HAIR_STYLES[0]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateUploadedImage(file)
    if (!validation.valid) {
      onAddToast(validation.error || 'Imagen inválida', 'info')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomImage(reader.result)
        setAiAnalysis(null)
        onAddToast('Imagen cargada con éxito. Listo para análisis IA.', 'success')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRunAiAnalysis = async () => {
    setAnalyzing(true)
    try {
      const activeImg = customImage || selectedSampleFace.url
      const response = await BarberiaAPI.analyzeFaceVision({ imageBase64: activeImg })
      const matchedStyle = HAIR_STYLES.find(s => s.id === response.bestStyleId) || HAIR_STYLES[0]
      
      setAiAnalysis({
        faceShape: response.faceShape,
        score: response.score,
        bestStyle: matchedStyle,
        explanation: response.explanation,
        recommendedGel: response.recommendedProduct,
      })
      setSelectedStyleId(matchedStyle.id)
      onAddToast(`¡Análisis IA completado! Rostro detectado: ${response.faceShape}`, 'gold')
    } catch (err: any) {
      onAddToast('Error al conectar con la IA. Usando recomendación antropométrica local.', 'info')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <section id="visagismo" className="py-24 bg-[#161210] border-t border-[#c4943a]/20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#1a1410] border border-[#c4943a]/30 text-xs font-bold text-[#c4943a] uppercase tracking-widest mb-3">
            <span>✨ VISAGISMO DIGITAL INTELIGENTE</span>
          </div>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#f2e6cc] mb-4">
            Simulador de Cortes con IA
          </h2>
          <p className="text-sm sm:text-base text-[#f2e6cc]/70">
            Subí tu propia fotografía o selecciona un modelo para simular el encuadre de cortes y obtener una recomendación según tu estructura facial.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: SIMULATOR CANVAS / DISPLAY */}
          <div className="lg:col-span-7 bg-[#0d0b08] p-6 rounded border border-[#c4943a]/30 flex flex-col items-center">
            
            <div className="relative w-full max-w-[360px] aspect-[4/5] rounded overflow-hidden border-2 border-[#c4943a]/40 bg-[#161210] shadow-2xl flex items-center justify-center">
              {/* Target Image */}
              <img
                src={customImage || selectedSampleFace.url}
                alt="Simulación de rostro"
                className="w-full h-full object-cover"
              />

              {/* Vector SVG Hair Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <HaircutOverlaySVG styleId={selectedStyleId} scale={scale} yOffset={yOffset} color={activeStyle.color} />
              </div>

              {/* Face Shape Badge Overlay */}
              {aiAnalysis && (
                <div className="absolute top-3 left-3 bg-[#0d0b08]/90 backdrop-blur border border-[#c4943a] px-3 py-1.5 rounded text-xs font-bold text-[#c4943a]">
                  Rostro {aiAnalysis.faceShape} ({aiAnalysis.score}% afinidad)
                </div>
              )}
            </div>

            {/* Scale & Y-Offset Controls */}
            <div className="w-full max-w-[360px] mt-6 grid grid-cols-2 gap-4 text-xs font-semibold text-[#f2e6cc]/80">
              <div>
                <label className="block mb-1 text-[10px] text-[#c4943a] uppercase font-bold">Escala del Corte</label>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={scale}
                  onChange={e => setScale(parseFloat(e.target.value))}
                  className="w-full accent-[#c4943a]"
                />
              </div>
              <div>
                <label className="block mb-1 text-[10px] text-[#c4943a] uppercase font-bold">Ajuste Vertical</label>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  step="2"
                  value={yOffset}
                  onChange={e => setYOffset(parseInt(e.target.value))}
                  className="w-full accent-[#c4943a]"
                />
              </div>
            </div>

            {/* Custom Photo Upload & Trigger AI */}
            <div className="w-full max-w-[360px] mt-6 flex gap-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 bg-[#161210] hover:bg-[#1a1410] border border-[#c4943a]/40 hover:border-[#c4943a] text-[#f2e6cc] text-xs font-bold rounded uppercase tracking-wider transition-all"
              >
                {customImage ? 'Cambiar Foto' : '📷 Subir Mi Foto'}
              </button>
              
              <button
                onClick={handleRunAiAnalysis}
                disabled={analyzing}
                className="flex-1 py-3 bg-[#c4943a] hover:bg-[#e5b657] text-[#0d0b08] text-xs font-extrabold rounded uppercase tracking-wider transition-all shadow disabled:opacity-50"
              >
                {analyzing ? 'Analizando...' : '⚡ Analizar IA'}
              </button>
            </div>

          </div>

          {/* RIGHT: CONTROLS & AI RECOMMENDATION RESULT */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Sample Faces Selector */}
            <div className="bg-[#1a1410] p-6 rounded border border-[#c4943a]/20">
              <h3 className="text-xs font-extrabold text-[#c4943a] uppercase tracking-widest mb-3">
                1. Selecciona Rostro de Muestra
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {SAMPLE_FACES.map((face) => (
                  <button
                    key={face.id}
                    onClick={() => {
                      setSelectedSampleFace(face)
                      setCustomImage(null)
                      setAiAnalysis(null)
                    }}
                    className={`relative rounded overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      selectedSampleFace.id === face.id && !customImage
                        ? 'border-[#c4943a] scale-105 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={face.url} alt={face.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Style Selector Buttons */}
            <div className="bg-[#1a1410] p-6 rounded border border-[#c4943a]/20">
              <h3 className="text-xs font-extrabold text-[#c4943a] uppercase tracking-widest mb-3">
                2. Selecciona Estilo a Probar
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {HAIR_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyleId(style.id)}
                    className={`p-3 text-left rounded border transition-all cursor-pointer ${
                      selectedStyleId === style.id
                        ? 'bg-[#c4943a]/15 border-[#c4943a] text-[#f2e6cc]'
                        : 'bg-[#161210] border-[#c4943a]/10 text-[#f2e6cc]/70 hover:border-[#c4943a]/40'
                    }`}
                  >
                    <div className="text-xs font-bold">{style.name}</div>
                    <div className="text-[10px] text-[#c4943a]">{style.tag}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Analysis Result Card */}
            {aiAnalysis && (
              <div className="bg-[#1a1410] p-6 rounded border border-[#c4943a]/40 animate-fadeIn">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-[#c4943a] uppercase tracking-widest">
                    DIAGNÓSTICO ANTROPOMÉTRICO
                  </span>
                  <span className="text-xs font-bold bg-[#c4943a] text-[#0d0b08] px-2 py-0.5 rounded">
                    {aiAnalysis.score}% Match
                  </span>
                </div>
                <h4 className="font-['Playfair_Display'] text-lg font-bold text-[#f2e6cc] mb-2">
                  Recomendación: {aiAnalysis.bestStyle.name}
                </h4>
                <p className="text-xs text-[#f2e6cc]/80 leading-relaxed mb-4">
                  {aiAnalysis.explanation}
                </p>
                <div className="text-xs bg-[#0d0b08] p-3 rounded border border-[#c4943a]/20 text-[#c4943a]">
                  <strong>Producto Sugerido: </strong>{aiAnalysis.recommendedGel}
                </div>
              </div>
            )}

            {/* Book Active Style CTA */}
            <button
              onClick={() => onBookWithStyle(activeStyle)}
              className="w-full py-4 bg-[#c4943a] hover:bg-[#e5b657] text-[#0d0b08] font-extrabold text-sm uppercase tracking-wider rounded transition-all shadow-lg cursor-pointer"
            >
              Reservar {activeStyle.name} con Este Estilo
            </button>

          </div>

        </div>

      </div>
    </section>
  )
})

export default AiVisagismoModal
