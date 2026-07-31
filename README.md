# 💈 El Búho Dorado Barbería Boutique & Galería Hover Reveal

> Plataforma web interactiva con Asesoría de Cortes asistida por IA, Reserva de Turnos en tiempo real con seña por Mercado Pago, Catálogo E-commerce de productos capilares y Galería de Tarjetas con efectos Hover Reveal (Glassmorphism & Microinteracciones).

---

## 📄 ¿Qué hace el sistema? (Funcionalidades principales)

1. **Asesoría de Cortes Asistida por IA (`Estudio Facial & Haircut Overlay`)**:
   - Permite al usuario subir una foto de su rostro o utilizar modelos de prueba con distintas estructuras óseas (Ovalado, Cuadrado, Redondo, Diamante).
   - Escanea métricas faciales en tiempo real y calcula un **Score de Compatibilidad (%)** sugiriendo el estilo de corte óptimo y el producto de peinado adecuado.
   - Brinda controles interactivos para ajustar la escala (`hairScale`), posición vertical (`hairOffsetY`) y tono del cabello sobre la fotografía.

2. **Galería de Tarjetas con Hover Reveal (`Microinteracciones & Glassmorphism`)**:
   - Tarjetas con animaciones visuales avanzadas: `Glassmorphism Slide-Up`, destellos metálicos `Shimmer Sweep`, zoom suave y revelación en cascada (`staggered fade-in`).
   - Muestra detalles del servicio/producto únicamente al interactuar con el cursor para un diseño limpio y minimalista.

3. **Sistema de Reservas Pagas (Hoy / Esta Semana)**:
   - **Paso 1**: Selección de servicios boutique (Corte Porteño, Afeitado Tradicional a Navaja, Combo Completo, Tratamiento Capilar).
   - **Paso 2**: Elección de días laborables de la semana actual y slots de horario disponibles (09:00 a 19:00 hs). Asignación de Maestro Barbero (Don Carlos, Facundo, Marcelo).
   - **Paso 3**: Confirmación de seña (50%) mediante transferencia directa al Alias de Mercado Pago (`elbuho.dorado.mp`) con botón de copia rápida y enlace directo a WhatsApp.
   - **Paso 4**: Generación de **Ticket / Voucher Digital con Código QR** listo para imprimir o presentar en el local.

4. **Catálogo E-commerce & Carrito (`Cart Drawer`)**:
   - Catálogo interactivo de Cremas, Geles, Ceras y Aceites con filtros por categoría.
   - Carrito lateral desplegable para gestionar cantidades, calcular el total acumulado y simular el pago online.

---

## 🛠️ ¿Cómo lo hace? (Arquitectura Técnica Actual)

- **Frontend Core**: React 19 + TypeScript 5.7 en Vite 8.
- **Estilos & UI**: Tailwind CSS v4 (`@tailwindcss/vite`) + CSS personalizado con CSS Variables y `@theme` en `src/index.css`.
- **Renderizado de Cortes**: Gráficos vectoriales dinámicos (`HaircutOverlaySVG`) superpuestos sobre la imagen del usuario utilizando transformaciones SVG de escala y traslación.
- **Gestión de Estado**: Estado reactivo cliente con React `useState` y `useRef` para renderizado fluido sin latencia de red.
- **Compilación**: Vite bundle optimizado (`npm run build`).

---

## 🚨 ¿Qué le falta para estar 100% listo para PRODUCCIÓN (Mundo Real)?

Para llevar este frontend a un entorno de producción comercial seguro y escalable, se requieren los siguientes módulos backend e integraciones:

### 1. 🔒 Seguridad & Autenticación (Auth & Security)
- [ ] **Autenticación de Usuarios**: Integración de OAuth 2.0 / JWT (ej. Clerk, Supabase Auth o Firebase Auth) para guardar el historial de reservas y compras de cada cliente.
- [ ] **Protección de Datos Sanitarios / Fotos (GDPR / Ley de Protección de Datos Personales)**: Almacenamiento seguro de fotos subidas por clientes en S3 / Cloud Storage con URLs firmadas con expiración temporal (Pre-signed URLs), en lugar de FileReader Base64 en memoria del cliente.
- [ ] **Sanitización & Rate Limiting**: Protección contra ataques de denegación de servicio (DDoS) y rate-limiting en los endpoints de reserva para evitar reservas falsas (spam).

### 2. 💳 Pasarela de Pagos Automática (Mercado Pago SDK & Webhooks)
- [ ] **Integración oficial Mercado Pago Checkout Pro / API**: Sustituir la transferencia manual por Alias por el SDK oficial de Mercado Pago (`@mercadopago/sdk-node` o SDK JS).
- [ ] **Servidor de Webhooks**: Endpoint `POST /api/webhooks/mercadopago` que escuche notificaciones de pago en tiempo real (`payment.created`, `payment.updated`) y confirme automáticamente la reserva sin requerir validación manual vía WhatsApp.

### 3. 🤖 Modelo de Visión IA Real (OpenAI Vision API / Replicate)
- [ ] **API Key de Visión por IA**: Conectar el frontend a un backend que consuma `gpt-4o-mini` (OpenAI Vision) o un modelo PyTorch/YOLO de landmarks faciales para clasificar la forma del rostro con análisis antropométrico real de mentón, pómulos y frente.

### 4. 🗄️ Base de Datos & Backend API (Node.js / PostgreSQL / Supabase)
- [ ] **Base de Datos Relacional**: Modelos en PostgreSQL (vía Prisma ORM o Supabase):
  - `Users` (clientes y administradores).
  - `Services` (precios, duraciones).
  - `Barbers` (disponibilidad y agendas).
  - `Appointments` (estado: `PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `COMPLETED`).
  - `Products` & `Orders` (stock de geles/pomadas en tiempo real).
- [ ] **Gestión de Agendas en Tiempo Real**: WebSocket (Socket.io) o Server-Sent Events (SSE) para bloquear horarios reservados en tiempo real e impedir que dos clientes reserven el mismo turno simultáneamente (*race condition*).

### 5. 📧 Notificaciones & Recordatorios Automáticos
- [ ] **WhatsApp Business Cloud API / Twilio**: Envío automático de mensaje de confirmación y recordatorio 2 horas antes del turno.
- [ ] **Emailing transaccional (Resend / SendGrid)**: Envío del comprobante en PDF con el código QR.

---

## 🛈 Ejecución Local

```bash
# Instalar dependencias
pnpm install # o npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```
