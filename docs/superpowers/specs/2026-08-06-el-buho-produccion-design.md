# Design: Producción de El Búho Dorado — Refactor + Datos + Pagos

Fecha: 2026-08-06
Estado: aprobado (borrador para revisión del usuario)

## Contexto

"El Búho Dorado" es la web de una barbería boutique (React 19 + Vite + Tailwind v4 + Express). Objetivo: negocio real en producción. Estado actual crítico:

- `App.tsx` es un monolito de 1.995 líneas con estilos inline.
- Agujero de seguridad: el panel admin se abre sin PIN si el backend está caído (`catch { setAuthed(true) }`).
- Pagos falsos: `createPaymentPreference` y el checkout del carrito no cobran nada.
- Webhook de Mercado Pago es un stub sin validación de firma.
- Persistencia frágil: `localStorage` por dispositivo; Google Sheets sin configurar; Supabase sin usar.
- Catálogo y precios hardcodeados en el componente.
- QR del voucher es una imagen estática; email del dueño hardcodeado.
- Inconsistencia "San Telmo" vs "Rosario".

## Principios

1. **Seguridad primero**: nada de acceso sin PIN real, nada de pagos simulados en producción.
2. **Datos antes que UI**: la capa de datos limpia habilita la descomposición, no al revés.
3. **Código que toca dinero se refactoriza con tests**, no después.
4. **No cambiar comportamiento visible durante el refactor** (salvo fixes explícitos de bugs).
5. **YAGNI**: no se agregan features nuevas que no estén listadas.

## Alcance por fase

### Fase 0 — Blindar lo crítico (precondición)

Cerrar el agujero de seguridad del admin, corregir datos inconsistentes y preparar el entorno de datos real.

- **0.1 Admin auth seguro**: el frontend NO debe autenticar por `catch`. Ante fallo de red, mostrar error "No se pudo contactar el servidor" con reintento, nunca abrir el panel. El PIN solo se valida en el backend.
- **0.2 Inconsistencia de ubicación**: unificar "San Telmo" → "Rosario" (Urquiza 1315). Extraer constantes de contacto (dirección, teléfono, horarios, email dueño) a `src/data/business.ts`.
- **0.3 Email del dueño configurable**: reemplazar `dueno@gmail.com` hardcodeado por variable de entorno (`VITE_OWNER_EMAIL` para fallback FormSubmit; `OWNER_EMAIL` ya existe en servidor).

### Fase 1 — Capa de datos limpia

Separar datos de UI. Fuente de verdad: Supabase (si está configurada) con `localStorage` como cache/fallback offline.

- **1.1 Catálogo**: mover `HAIR_STYLES`, `SERVICES`, `BARBERS`, `HAIR_PRODUCTS`, `TIME_SLOTS`, `MP_ALIAS`, `SAMPLE_FACES` a `src/data/catalog.ts` (tipado, sin cambios de contenido).
- **1.2 Repositorio de reservas** (`src/services/reservations.ts`):
  - `listReservations()`, `createReservation()`, `updateReservationStatus()`
  - Backend: Supabase si está configurada; si no, `localStorage`.
  - Interfaz única; los componentes no saben cuál usan.
- **1.3 Repositorio de carrito** (`src/services/cart.ts`): persistencia del carrito en `localStorage`, rehidratación al montar.
- **1.4 Tests de lógica financiera**: cálculo de seña (50%), totales del carrito, formateo de moneda, filtros de estado del admin. Usar Vitest (a agregar).
- **1.5 Migración del estado**: `App.tsx` deja de manejar `adminReservations` y `cart` directamente; usa los repositorios vía hooks.

Criterio de aceptación F1: `App.tsx` no contiene datos de catálogo ni lógica de persistencia; los tests de dinero pasan.

### Fase 2 — Descomponer el monolito

Extraer componentes por sección, conservando el diseño actual. Objetivo: `App.tsx` < 200 líneas.

- `src/components/layout/Navbar.tsx`, `Footer.tsx`, `MobileCtaBar.tsx`
- `src/components/home/Hero.tsx`, `HoverCardGallery.tsx`
- `src/components/studio/HaircutStudio.tsx`, `HaircutOverlaySVG.tsx`
- `src/components/booking/BookingWizard.tsx` (pasos 0-3)
- `src/components/shop/ProductShop.tsx`, `CartDrawer.tsx`
- `src/components/ui/Toast.tsx`, botones/badges reutilizables
- `src/theme.ts`: el objeto `T` (tokens) se importa donde se necesite (no se pasa por props).

Cada componente recibe props tipadas y callbacks; los hooks de estado suben a `App.tsx` (que orquesta) o se encapsulan en hooks custom (`useBookings`, `useCart`) según convenga. Sin cambios visuales.

Criterio de aceptación F2: `App.tsx` < 200 líneas; `npm run build` y `tsc --noEmit` pasan; el sitio se ve idéntico (verificación manual + screenshot).

### Fase 3 — Mercado Pago real

- **3.1 Backend `POST /api/checkout/create-preference`**: usar el SDK `mercadopago` (a agregar) con `access_token` del servidor; validar servicio/barbero/fecha/hora contra catálogo; devolver `init_point` real. Eliminar el mock.
- **3.2 Webhook `POST /api/webhooks/mercadopago`**: validar firma (`x-signature` con `notification_secret`), guardar eventos (`payment.approved`), y marcar la reserva como pagada.
- **3.3 Frontend**: al confirmar, crear la preferencia real y abrir `init_point` en nueva pestaña; en dev sin backend, mantener el flujo de alias manual con banner "modo demo".
- **3.4 Checkout del carrito**: generar preferencia real (multi-item) y redirigir. El mock de `setTimeout` desaparece.

Criterio de aceptación F3: con credenciales reales, una preferencia devuelve `init_point` de MP; el webhook valida firma y confirma una reserva.

### Fase 4 — Pulido visual

- **4.1 Tokens en Tailwind v4**: mapear el tema (`T`) a variables CSS / `@theme` (`noir`, `brass`, `cream`, etc.) en `src/index.css`.
- **4.2 Migrar estilos inline críticos** a clases Tailwind donde reduzca complejidad, conservando el look.
- **4.3 Micro-ajustes de consistencia**: estados hover, foco accesible, contraste, `aria-label` faltantes.

Criterio de aceptación F4: paleta/typo definida en Tailwind; build pasa; a11y básica sin regresiones visuales.

## Arquitectura objetivo

```
src/
  data/            # catálogo, negocio (contacto), constantes
  services/        # api.ts, reservations, cart, notifications, cloud_sync
  components/
    layout/  home/  studio/  booking/  shop/  ui/
  hooks/           # useBookings, useCart
  theme.ts
  App.tsx          # orquestación < 200 líneas
server/
  index.ts         # + rutas checkout y webhook reales, sin mocks
```

## Manejo de errores

- **Admin**: ante error de red en `verify-pin`, mensaje con reintento. Nunca `authed=true` por fallo.
- **Pagos**: si falla la creación de preferencia, toast de error y permanecer en el paso, sin inventar éxito.
- **Datos**: si Supabase no está configurada, operar en `localStorage` sin errores visibles (banner de modo dev en el panel admin).

## Testing

- Agregar Vitest + Testing Library.
- Unidad (F1): seña, totales carrito, formato moneda, filtros de estado.
- Integración (F3): webhook firma válida/inválida; flujo create-preference.
- Comandos: `npm test` (nuevo script), además de `npm run build` y `npx tsc --noEmit`.

## Exclusiones explícitas

- Sin i18n (el sitio ya está en español).
- Sin auth de clientes (cuentas) — fuera de alcance por ahora.
- Sin realtime/WebSockets.
- Sin migración de datos históricos (las reservas de `localStorage` actuales se conservan como están).

## Riesgos

- **Supabase sin proyecto real**: F1 cae a `localStorage` — aceptable; se habilita cuando existan credenciales.
- **Mercado Pago necesita credenciales de producción**: F3 requiere `access_token` y `notification_secret` reales para validarse; el código queda listo y testeable con modo demo.
- **Refactor con cero regresión visual**: se mitiga con F2 por sección + build/typecheck por cada extracción.
