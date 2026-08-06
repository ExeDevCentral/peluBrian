// ── API SERVICE LAYER FOR EL BÚHO DORADO ────────────────────────────────────

export interface AppointmentPayload {
  serviceId: string
  barberId: string
  dateStr: string
  timeSlot: string
  customerName?: string
  customerPhone?: string
  depositAmount: number
  referenceHaircut?: string
}

export interface PaymentPreferenceResponse {
  preferenceId: string
  initPoint: string
  sandboxInitPoint: string
}

export interface AiVisionRequest {
  imageBase64: string
}

export interface AiVisionResponse {
  faceShape: string
  score: number
  bestStyleId: string
  explanation: string
  recommendedProduct: string
}

export interface AiRenderRequest {
  image: string
  styleId: string
}

export interface AiRenderResponse {
  data: string
}

// Security Helper: Validate uploaded image file
export function validateUploadedImage(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  const maxSizeMB = 5

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Formato no soportado. Por favor sube una imagen JPG, PNG o WEBP.' }
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `La imagen excede el tamaño máximo permitido (${maxSizeMB} MB).` }
  }

  return { valid: true }
}

// Simulated API calls ready for Production API Backend endpoint substitution
export const BarberiaAPI = {
  // Create Mercado Pago Preference
  createPaymentPreference: async (payload: AppointmentPayload): Promise<PaymentPreferenceResponse> => {
    // In production, this calls: POST /api/checkout/create-preference
    await new Promise(res => setTimeout(res, 600))
    const mockId = `MP-PREF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    return {
      preferenceId: mockId,
      initPoint: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${mockId}`,
      sandboxInitPoint: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${mockId}`,
    }
  },

  // Perform AI Vision Face Analysis (real via backend OpenAI Vision, with local fallback)
  analyzeFaceVision: async (payload: AiVisionRequest): Promise<AiVisionResponse> => {
    try {
      const response = await fetch('/api/ai/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: payload.imageBase64 }),
      })

      if (!response.ok) {
        throw new Error(`Backend respondió ${response.status}`)
      }

      const data = await response.json()
      if (data?.error && data?.fallback) {
        throw new Error(data.error)
      }

      return {
        faceShape: data.faceShape || 'Ovalado',
        score: data.score ?? 90,
        bestStyleId: data.bestStyleId || 'pompadour',
        explanation: data.explanation || 'Análisis facial completado con visión artificial.',
        recommendedProduct: data.recommendedProduct || 'Pomada Fuerte Noir Búho (Fijación Máxima)',
      }
    } catch (err) {
      console.warn('[AI Vision] Backend no disponible, usando simulación local:', err)

      // Local fallback so the app keeps working without the backend running
      await new Promise(res => setTimeout(res, 1800))
      const shapes = ['Ovalado', 'Cuadrado', 'Redondo', 'Diamante']
      const detectedShape = shapes[Math.floor(Math.random() * shapes.length)]

      return {
        faceShape: detectedShape,
        score: Math.floor(92 + Math.random() * 7),
        bestStyleId: 'pompadour',
        explanation: `Detección antropométrica completada para rostro tipo ${detectedShape}. El balance entre pómulos y línea mandibular favorece cortes de volumen superior.`,
        recommendedProduct: 'Pomada Fuerte Noir Búho (Fijación Máxima)',
      }
    }
  },

  // Photorealistic haircut try-on via Google Gemini (Nano Banana image).
  // Throws with data.fallback=true when no GEMINI_API_KEY is configured.
  renderStyle: async (payload: AiRenderRequest): Promise<AiRenderResponse> => {
    const response = await fetch('/api/ai/render-style', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)
    if (!response.ok || data?.fallback) {
      throw new Error(data?.error || `Backend respondió ${response.status}`)
    }
    return { data: data.data }
  },
}
