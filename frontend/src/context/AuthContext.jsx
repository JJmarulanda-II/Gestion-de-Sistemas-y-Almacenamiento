import { createContext, useState, useEffect } from 'react';
import api from '../services/api';


export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

 
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('usuario');

    if (token && userData) {
      setUsuario(JSON.parse(userData)); 
    }
    setCargando(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Hacemos la petición a nuestro backend
      const response = await api.post('/auth/login', { email, password });
      const { token, usuario } = response.data;
      
    
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      

      setUsuario(usuario);
      return { success: true };
    } catch (error) {

      return { 
        success: false, 
        mensaje: error.response?.data?.mensaje || 'Error de conexión con el servidor.' 
      };
    }
  };

  // Función para Cerrar Sesión
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};