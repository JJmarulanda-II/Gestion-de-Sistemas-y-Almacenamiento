// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { obtenerProductos } from '../services/productoService';
import { obtenerSalidas } from '../services/salidaService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- FUNCIONES DE FORMATEO ---
const formatearKilos = (valor) => {
  if (valor == null) return '0';
  return parseFloat(valor).toString();
};

export default function Dashboard() {
  // Estados para nuestras analíticas
  const [metricas, setMetricas] = useState({
    totalVentas: 0,
    totalKilos: 0,
    productosBajoStock: []
  });
  
  // NUEVO ESTADO: Guardamos el historial de ventas
  const [historialVentas, setHistorialVentas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarAnaliticas();
  }, []);

  const cargarAnaliticas = async () => {
    try {
      const [productosData, ventasData] = await Promise.all([
        obtenerProductos(),
        obtenerSalidas()
      ]);

      const ingresos = ventasData.reduce((acumulador, venta) => {
        return acumulador + parseFloat(venta.total_venta);
      }, 0);

      const kilos = productosData.reduce((acumulador, prod) => {
        return acumulador + parseFloat(prod.stock_actual_kilos);
      }, 0);

      const alertas = productosData.filter(prod => parseFloat(prod.stock_actual_kilos) < 5);

      setMetricas({
        totalVentas: ingresos,
        totalKilos: kilos,
        productosBajoStock: alertas
      });
      
      // Guardamos las ventas para la tabla
      setHistorialVentas(ventasData);

    } catch (error) {
      console.error("Error al cargar las analíticas:", error);
    } finally {
      setCargando(false);
    }
  };

  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(valor);
  };

  // --- FUNCIÓN PARA EXPORTAR VENTAS A PDF ---
  const exportarVentasPDF = () => {
    if (historialVentas.length === 0) {
      alert("No hay ventas registradas para exportar.");
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Registro Histórico de Ventas - Pollo Fresh ERP", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}`, 14, 28);

    const columnas = ["Fecha", "Hora", "Producto", "Kilos Vendidos", "Total Cobrado", "Vendedor"];
    const filas = historialVentas.map(venta => {
      const fechaObj = new Date(venta.fecha_venta);
      return [
        fechaObj.toLocaleDateString('es-CO'),
        fechaObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        venta.Producto?.nombre || 'Desconocido',
        `${formatearKilos(venta.cantidad_kilos)} Kg`,
        formatoMoneda(venta.total_venta),
        venta.Usuario?.nombre || 'Desconocido'
      ];
    });

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] }, // Color Naranja corporativo (orange-500)
    });

    doc.save(`Reporte_Ventas_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="p-8">
      
      {/* Título de la sección */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800 border-l-4 border-orange-500 pl-4">
          Panel de Control Analítico
        </h2>
        <p className="text-gray-500 mt-2 ml-5">
          Resumen operativo y financiero de Pollo Fresh.
        </p>
      </div>

      {/* --- SECCIÓN DE ANALÍTICAS (KPIs) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Tarjeta 1: Ingresos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Ingresos Globales</h3>
            <span className="p-2 bg-green-50 text-green-600 rounded-lg">💰</span>
          </div>
          {cargando ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
          ) : (
            <p className="text-3xl font-black text-gray-800">{formatoMoneda(metricas.totalVentas)}</p>
          )}
        </div>

        {/* Tarjeta 2: Stock */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Inventario Total</h3>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">📦</span>
          </div>
          {cargando ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
          ) : (
            <p className="text-3xl font-black text-gray-800">
              {formatearKilos(metricas.totalKilos.toFixed(2))} <span className="text-lg text-gray-500 font-medium">Kg</span>
            </p>
          )}
        </div>

        {/* Tarjeta 3: Alertas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Alertas de Stock</h3>
            <span className="p-2 bg-red-50 text-red-600 rounded-lg">⚠️</span>
          </div>
          {cargando ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
          ) : (
            <div>
              <p className="text-3xl font-black text-gray-800 mb-2">
                {metricas.productosBajoStock.length} <span className="text-lg text-gray-500 font-medium">cortes críticos</span>
              </p>
              
              {metricas.productosBajoStock.length > 0 ? (
                <div className="mt-4 border-t border-gray-100 pt-3 max-h-32 overflow-y-auto">
                  <ul className="text-sm space-y-2 pr-2">
                    {metricas.productosBajoStock.map(prod => (
                      <li key={prod.id} className="flex justify-between items-center bg-red-50 p-2 rounded text-red-700">
                        <span className="font-medium">{prod.nombre}</span>
                        <span className="font-bold">{formatearKilos(prod.stock_actual_kilos)} Kg</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-green-600 font-bold mt-2 bg-green-50 p-2 rounded">
                  ✅ Todo el inventario está en niveles óptimos.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- NUEVA SECCIÓN: HISTORIAL DE VENTAS --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>🧾</span> Registro de Ventas
          </h3>
          <button 
            onClick={exportarVentasPDF}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow flex items-center gap-2"
          >
            <span>📄</span> Descargar PDF de Ventas
          </button>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-bold">Fecha / Hora</th>
                <th className="p-4 font-bold">Producto</th>
                <th className="p-4 font-bold">Kilos</th>
                <th className="p-4 font-bold">Total Venta</th>
                <th className="p-4 font-bold">Vendedor</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {cargando ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Cargando registros...</td></tr>
              ) : historialVentas.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">No hay ventas registradas aún.</td></tr>
              ) : (
                historialVentas.map((venta) => (
                  <tr key={venta.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-600">
                      {new Date(venta.fecha_venta).toLocaleDateString('es-CO')} <br/>
                      <span className="text-xs text-gray-400">{new Date(venta.fecha_venta).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="p-4 font-medium text-gray-800">{venta.Producto?.nombre || 'Desconocido'}</td>
                    <td className="p-4 text-red-500 font-bold">-{formatearKilos(venta.cantidad_kilos)} Kg</td>
                    <td className="p-4 text-green-700 font-black">{formatoMoneda(venta.total_venta)}</td>
                    <td className="p-4 text-gray-600">{venta.Usuario?.nombre || 'Desconocido'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}