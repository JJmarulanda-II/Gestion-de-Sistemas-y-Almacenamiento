import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      
      {/* Sidebar Fijo a la izquierda */}
      <Sidebar />

      {/* Área de Contenido Dinámico a la derecha */}
      <main className="flex-1 overflow-y-auto p-0">
      
        <Outlet />
      </main>
    </div>
  );
}