import { useState, useEffect } from 'react';
import { obtenerProductos, crearProducto } from '../services/productoService';
import InputField from '../components/InputField';
import Button from '../components/Button';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoForm, setCargandoForm] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para el formulario de nuevo producto
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Cargar productos al entrar a la pantalla
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const data = await obtenerProductos();
      setProductos(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el catálogo de productos.');
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargandoForm(true);

    try {
      await crearProducto({
        nombre,
        descripcion,
        precio_por_kilo: precio
      });
      
      // Limpiamos el formulario
      setNombre('');
      setPrecio('');
      setDescripcion('');
      
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear el producto');
    } finally {
      setCargandoForm(false);
    }
  };


  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 border-l-4 border-primary pl-4">
        Gestión de Catálogo
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Formulario */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Agregar Producto</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField 
              label="Nombre del Corte (Ej: Pechuga)" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
            />
            <InputField 
              label="Precio por Kilo ($)" 
              type="number" 
              value={precio} 
              onChange={(e) => setPrecio(e.target.value)} 
              required 
            />
            <InputField 
              label="Descripción (Opcional)" 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
            />
            <div className="pt-2">
              <Button type="submit" cargando={cargandoForm}>
                Guardar Producto
              </Button>
            </div>
          </form>
        </div>

        {/* Columna Derecha: Tabla de Productos */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md overflow-x-auto">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Inventario Actual</h3>
          
          {cargando ? (
            <p className="text-gray-500">Cargando catálogo...</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                  <th className="p-3 rounded-tl-lg">Producto</th>
                  <th className="p-3">Precio / Kg</th>
                  <th className="p-3 rounded-tr-lg">Stock Actual (Kg)</th>
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-4 text-center text-gray-500">
                      No hay productos registrados aún.
                    </td>
                  </tr>
                ) : (
                  productos.map((prod) => (
                    <tr key={prod.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-3 font-medium text-gray-800">{prod.nombre}</td>
                      <td className="p-3 text-green-700 font-bold">{formatoMoneda(prod.precio_por_kilo)}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          prod.stock_actual_kilos > 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {prod.stock_actual_kilos} Kg
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}