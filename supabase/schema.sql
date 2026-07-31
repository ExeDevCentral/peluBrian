-- -----------------------------------------------------------------------------
-- ESQUEMA DE BASE DE DATOS SUPABASE - EL BÚHO DORADO BARBERÍA (ROSARIO)
-- -----------------------------------------------------------------------------

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE RESERVAS / TURNOS (Appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
  id VARCHAR(50) PRIMARY KEY,
  service_name VARCHAR(150) NOT NULL,
  barber_name VARCHAR(100) NOT NULL,
  customer_name VARCHAR(150) DEFAULT 'Cliente Web',
  customer_phone VARCHAR(50) DEFAULT 'Sin teléfono registrado',
  customer_email VARCHAR(150),
  date_display VARCHAR(100) NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  deposit_paid NUMERIC(10, 2) NOT NULL,
  haircut_name VARCHAR(100),
  status VARCHAR(30) DEFAULT 'CONFIRMADO' CHECK (status IN ('PENDIENTE', 'CONFIRMADO', 'COMPLETADO', 'CANCELADO')),
  qr_code_seed VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para búsquedas rápidas por fecha y estado
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON public.appointments(date_display, status);

-- 3. TABLA DE PRODUCTOS (Cremas, Geles, Pomadas)
CREATE TABLE IF NOT EXISTS public.products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  hold VARCHAR(50),
  shine VARCHAR(50),
  price NUMERIC(10, 2) NOT NULL,
  stock INT DEFAULT 50,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. HABILITAR REALTIME (Para actualización instantánea en Panel Barberos)
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- 5. POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Permitir a usuarios anonimos crear turnos y consultar productos
CREATE POLICY "Permitir insercion publica de turnos" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir lectura publica de turnos" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Permitir actualizacion publica de estado" ON public.appointments FOR UPDATE USING (true);

CREATE POLICY "Permitir lectura publica de productos" ON public.products FOR SELECT USING (true);
