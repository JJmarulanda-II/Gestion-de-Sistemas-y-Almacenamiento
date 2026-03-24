import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { obtenerProductos } from '../services/productoService';
import { obtenerSalidas } from '../services/salidaService';

export default function Dashboard() {
  const { usuario, logout } = useContext(AuthContext);
  
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
      // Traemos todos los datos al mismo tiempo
      const [productosData, ventasData] = await Promise.all([
        obtenerProductos(),
        obtenerSalidas()
      ]);

      // 1. Calcular Ingresos Totales
      const ingresos = ventasData.reduce((acumulador, venta) => {
        return acumulador + parseFloat(venta.total_venta);
      }, 0);

      // 2. Calcular Stock Total
      const kilos = productosData.reduce((acumulador, prod) => {
        return acumulador + parseFloat(prod.stock_actual_kilos);
      }, 0);

      // 3. Filtrar Productos con Bajo Stock (Menos de 5 Kg)
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar Superior */}
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-extrabold text-primary">
          🐔 Pollo Fresh ERP
        </h1>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            Hola, {usuario?.nombre} <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full ml-1">{usuario?.rol}</span>
          </span>
          <button 
            onClick={logout}
            className="bg-secondary hover:bg-red-800 text-black px-4 py-2 rounded-lg text-sm font-bold transition shadow"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Área de Trabajo Principal */}
      <main className="p-6 flex-grow max-w-7xl mx-auto w-full">
        
        {/* --- SECCIÓN DE ANALÍTICAS (KPIs) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Tarjeta de Ingresos */}
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Ingresos Totales</h3>
            {cargando ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
            ) : (
              <p className="text-3xl font-black text-green-600">{formatoMoneda(metricas.totalVentas)}</p>
            )}
          </div>

          {/* Tarjeta de Stock */}
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Inventario Global</h3>
            {cargando ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
            ) : (
              <p className="text-3xl font-black text-blue-600">{metricas.totalKilos.toFixed(2)} Kg</p>
            )}
          </div>

          {/* Tarjeta de Alertas */}
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-red-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Alertas de Stock</h3>
            {cargando ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
            ) : (
              <div>
                <p className="text-3xl font-black text-red-600 mb-2">{metricas.productosBajoStock.length} Productos</p>
                {metricas.productosBajoStock.length > 0 ? (
                  <ul className="text-sm text-gray-600">
                    {metricas.productosBajoStock.map(prod => (
                      <li key={prod.id} className="flex justify-between border-b py-1">
                        <span>{prod.nombre}</span>
                        <span className="font-bold text-red-500">{prod.stock_actual_kilos} Kg</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-600 font-bold">Todo el inventario está en niveles óptimos.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- SECCIÓN DE ACCESOS RÁPIDOS --- */}
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-primary pl-3">Módulos del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/productos" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center justify-between group">
            <div>
              <h3 className="font-bold text-xl text-gray-800 group-hover:text-primary transition-colors">Catálogo</h3>
              <p className="text-gray-500 text-sm mt-1">Gestionar cortes y precios</p>
            </div>
            <span className="text-4xl transition-transform group-hover:scale-110">🍗</span>
          </Link>

          <Link to="/entradas" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center justify-between group">
            <div>
              <h3 className="font-bold text-xl text-gray-800 group-hover:text-blue-500 transition-colors">Recepción</h3>
              <p className="text-gray-500 text-sm mt-1">Registrar llegada de mercancía</p>
            </div>
            <span className="text-4xl transition-transform group-hover:scale-110">📦</span>
          </Link>

          <Link to="/ventas" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center justify-between group">
            <div>
              <h3 className="font-bold text-xl text-gray-800 group-hover:text-green-500 transition-colors">Ventas</h3>
              <p className="text-gray-500 text-sm mt-1">Facturación y salida de stock</p>
            </div>
            <span className="text-4xl transition-transform group-hover:scale-110">💰</span>
          </Link>
        </div>

      </main>
    </div>
  );
}