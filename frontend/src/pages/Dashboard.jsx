import { useEffect, useState } from 'react';
import { obtenerProductos } from '../services/productoService';
import { obtenerSalidas } from '../services/salidaService';

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
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <ul className="text-sm space-y-2">
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

    </div>
  );
}