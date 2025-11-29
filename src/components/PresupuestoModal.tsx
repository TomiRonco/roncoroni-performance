import { useState } from 'react';
import Modal from './Modal';
import type { Presupuesto } from '../types/database.types';

interface PresupuestoModalProps {
  isOpen: boolean;
  onClose: () => void;
  reparacionId: string;
  clienteNombre: string;
  clienteApellido: string;
  clienteCelular: string;
  marca: string;
  cilindrada: string;
  onSave: (presupuesto: Presupuesto) => Promise<void>;
}

export default function PresupuestoModal({
  isOpen,
  onClose,
  reparacionId,
  clienteNombre,
  clienteApellido,
  clienteCelular,
  marca,
  cilindrada,
  onSave,
}: PresupuestoModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    descripcion_trabajo: '',
    costo_mano_obra: '',
    costo_repuestos: '',
  });

  const calcularTotal = () => {
    const manoObra = parseFloat(formData.costo_mano_obra) || 0;
    const repuestos = parseFloat(formData.costo_repuestos) || 0;
    return manoObra + repuestos;
  };

  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const generarMensajeWhatsApp = () => {
    const total = calcularTotal();

    const mensaje = `
🏍️ *Roncoroni Performance*

👤 Cliente: ${clienteNombre} ${clienteApellido}
🏍️ Moto: ${marca} ${cilindrada}

📋 *Trabajos a realizar:*
${formData.descripcion_trabajo}

━━━━━━━━━━━━━━━━━
💰 *COSTO TOTAL: ${formatearPrecio(total)}*
━━━━━━━━━━━━━━━━━

¡Gracias por confiar en nosotros! 🔧
    `.trim();

    return encodeURIComponent(mensaje);
  };

  const handleEnviarWhatsApp = async () => {
    if (!formData.descripcion_trabajo || !formData.costo_mano_obra) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      const total = calcularTotal();
      const presupuesto: Presupuesto = {
        reparacion_id: reparacionId,
        descripcion_trabajo: formData.descripcion_trabajo,
        costo_mano_obra: parseFloat(formData.costo_mano_obra),
        costo_repuestos: parseFloat(formData.costo_repuestos) || 0,
        total,
        enviado_whatsapp: true,
        fecha_envio: new Date().toISOString(),
      };

      await onSave(presupuesto);

      // Limpiar el número de teléfono (eliminar espacios, guiones, etc)
      const numeroLimpio = clienteCelular.replace(/\D/g, '');
      const numeroCompleto = numeroLimpio.startsWith('549') 
        ? numeroLimpio 
        : `549${numeroLimpio}`;

      // Abrir WhatsApp
      const mensajeWhatsApp = generarMensajeWhatsApp();
      const urlWhatsApp = `https://wa.me/${numeroCompleto}?text=${mensajeWhatsApp}`;
      
      // En móvil, usar location.href en lugar de window.open para abrir la app directamente
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        window.location.href = urlWhatsApp;
      } else {
        window.open(urlWhatsApp, '_blank');
      }

      // Resetear formulario y cerrar
      setFormData({
        descripcion_trabajo: '',
        costo_mano_obra: '',
        costo_repuestos: '',
      });
      onClose();
    } catch (error) {
      console.error('Error al guardar presupuesto:', error);
      alert('Error al guardar el presupuesto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Presupuesto">
      <div className="space-y-4">
        {/* Info del cliente */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <h3 className="font-medium text-gray-900 mb-2 text-sm">Información</h3>
          <p className="text-sm text-gray-700">
            <strong>Cliente:</strong> {clienteNombre} {clienteApellido}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Moto:</strong> {marca} {cilindrada}
          </p>
          <p className="text-sm text-gray-700">
            <strong>WhatsApp:</strong> {clienteCelular}
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Descripción del trabajo *
            </label>
            <textarea
              required
              value={formData.descripcion_trabajo}
              onChange={(e) =>
                setFormData({ ...formData, descripcion_trabajo: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none text-sm"
              placeholder="Ej: Cambio de aceite y filtro, regulación de cadena..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Costo de mano de obra * ($)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.costo_mano_obra}
              onChange={(e) =>
                setFormData({ ...formData, costo_mano_obra: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
              placeholder="15000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Costo de repuestos ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.costo_repuestos}
              onChange={(e) =>
                setFormData({ ...formData, costo_repuestos: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
              placeholder="5000"
            />
          </div>

          {/* Total */}
          {(formData.costo_mano_obra || formData.costo_repuestos) && (
            <div className="bg-gray-50 border border-gray-300 rounded p-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-gray-900">Total:</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatearPrecio(calcularTotal())}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded font-medium hover:bg-gray-50 transition text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleEnviarWhatsApp}
            disabled={loading || !formData.descripcion_trabajo || !formData.costo_mano_obra}
            className="flex-1 bg-gray-900 text-white py-3 rounded font-medium hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              'Guardando...'
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Enviar por WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
