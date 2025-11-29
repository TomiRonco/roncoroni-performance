import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { Presupuesto } from '../types/database.types';
import jsPDF from 'jspdf';

interface Stats {
  totalManoObra: number;
  totalRepuestos: number;
  totalGeneral: number;
  cantidadPresupuestos: number;
}

export default function Estadisticas() {
  const [stats, setStats] = useState<Stats>({
    totalManoObra: 0,
    totalRepuestos: 0,
    totalGeneral: 0,
    cantidadPresupuestos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [mesesDisponibles, setMesesDisponibles] = useState<string[]>([]);

  const fetchPresupuestos = async () => {
    try {
      const { data, error } = await supabase
        .from('presupuestos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const presupuestosData = data || [];
      setPresupuestos(presupuestosData);

      // Obtener meses únicos
      const meses = new Set<string>();
      presupuestosData.forEach((p: Presupuesto) => {
        if (p.created_at) {
          const fecha = new Date(p.created_at);
          const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
          meses.add(mesAnio);
        }
      });
      
      const mesesArray = Array.from(meses).sort().reverse();
      setMesesDisponibles(mesesArray);
      
      // Seleccionar el mes actual por defecto
      const hoy = new Date();
      const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
      setMesSeleccionado(mesActual);
      
    } catch (error) {
      console.error('Error al cargar presupuestos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = useCallback(() => {
    let presupuestosFiltrados = presupuestos;

    // Filtrar por mes si hay uno seleccionado
    if (mesSeleccionado) {
      presupuestosFiltrados = presupuestos.filter((p) => {
        if (!p.created_at) return false;
        const fecha = new Date(p.created_at);
        const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        return mesAnio === mesSeleccionado;
      });
    }

    const totalManoObra = presupuestosFiltrados.reduce(
      (sum, p) => sum + (p.costo_mano_obra || 0),
      0
    );
    const totalRepuestos = presupuestosFiltrados.reduce(
      (sum, p) => sum + (p.costo_repuestos || 0),
      0
    );

    setStats({
      totalManoObra,
      totalRepuestos,
      totalGeneral: totalManoObra + totalRepuestos,
      cantidadPresupuestos: presupuestosFiltrados.length,
    });
  }, [presupuestos, mesSeleccionado]);

  useEffect(() => {
    fetchPresupuestos();
  }, []);

  useEffect(() => {
    calcularEstadisticas();
  }, [calcularEstadisticas]);

  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const obtenerNombreMes = (mesAnio: string) => {
    const [anio, mes] = mesAnio.split('-');
    const fecha = new Date(parseInt(anio), parseInt(mes) - 1);
    return fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Roncoroni Performance', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Reporte Financiero', 105, 30, { align: 'center' });
    
    // Período
    if (mesSeleccionado) {
      doc.setFontSize(12);
      doc.text(`Período: ${obtenerNombreMes(mesSeleccionado)}`, 105, 40, { align: 'center' });
    }
    
    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);
    
    // Totales
    doc.setFontSize(12);
    let yPos = 60;
    
    doc.text('Resumen Financiero:', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.text(`Cantidad de presupuestos: ${stats.cantidadPresupuestos}`, 30, yPos);
    yPos += 10;
    
    doc.text(`Total Mano de Obra (Ganancias): ${formatearPrecio(stats.totalManoObra)}`, 30, yPos);
    yPos += 8;
    
    doc.text(`Total Repuestos: ${formatearPrecio(stats.totalRepuestos)}`, 30, yPos);
    yPos += 8;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL GENERAL: ${formatearPrecio(stats.totalGeneral)}`, 30, yPos);
    
    // Guardar PDF
    const nombreArchivo = mesSeleccionado 
      ? `reporte-${mesSeleccionado}.pdf` 
      : 'reporte-general.pdf';
    doc.save(nombreArchivo);
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
      {/* Filtro y Exportar */}
      <div className="bg-white border border-gray-200 rounded p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Filtrar por mes
          </label>
          <select
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
          >
            <option value="">Todos los meses</option>
            {mesesDisponibles.map((mes) => (
              <option key={mes} value={mes}>
                {obtenerNombreMes(mes)}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={exportarPDF}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded font-medium transition flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar a PDF
        </button>
      </div>

      {/* Resumen Financiero */}
      <div className="bg-white border border-gray-200 rounded p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Resumen Financiero
          {mesSeleccionado && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({obtenerNombreMes(mesSeleccionado)})
            </span>
          )}
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-sm text-gray-700">Cantidad de presupuestos</span>
            <span className="text-lg font-semibold text-gray-900">{stats.cantidadPresupuestos}</span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <div>
              <span className="text-sm text-gray-700">Total Mano de Obra</span>
              <p className="text-xs text-gray-500">(Ganancias)</p>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {formatearPrecio(stats.totalManoObra)}
            </span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-sm text-gray-700">Total Repuestos</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatearPrecio(stats.totalRepuestos)}
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <span className="text-base font-semibold text-gray-900">TOTAL GENERAL</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatearPrecio(stats.totalGeneral)}
            </span>
          </div>
        </div>
      </div>

      {/* Info adicional */}
      {stats.cantidadPresupuestos === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded p-5 text-center">
          <p className="text-sm text-gray-600">
            {mesSeleccionado 
              ? `No hay presupuestos registrados en ${obtenerNombreMes(mesSeleccionado)}`
              : 'No hay presupuestos registrados'}
          </p>
        </div>
      )}
    </div>
  );
}
