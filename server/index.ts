import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Mercado Pago Webhook Route
app.post('/api/webhooks/mercadopago', (req, res) => {
  const { type, data } = req.body
  const signature = req.headers['x-signature']

  console.log(`[Mercado Pago Webhook Received] Type: ${type}, Payment ID: ${data?.id}`)
  
  // Signature verification logic with MP secret key
  // ...

  res.status(200).send('OK')
})

// Mercado Pago Create Preference Endpoint
app.post('/api/checkout/create-preference', (req, res) => {
  const { serviceId, barberId, dateStr, timeSlot, depositAmount } = req.body

  // Call Mercado Pago Node SDK Preference API
  const preferenceId = `PREF-${Date.now()}`
  res.json({
    preferenceId,
    initPoint: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`,
  })
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`💈 El Búho Dorado Backend API server running on port ${PORT}`)
  })
}

export default app
