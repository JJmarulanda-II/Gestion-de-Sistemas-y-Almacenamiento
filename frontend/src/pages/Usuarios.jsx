// frontend/src/pages/Usuarios.jsx
import { useState, useEffect } from 'react';
import { obtenerUsuarios, registrarUsuario, cambiarEstadoUsuario } from '../services/usuarioService';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import Button from '../components/Button';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoForm, setCargandoForm] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('EMPLEADO');

  const opcionesRol = [
    { value: 'EMPLEADO', label: 'Empleado (Solo Ventas)' },
    { value: 'ADMIN', label: 'Administrador (Control Total)' }
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const data = await obtenerUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar la lista de usuarios. Verifica que seas Administrador.');
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setCargandoForm(true);

    try {
      await registrarUsuario({ nombre, email, password, rol });
      setExito('Usuario creado exitosamente.');
      
      // Limpiar formulario
      setNombre('');
      setEmail('');
      setPassword('');
      setRol('EMPLEADO');
      
      // Recargar tabla
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear el usuario.');
    } finally {
      setCargandoForm(false);
      setTimeout(() => setExito(''), 4000);
    }
  };
  const handleEstado = async (id, nombre, estadoActual) => {
    const accion = estadoActual ? 'desactivar' : 'reactivar';
    const confirmar = window.confirm(`¿Estás seguro de que deseas ${accion} el acceso de "${nombre}"?`);
    
    if (confirmar) {
      try {
        await cambiarEstadoUsuario(id);
        await cargarDatos(); // Recargamos la tabla para ver el cambio
      } catch (err) {
        setError(err.response?.data?.mensaje || 'Error al cambiar el estado.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 border-l-4 border-purple-500 pl-4">
        Gestión de Personal
      </h2>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
      {exito && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm font-bold">{exito}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de Nuevo Empleado */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit border-t-4 border-purple-500">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Registrar Empleado</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField 
              label="Nombre Completo" 
              placeholder="Ej: Carlos Pérez"
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
            />
            <InputField 
              label="Correo Electrónico" 
              type="email"
              placeholder="empleado@pollofresh.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <InputField 
              label="Contraseña" 
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <SelectField 
              label="Nivel de Acceso"
              options={opcionesRol}
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              required
            />
            <div className="pt-2">
              <Button type="submit" cargando={cargandoForm}>
                Crear Cuenta
              </Button>
            </div>
          </form>
        </div>

        {/* Tabla de Usuarios */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md overflow-x-auto">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Personal Autorizado</h3>
          
          {cargando ? (
            <p className="text-gray-500">Cargando personal...</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                  <th className="p-3 rounded-tl-lg">Nombre</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3 rounded-tr-lg">Estado</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-3 font-medium text-gray-800">{user.nombre}</td>
                    <td className="p-3 text-sm text-gray-600">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        user.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        user.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                  <th className="p-3 rounded-tl-lg">Nombre</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 rounded-tr-lg text-center">Acciones</th> {/* <-- Nueva columna */}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-3 font-medium text-gray-800">{user.nombre}</td>
                    <td className="p-3 text-sm text-gray-600">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        user.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        user.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {/* Nueva celda con el botón */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleEstado(user.id, user.nombre, user.estado)}
                        className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                          user.estado 
                            ? 'bg-red-100 text-red-600 hover:bg-red-600 hover:text-white' 
                            : 'bg-green-100 text-green-600 hover:bg-green-600 hover:text-white'
                        }`}
                      >
                        {user.estado ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}