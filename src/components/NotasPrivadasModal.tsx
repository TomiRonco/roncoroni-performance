import { useState } from 'react';
import Modal from './Modal';

interface NotasPrivadasModalProps {
  isOpen: boolean;
  onClose: () => void;
  notas: string;
  onSave: (notas: string) => Promise<void>;
}

export default function NotasPrivadasModal({
  isOpen,
  onClose,
  notas,
  onSave,
}: NotasPrivadasModalProps) {
  const [notasText, setNotasText] = useState(notas);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(notasText);
      onClose();
    } catch (error) {
      console.error('Error al guardar notas:', error);
      alert('Error al guardar las notas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notas Privadas">
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-xs text-yellow-800">
            🔒 Estas notas son privadas y solo las verás tú. No se comparten con el cliente.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Notas internas
          </label>
          <textarea
            value={notasText}
            onChange={(e) => setNotasText(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none text-sm"
            placeholder="Escribe tus notas privadas aquí..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded font-medium hover:bg-gray-50 transition text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-gray-900 text-white py-3 rounded font-medium hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
