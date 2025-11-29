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
    const manoObra = parseFloat(formData.costo_mano_obra) || 0;
    const repuestos = parseFloat(formData.costo_repuestos) || 0;

    const mensaje = `
🏍️ *PRESUPUESTO - Roncoroni Performance*

👤 Cliente: ${clienteNombre} ${clienteApellido}
🏍️ Moto: ${marca} ${cilindrada}

📋 *Trabajos a realizar:*
${formData.descripcion_trabajo}

💰 *Costos:*
• Mano de obra: ${formatearPrecio(manoObra)}
• Repuestos: ${formatearPrecio(repuestos)}

━━━━━━━━━━━━━━━━━
*TOTAL: ${formatearPrecio(total)}*
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
      window.open(urlWhatsApp, '_blank');

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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Información</h3>
          <p className="text-sm text-blue-800">
            <strong>Cliente:</strong> {clienteNombre} {clienteApellido}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Moto:</strong> {marca} {cilindrada}
          </p>
          <p className="text-sm text-blue-800">
            <strong>WhatsApp:</strong> {clienteCelular}
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción del trabajo *
            </label>
            <textarea
              required
              value={formData.descripcion_trabajo}
              onChange={(e) =>
                setFormData({ ...formData, descripcion_trabajo: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Ej: Cambio de aceite y filtro, regulación de cadena..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="15000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="5000"
            />
          </div>

          {/* Total */}
          {(formData.costo_mano_obra || formData.costo_repuestos) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-green-900">Total:</span>
                <span className="text-2xl font-bold text-green-700">
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
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleEnviarWhatsApp}
            disabled={loading || !formData.descripcion_trabajo || !formData.costo_mano_obra}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              'Guardando...'
            ) : (
              <>
                <span>📱</span>
                <span>Enviar por WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
