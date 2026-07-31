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

  // Perform AI Vision Face Analysis
  analyzeFaceVision: async (payload: AiVisionRequest): Promise<AiVisionResponse> => {
    // In production, this sends payload to backend endpoint POST /api/ai/analyze-face
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
  },
}
