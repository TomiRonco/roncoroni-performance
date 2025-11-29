-- Agregar campo de notas privadas a reparaciones
ALTER TABLE reparaciones 
ADD COLUMN IF NOT EXISTS notas_privadas TEXT;

-- Comentario explicativo
COMMENT ON COLUMN reparaciones.notas_privadas IS 'Notas privadas del taller, no visibles para el cliente';
