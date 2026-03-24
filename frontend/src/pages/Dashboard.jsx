import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {

  // Extraemos al usuario y la función de salir desde nuestro contexto global
  const { usuario, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar Superior */}
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-extrabold text-primary">
          🐔 Pollo Fresh 
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
      <main className="p-6 flex-grow">
        <div className="bg-white rounded-xl shadow p-8 text-center border-t-4 border-primary mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Bienvenido al Panel de Control
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto">
            Desde aquí podrás gestionar todo el inventario de Pollo Fresh. Próximamente agregaremos los indicadores de stock, registro de entradas de mercancía y el panel de ventas.
          </p>
        </div>
        
        {/* Menú de Accesos Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Link to="/productos" className="bg-white p-6 rounded-xl shadow border-l-4 border-primary hover:shadow-lg transition flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl text-gray-800">Catálogo</h3>
              <p className="text-gray-500 text-sm mt-1">Gestionar cortes y precios</p>
            </div>
            <span className="text-3xl">🍗</span>
          </Link>

          {/* Tarjeta 2: Entradas de Mercancía (NUEVA) */}
          <Link to="/entradas" className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500 hover:shadow-lg transition flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl text-gray-800">Recepción</h3>
              <p className="text-gray-500 text-sm mt-1">Registrar llegada de pollo</p>
            </div>
            <span className="text-3xl">📦</span>
          </Link>
        </div>

        {/* Tarjeta 3: Ventas (NUEVA) */}
          <Link to="/ventas" className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500 hover:shadow-lg transition flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl text-gray-800">Ventas</h3>
              <p className="text-gray-500 text-sm mt-1">Registrar salida y facturación</p>
            </div>
            <span className="text-3xl">💰</span>
          </Link>
      </main>
    </div>
  );
}