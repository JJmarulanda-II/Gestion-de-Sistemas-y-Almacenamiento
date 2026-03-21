import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { usuario, cargando } = useContext(AuthContext);


  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-xl font-bold text-gray-500">Cargando sistema...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}