import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Entradas from './pages/Entradas';
import Ventas from './pages/Ventas';
import Usuarios from './pages/Usuarios';
import ControlCaja from './pages/ControlCaja';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Protegidas (Requieren Token) */}
        <Route element={<ProtectedRoute />}>
          
          {/* --- NUEVA ESTRUCTURA UNIFICADA --- */}
          {/* Todas estas rutas usarán el Layout (Sidebar + Outlet) */}
          <Route element={<Layout />}>
            
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/entradas" element={<Entradas />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/caja" element={<ControlCaja />} />
            
            {/* Rutas Protegidas adicionales (ej. ADMIN) pueden ir aquí */}
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>


        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;