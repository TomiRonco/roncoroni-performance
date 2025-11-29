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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">🏍️ Roncoroni Performance</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pb-6">
        {activeTab === 'reparaciones' ? <Reparaciones /> : <Estadisticas />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex">
          <button
            onClick={() => setActiveTab('reparaciones')}
            className={`flex-1 py-4 text-center font-medium transition flex flex-col items-center gap-1 ${
              activeTab === 'reparaciones'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl">📝</span>
            <span className="text-xs">Reparaciones</span>
          </button>
          <button
            onClick={() => setActiveTab('estadisticas')}
            className={`flex-1 py-4 text-center font-medium transition flex flex-col items-center gap-1 ${
              activeTab === 'estadisticas'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl">📊</span>
            <span className="text-xs">Estadísticas</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
