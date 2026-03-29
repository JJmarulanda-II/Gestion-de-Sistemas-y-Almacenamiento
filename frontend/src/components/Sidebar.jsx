import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

import { HiChartPie,HiShoppingBag, HiClipboardList, HiUserGroup, HiOutlineLogout } from 'react-icons/hi';
import { BiCart, BiMoneyWithdraw } from 'react-icons/bi';

export default function Sidebar() {
  const { usuario, logout } = useContext(AuthContext);

  // Definimos los enlaces del menú según el rol
  const enlacesBase = [
    { name: 'Panel de Control', to: '/dashboard', icon: HiChartPie },
    { name: 'Catálogo', to: '/productos', icon: HiShoppingBag },
    { name: 'Recepción', to: '/entradas', icon: HiClipboardList },
    { name: 'Ventas (POS)', to: '/ventas', icon: BiCart },
    { name: 'Caja', to: '/caja', icon: BiMoneyWithdraw },
  ];

  // Enlaces solo para ADMIN
  const enlacesAdmin = [
    { name: 'Personal', to: '/usuarios', icon: HiUserGroup },
  ];

  const enlacesFinales = usuario?.rol === 'ADMIN' ? [...enlacesBase, ...enlacesAdmin] : enlacesBase;

  return (
    <aside className="w-64 bg-white min-h-screen shadow-xl flex flex-col border-r border-gray-100 sticky top-0">
      
      {/* 1. Header del Sidebar (Logo/Nombre) */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-green-50">
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          🐔 <span className="bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent">Pollo Fresh</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Frescura que se nota</p>
      </div>

      {/* 2. Lista de Enlaces de Navegación */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
        {enlacesFinales.map((enlace) => (
          <NavLink
            key={enlace.to}
            to={enlace.to}
        
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-orange-400 to-green-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600' 
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Ícono dinámico */}
                <enlace.icon className={`text-xl ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}`} />
                {enlace.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 3. Footer del Sidebar (Usuario y Logout) */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto">
        <div className="flex items-center gap-3 mb-4 p-2 bg-white rounded-lg shadow-inner border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
            {usuario?.nombre.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{usuario?.nombre}</p>
            <p className="text-xs text-gray-500">{usuario?.rol}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-secondary hover:bg-red-800 text-white transition-all shadow-md active:scale-95"
        >
          <HiOutlineLogout className="text-xl" />
          Cerrar Turno
        </button>
      </div>
    </aside>
  );
}