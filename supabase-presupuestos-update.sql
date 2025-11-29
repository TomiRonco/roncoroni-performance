-- ============================================
-- SOLO EJECUTAR ESTO SI YA TIENES LA TABLA REPARACIONES
-- Script para agregar tabla de presupuestos
-- ============================================

CREATE TABLE IF NOT EXISTS public.presupuestos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reparacion_id UUID REFERENCES public.reparaciones(id) ON DELETE CASCADE NOT NULL,
    descripcion_trabajo TEXT NOT NULL,
    costo_mano_obra DECIMAL(10,2) NOT NULL,
    costo_repuestos DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    enviado_whatsapp BOOLEAN DEFAULT false,
    fecha_envio TIMESTAMP WITH TIME ZONE
);

-- Habilitar Row Level Security (RLS) para presupuestos
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver presupuestos de sus reparaciones
CREATE POLICY "Los usuarios pueden ver sus propios presupuestos"
    ON public.presupuestos
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.reparaciones 
            WHERE reparaciones.id = presupuestos.reparacion_id 
            AND reparaciones.user_id = auth.uid()
        )
    );

-- Política: Los usuarios pueden crear presupuestos para sus reparaciones
CREATE POLICY "Los usuarios pueden crear presupuestos"
    ON public.presupuestos
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.reparaciones 
            WHERE reparaciones.id = presupuestos.reparacion_id 
            AND reparaciones.user_id = auth.uid()
        )
    );

-- Política: Los usuarios pueden actualizar presupuestos de sus reparaciones
CREATE POLICY "Los usuarios pueden actualizar sus presupuestos"
    ON public.presupuestos
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.reparaciones 
            WHERE reparaciones.id = presupuestos.reparacion_id 
            AND reparaciones.user_id = auth.uid()
        )
    );

-- Política: Los usuarios pueden eliminar presupuestos de sus reparaciones
CREATE POLICY "Los usuarios pueden eliminar sus presupuestos"
    ON public.presupuestos
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.reparaciones 
            WHERE reparaciones.id = presupuestos.reparacion_id 
            AND reparaciones.user_id = auth.uid()
        )
    );

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_presupuestos_reparacion_id ON public.presupuestos(reparacion_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_created_at ON public.presupuestos(created_at DESC);
