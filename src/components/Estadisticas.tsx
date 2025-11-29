import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Reparacion } from '../types/database.types';

interface Stats {
  total: number;
  porMarca: { [key: string]: number };
  porCilindrada: { [key: string]: number };
  ultimaSemana: number;
  ultimoMes: number;
}

export default function Estadisticas() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    porMarca: {},
    porCilindrada: {},
    ultimaSemana: 0,
    ultimoMes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      const { data, error } = await supabase
        .from('reparaciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reparaciones = data || [];
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Calcular estadísticas
      const porMarca: { [key: string]: number } = {};
      const porCilindrada: { [key: string]: number } = {};
      let ultimaSemana = 0;
      let ultimoMes = 0;

      reparaciones.forEach((rep: Reparacion) => {
        // Contar por marca
        porMarca[rep.marca] = (porMarca[rep.marca] || 0) + 1;

        // Contar por cilindrada
        porCilindrada[rep.cilindrada] = (porCilindrada[rep.cilindrada] || 0) + 1;

        // Contar últimas semana y mes
        if (rep.created_at) {
          const createdDate = new Date(rep.created_at);
          if (createdDate >= oneWeekAgo) ultimaSemana++;
          if (createdDate >= oneMonthAgo) ultimoMes++;
        }
      });

      setStats({
        total: reparaciones.length,
        porMarca,
        porCilindrada,
        ultimaSemana,
        ultimoMes,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Resumen general */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg">
          <div className="text-3xl font-bold">{stats.total}</div>
          <div className="text-sm opacity-90 mt-1">Total</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-lg">
          <div className="text-3xl font-bold">{stats.ultimaSemana}</div>
          <div className="text-sm opacity-90 mt-1">Esta semana</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-lg">
          <div className="text-3xl font-bold">{stats.ultimoMes}</div>
          <div className="text-sm opacity-90 mt-1">Este mes</div>
        </div>
      </div>

      {/* Por marca */}
      <div className="bg-white rounded-lg shadow-lg p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          🏍️ Por Marca
        </h3>
        {Object.keys(stats.porMarca).length === 0 ? (
          <p className="text-gray-500 text-sm">No hay datos disponibles</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(stats.porMarca)
              .sort(([, a], [, b]) => b - a)
              .map(([marca, cantidad]) => (
                <div key={marca}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{marca}</span>
                    <span className="text-sm font-bold text-blue-600">{cantidad}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all"
                      style={{
                        width: `${(cantidad / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Por cilindrada */}
      <div className="bg-white rounded-lg shadow-lg p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          ⚙️ Por Cilindrada
        </h3>
        {Object.keys(stats.porCilindrada).length === 0 ? (
          <p className="text-gray-500 text-sm">No hay datos disponibles</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(stats.porCilindrada)
              .sort(([, a], [, b]) => b - a)
              .map(([cilindrada, cantidad]) => (
                <div key={cilindrada}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{cilindrada}</span>
                    <span className="text-sm font-bold text-purple-600">{cantidad}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full transition-all"
                      style={{
                        width: `${(cantidad / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
        <h3 className="text-lg font-bold text-orange-800 mb-2">📈 Insights</h3>
        <div className="space-y-2 text-sm text-orange-900">
          {stats.total > 0 && (
            <>
              <p>
                • Marca más popular:{' '}
                <strong>
                  {Object.entries(stats.porMarca).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
                </strong>
              </p>
              <p>
                • Cilindrada más común:{' '}
                <strong>
                  {Object.entries(stats.porCilindrada).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
                </strong>
              </p>
              <p>
                • Promedio semanal:{' '}
                <strong>{(stats.total / 4).toFixed(1)} reparaciones</strong>
              </p>
            </>
          )}
          {stats.total === 0 && (
            <p>No hay suficientes datos para mostrar insights.</p>
          )}
        </div>
      </div>
    </div>
  );
}
