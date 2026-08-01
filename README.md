# 💈 El Búho Dorado Barbería Boutique & Galería Hover Reveal

> Plataforma web interactiva premium con Asesoría de Cortes asistida por IA, Reserva de Turnos en tiempo real con seña por Mercado Pago, Catálogo E-commerce de productos capilares, Panel Administrativo y Galería de Tarjetas con efectos Hover Reveal (Glassmorphism & Microinteracciones).

---

## 📄 ¿Qué hace el proyecto? (Funcionalidades Principales)

**El Búho Dorado** es un desarrollo web enfocado en la experiencia de cliente de alta gama para barberías boutique. Integra herramientas interactivas de vanguardia:

1. **💈 Asesoría de Cortes Asistida por IA (`Estudio Facial & Haircut Overlay`)**:
   - Análisis y escaneo de métricas faciales sobre fotografías cargadas por el usuario o modelos predeterminados (Estructuras: Ovalado, Cuadrado, Redondo, Diamante).
   - Cálculo dinámico de **Score de Compatibilidad (%)** sugiriendo el corte óptimo y los productos de peinado indicados.
   - Superposición interactiva de cortes de cabello vectoriales con ajuste de escala, traslación vertical y paleta de tonos/colores.

2. **✨ Galería de Tarjetas con Hover Reveal (`Microinteracciones & Glassmorphism`)**:
   - Tarjetas interactivas con animaciones `Glassmorphism Slide-Up`, destellos de brillo `Shimmer Sweep`, zoom fluido y revelado gradual (`staggered fade-in`).
   - Muestra información detallada de servicios y productos al pasar el cursor, optimizando el espacio visual.

3. **📅 Sistema de Reservas Pagas en Tiempo Real**:
   - **Paso 1**: Selección de servicio boutique (Corte Porteño, Afeitado Tradicional, Combo Completo, Tratamiento Capilar).
   - **Paso 2**: Selección de día de la semana y slots de horarios disponibles (09:00 a 19:00 hs) asignados al Maestro Barbero elegido.
   - **Paso 3**: Confirmación de seña (50%) por Mercado Pago (con botón de copia de Alias rápido y derivación a WhatsApp).
   - **Paso 4**: Emisión instantánea de **Ticket / Voucher Digital con Código QR** escaneable para validación presencial.

4. **🛒 Catálogo E-commerce & Carrito Lateral (`Cart Drawer`)**:
   - Catálogo de ceras, geles, pomadas y aceites con filtro por categorías.
   - Carrito lateral responsivo con gestión dinámica de unidades, cálculo de total y simulador de checkout.

5. **⚙️ Panel de Control Administrativo**:
   - Visualización de ingresos totales por señas recopiladas.
   - Listado y filtrado de reservas (`TODOS`, `CONFIRMADO`, `PENDIENTE`, `COMPLETADO`, `CANCELADO`).
   - Cambio de estado de turnos y métricas operativas del establecimiento.

---

## 🛠️ Tecnologías Utilizadas

- **Core**: React 19 + TypeScript 5.7
- **Bundler & Dev Server**: Vite 8
- **Estilos**: Tailwind CSS v4 (`@tailwindcss/vite`) + CSS personalizado (`src/index.css`)
- **Visuales**: Canvas / SVG Dynamic Overlays, Lucide Icons
- **Calidad de Código**: TypeScript strictly typed, `oxfmt`

---

## 🚀 Futuras Mejoras (Roadmap a Producción)

Para llevar este prototipo/MVP a un entorno de producción a gran escala, se recomiendan los siguientes desarrollos backend e integraciones:

### 1. 🔒 Autenticación & Seguridad
- [ ] **Auth OAuth 2.0 / JWT**: Implementación de Supabase Auth, Clerk o Firebase Auth para perfil de usuario e historial de turnos.
- [ ] **Almacenamiento Seguro de Fotos**: Integración con Amazon S3 / Supabase Storage con URLs temporales firmadas (Presigned URLs) cumpliendo normativas de privacidad (GDPR).

### 2. 💳 Pasarela de Pagos Automática & Webhooks
- [ ] **Mercado Pago Checkout API**: Integración nativa del SDK oficial de Mercado Pago para cobros automáticos en tarjeta de crédito/débito y saldo MP.
- [ ] **Webhooks Backend**: Endpoint `POST /api/webhooks/mercadopago` para escuchar cambios de estado (`payment.approved`) y confirmar turnos de forma 100% desatendida.

### 3. 🤖 Visión Artificial & Modelo IA Real
- [x] **Reconocimiento Facial Avanzado**: Integración de OpenAI Vision API (`gpt-4o-mini`) en el backend (`POST /api/ai/analyze-face`) que clasifica la estructura facial real de la foto subida y recomienda el corte óptimo con score de compatibilidad.

### 4. 🗄️ Base de Datos Relacional & Concurrencia
- [ ] **Persistencia en PostgreSQL / Supabase**: Tablas para `Users`, `Barbers`, `Services`, `Appointments`, `Products` y `Orders`.
- [ ] **Prevención de Overbooking (Race Conditions)**: WebSockets (Socket.io / Supabase Realtime) para bloquear cupos en tiempo real mientras un cliente está completando el pago.

### 5. 🔔 Notificaciones Automáticas
- [x] **WhatsApp Cloud API**: Notificación automática al dueño (`POST /api/notifications/booking-confirmation`) con los datos del turno, voucher, seña abonada y teléfono del cliente. Las credenciales viven solo en el servidor.
- [x] **Emails Transaccionales**: Envío automatizado de la reserva por Resend (server-side) con detalle del ticket. Fallback gratuito a FormSubmit.co si el backend no está disponible.

---

## 🛈 Ejecución Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/ExeDevCentral/peluBrian.git
cd peluBrian

# 2. Instalar dependencias
npm install # o pnpm install

# 3. Iniciar el servidor de desarrollo
npm run dev

# 4. Compilar para producción
npm run build

# 5. Comprobar tipos TypeScript
npx tsc --noEmit
```
