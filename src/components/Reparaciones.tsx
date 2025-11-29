import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Reparacion, Presupuesto } from '../types/database.types';
import Modal from './Modal';
import PresupuestoModal from './PresupuestoModal';
import NotasPrivadasModal from './NotasPrivadasModal';

export default function Reparaciones() {
  const [reparaciones, setReparaciones] = useState<Reparacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPresupuestoModal, setShowPresupuestoModal] = useState(false);
  const [showNotasModal, setShowNotasModal] = useState(false);
  const [reparacionActual, setReparacionActual] = useState<Reparacion | null>(null);
  const [presupuestosMap, setPresupuestosMap] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    celular: '',
    marca: '',
    cilindrada: '',
    observaciones: '',
  });

  useEffect(() => {
    fetchReparaciones();
  }, []);

  const fetchReparaciones = async () => {
    try {
      // Cargar reparaciones
      const { data, error } = await supabase
        .from('reparaciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReparaciones(data || []);

      // Cargar presupuestos para saber cuáles reparaciones ya tienen
      const { data: presupuestos, error: presupuestosError } = await supabase
        .from('presupuestos')
        .select('reparacion_id');

      if (presupuestosError) throw presupuestosError;

      // Crear un mapa de reparacion_id -> true si existe presupuesto
      const map: { [key: string]: boolean } = {};
      presupuestos?.forEach((p: { reparacion_id?: string }) => {
        if (p.reparacion_id) {
          map[p.reparacion_id] = true;
        }
      });
      setPresupuestosMap(map);
    } catch (error) {
      console.error('Error al cargar reparaciones:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('reparaciones') as any).insert({
        ...formData,
        user_id: user?.id,
      });

      if (error) throw error;

      setShowModal(false);
      fetchReparaciones();
      
      // Resetear formulario
      setFormData({
        nombre: '',
        apellido: '',
        celular: '',
        marca: '',
        cilindrada: '',
        observaciones: '',
      });
      
      alert('¡Reparación registrada exitosamente!');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar la reparación');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta reparación?')) return;

    try {
      const { error } = await supabase.from('reparaciones').delete().eq('id', id);
      if (error) throw error;
      fetchReparaciones();
      alert('Reparación eliminada');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar la reparación');
    }
  };

  const handleSavePresupuesto = async (presupuesto: Presupuesto) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('presupuestos') as any).insert(presupuesto);
      if (error) throw error;
      
      // Recargar reparaciones y presupuestos para actualizar el estado
      fetchReparaciones();
    } catch (error) {
      console.error('Error al guardar presupuesto:', error);
      throw error;
    }
  };

  const handleCrearPresupuesto = (reparacion: Reparacion) => {
    setReparacionActual(reparacion);
    setShowPresupuestoModal(true);
  };

  const handleAbrirNotas = (reparacion: Reparacion) => {
    setReparacionActual(reparacion);
    setShowNotasModal(true);
  };

  const handleGuardarNotas = async (notas: string) => {
    if (!reparacionActual?.id) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('reparaciones') as any).update({
        notas_privadas: notas
      }).eq('id', reparacionActual.id);

      if (error) throw error;
      
      // Recargar reparaciones
      fetchReparaciones();
    } catch (error) {
      console.error('Error al guardar notas:', error);
      throw error;
    }
  };

  const handleNotificarRetiro = async (reparacion: Reparacion) => {
    try {
      // Actualizar la reparación como lista para retirar
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('reparaciones') as any).update({ 
        lista_para_retirar: true,
        fecha_notificacion_retiro: new Date().toISOString()
      }).eq('id', reparacion.id);

      if (error) throw error;

      // Crear mensaje de WhatsApp
      const mensaje = `
🏍️ *RONCORONI PERFORMANCE*

Hola ${reparacion.nombre}! 👋

Tu *${reparacion.marca} ${reparacion.cilindrada}* ya está lista para retirar! ✅

Estamos a tu disposición. ¡Gracias por confiar en nosotros! 🔧
      `.trim();

      const numeroLimpio = reparacion.celular.replace(/\D/g, '');
      const numeroCompleto = numeroLimpio.startsWith('549') 
        ? numeroLimpio 
        : `549${numeroLimpio}`;

      const urlWhatsApp = `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(mensaje)}`;

      // Abrir WhatsApp
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        window.location.href = urlWhatsApp;
      } else {
        window.open(urlWhatsApp, '_blank');
      }

      // Recargar datos
      fetchReparaciones();
    } catch (error) {
      console.error('Error al notificar retiro:', error);
      alert('Error al enviar notificación');
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      {/* Botón para abrir modal */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-gray-900 text-white py-3 rounded font-medium hover:bg-gray-800 transition text-sm"
      >
        + Nueva Reparación
      </button>

      {/* Modal con formulario */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nueva Reparación"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Juan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                required
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Pérez"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Celular *
            </label>
            <input
              type="tel"
              required
              value={formData.celular}
              onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="3512345678"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca *
              </label>
              <input
                type="text"
                required
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Honda, Yamaha..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cilindrada *
              </label>
              <input
                type="text"
                required
                value={formData.cilindrada}
                onChange={(e) => setFormData({ ...formData, cilindrada: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="250cc"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Detalles de la reparación..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Lista de reparaciones */}
      <div className="space-y-3">
        {reparaciones.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No hay reparaciones registradas</p>
            <p className="text-sm mt-2">¡Agrega tu primera reparación!</p>
          </div>
        ) : (
          reparaciones.map((rep) => (
            <div key={rep.id} className="bg-white border border-gray-200 rounded p-4 hover:border-gray-300 transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-base text-gray-900">
                    {rep.nombre} {rep.apellido}
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">{rep.celular}</p>
                </div>
                <div className="flex gap-2">
                  {presupuestosMap[rep.id || ''] ? (
                    <>
                      {/* Icono de presupuestado */}
                      <div className="text-green-600" title="Presupuestado">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      
                      {/* Botón para notificar retiro */}
                      {!rep.lista_para_retirar && (
                        <button
                          onClick={() => handleNotificarRetiro(rep)}
                          className="text-blue-600 hover:text-blue-700 transition"
                          title="Notificar que está lista para retirar"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </button>
                      )}
                      
                      {/* Icono de notificado */}
                      {rep.lista_para_retirar && (
                        <div className="text-blue-600" title="Notificado para retirar">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleCrearPresupuesto(rep)}
                      className="bg-gray-900 hover:bg-gray-800 text-white p-2 rounded transition"
                      title="Crear presupuesto y enviar por WhatsApp"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </button>
                  )}
                  {/* Botón de notas privadas */}
                  <button
                    onClick={() => handleAbrirNotas(rep)}
                    className={`transition ${
                      rep.notas_privadas 
                        ? 'text-yellow-600 hover:text-yellow-700' 
                        : 'text-gray-400 hover:text-yellow-600'
                    }`}
                    title={rep.notas_privadas ? 'Ver/editar notas privadas' : 'Agregar notas privadas'}
                  >
                    <svg className="w-5 h-5" fill={rep.notas_privadas ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {/* Botón de eliminar */}
                  <button
                    onClick={() => rep.id && handleDelete(rep.id)}
                    className="text-gray-400 hover:text-red-600 transition"
                    title="Eliminar reparación"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                <div>
                  <span className="text-gray-500 text-xs">Marca</span>
                  <p className="font-medium text-gray-900">{rep.marca}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Cilindrada</span>
                  <p className="font-medium text-gray-900">{rep.cilindrada}</p>
                </div>
              </div>

              {rep.observaciones && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700 border border-gray-100">
                  <span className="text-xs font-medium text-gray-500">Observaciones:</span>
                  <p className="mt-1">{rep.observaciones}</p>
                </div>
              )}

              {rep.created_at && (
                <div className="mt-3 text-xs text-gray-400">
                  {new Date(rep.created_at).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal de Presupuesto */}
      {reparacionActual && (
        <PresupuestoModal
          isOpen={showPresupuestoModal}
          onClose={() => {
            setShowPresupuestoModal(false);
            setReparacionActual(null);
          }}
          reparacionId={reparacionActual.id || ''}
          clienteNombre={reparacionActual.nombre}
          clienteApellido={reparacionActual.apellido}
          clienteCelular={reparacionActual.celular}
          marca={reparacionActual.marca}
          cilindrada={reparacionActual.cilindrada}
          onSave={handleSavePresupuesto}
        />
      )}

      {/* Modal de Notas Privadas */}
      {reparacionActual && (
        <NotasPrivadasModal
          isOpen={showNotasModal}
          onClose={() => {
            setShowNotasModal(false);
            setReparacionActual(null);
          }}
          notas={reparacionActual.notas_privadas || ''}
          onSave={handleGuardarNotas}
        />
      )}
    </div>
  );
}
