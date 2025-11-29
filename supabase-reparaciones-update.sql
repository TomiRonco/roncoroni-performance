-- Agregar campos para notificación de retiro
ALTER TABLE reparaciones 
ADD COLUMN IF NOT EXISTS lista_para_retirar BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fecha_notificacion_retiro TIMESTAMP WITH TIME ZONE;

-- Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_reparaciones_lista_para_retirar 
ON reparaciones(lista_para_retirar);
