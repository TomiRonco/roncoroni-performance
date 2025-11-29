import { useState } from 'react';
import { supabase } from '../supabaseClient';
import Reparaciones from './Reparaciones';
import Estadisticas from './Estadisticas';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'reparaciones' | 'estadisticas'>('reparaciones');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">🏍️ Roncoroni</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b sticky top-[65px] z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('reparaciones')}
            className={`flex-1 py-4 text-center font-medium transition ${
              activeTab === 'reparaciones'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📝 Reparaciones
          </button>
          <button
            onClick={() => setActiveTab('estadisticas')}
            className={`flex-1 py-4 text-center font-medium transition ${
              activeTab === 'estadisticas'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📊 Estadísticas
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="pb-6">
        {activeTab === 'reparaciones' ? <Reparaciones /> : <Estadisticas />}
      </main>
    </div>
  );
}
