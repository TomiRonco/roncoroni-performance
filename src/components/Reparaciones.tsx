import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Reparacion } from '../types/database.types';
import Modal from './Modal';

export default function Reparaciones() {
  const [reparaciones, setReparaciones] = useState<Reparacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
      const { data, error } = await supabase
        .from('reparaciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReparaciones(data || []);
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

      // Resetear formulario
      setFormData({
        nombre: '',
        apellido: '',
        celular: '',
        marca: '',
        cilindrada: '',
        observaciones: '',
      });
      setShowModal(false);
      fetchReparaciones();
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

  return (
    <div className="p-4 space-y-4">
      {/* Botón para abrir modal */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-700 transition active:scale-98"
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
            <div key={rep.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {rep.nombre} {rep.apellido}
                  </h3>
                  <p className="text-sm text-gray-600">📱 {rep.celular}</p>
                </div>
                <button
                  onClick={() => rep.id && handleDelete(rep.id)}
                  className="text-red-500 hover:text-red-700 text-xl"
                >
                  🗑️
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <div>
                  <span className="text-gray-600">Marca:</span>
                  <span className="ml-1 font-medium">{rep.marca}</span>
                </div>
                <div>
                  <span className="text-gray-600">Cilindrada:</span>
                  <span className="ml-1 font-medium">{rep.cilindrada}</span>
                </div>
              </div>

              {rep.observaciones && (
                <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                  <strong>Observaciones:</strong> {rep.observaciones}
                </div>
              )}

              {rep.created_at && (
                <div className="mt-2 text-xs text-gray-500">
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
    </div>
  );
}
