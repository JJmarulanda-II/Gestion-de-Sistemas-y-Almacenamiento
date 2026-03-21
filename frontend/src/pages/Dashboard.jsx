import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {

  // Extraemos al usuario y la función de salir desde nuestro contexto global
  const { usuario, logout } = useContext(AuthContext);

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
            className="bg-secondary hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Área de Trabajo Principal */}
      <main className="p-6 flex-grow">
        <div className="bg-white rounded-xl shadow p-8 text-center border-t-4 border-primary">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Bienvenido al Panel de Control
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Desde aquí podrás gestionar todo el inventario de Pollo Fresh. Próximamente agregaremos los indicadores de stock, registro de entradas de mercancía y el panel de ventas.
          </p>
        </div>
      </main>
    </div>
  );
}