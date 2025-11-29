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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Roncoroni</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex">
          <button
            onClick={() => setActiveTab('reparaciones')}
            className={`flex-1 py-3 text-center font-medium transition-all flex flex-col items-center gap-1 ${
              activeTab === 'reparaciones'
                ? 'text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs font-medium">Reparaciones</span>
          </button>
          <button
            onClick={() => setActiveTab('estadisticas')}
            className={`flex-1 py-3 text-center font-medium transition-all flex flex-col items-center gap-1 ${
              activeTab === 'estadisticas'
                ? 'text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium">Estadísticas</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
