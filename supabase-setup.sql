-- Crear tabla de reparaciones en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS public.reparaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    celular TEXT NOT NULL,
    marca TEXT NOT NULL,
    cilindrada TEXT NOT NULL,
    observaciones TEXT DEFAULT '',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.reparaciones ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver solo sus propias reparaciones
CREATE POLICY "Los usuarios pueden ver sus propias reparaciones"
    ON public.reparaciones
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propias reparaciones
CREATE POLICY "Los usuarios pueden crear reparaciones"
    ON public.reparaciones
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propias reparaciones
CREATE POLICY "Los usuarios pueden actualizar sus reparaciones"
    ON public.reparaciones
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar sus propias reparaciones
CREATE POLICY "Los usuarios pueden eliminar sus reparaciones"
    ON public.reparaciones
    FOR DELETE
    USING (auth.uid() = user_id);

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_reparaciones_user_id ON public.reparaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_reparaciones_created_at ON public.reparaciones(created_at DESC);
