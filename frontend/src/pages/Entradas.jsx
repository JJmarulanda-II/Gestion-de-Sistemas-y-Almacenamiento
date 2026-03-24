import { useState, useEffect } from 'react';
import { obtenerEntradas, registrarEntrada } from '../services/entradaService';
import { obtenerProductos } from '../services/productoService';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import Button from '../components/Button';

export default function Entradas() {
  const [entradas, setEntradas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoForm, setCargandoForm] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Estados del formulario
  const [productoId, setProductoId] = useState('');
  const [cantidadKilos, setCantidadKilos] = useState('');
  const [proveedor, setProveedor] = useState('');

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      const [entradasData, productosData] = await Promise.all([
        obtenerEntradas(),
        obtenerProductos()
      ]);
      setEntradas(entradasData);
      

      const opcionesProductos = productosData.map(prod => ({
        value: prod.id,
        label: `${prod.nombre} (Stock actual: ${prod.stock_actual_kilos} Kg)`
      }));
      setProductos(opcionesProductos);
      
    } catch (err) {
      console.error(err);
      setError('Error al cargar los datos del servidor.');
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
      await registrarEntrada({
        producto_id: productoId,
        cantidad_kilos: cantidadKilos,
        proveedor: proveedor
      });
      
      setExito('Mercancía registrada y stock actualizado correctamente.');
      

      setProductoId('');
      setCantidadKilos('');
      setProveedor('');
    
      await cargarDatosIniciales();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar la entrada.');
    } finally {
      setCargandoForm(false);
      setTimeout(() => setExito(''), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 border-l-4 border-blue-500 pl-4">
        Recepción de Mercancía
      </h2>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
      {exito && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm font-bold">{exito}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de Registro */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit border-t-4 border-blue-500">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Registrar Llegada</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <SelectField 
              label="Corte de Pollo"
              options={productos}
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              required
            />
            <InputField 
              label="Cantidad (Kilos)" 
              type="number"
              placeholder="Ej: 15.500" 
              value={cantidadKilos} 
              onChange={(e) => setCantidadKilos(e.target.value)} 
              required 
            />
            <InputField 
              label="Proveedor (Opcional)" 
              placeholder="Nombre de la granja o distribuidor"
              value={proveedor} 
              onChange={(e) => setProveedor(e.target.value)} 
            />
            <div className="pt-2">
              <Button type="submit" cargando={cargandoForm}>
                Confirmar y Sumar Stock
              </Button>
            </div>
          </form>
        </div>

        {/* Tabla de Historial */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md overflow-x-auto">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Historial de Entradas</h3>
          
          {cargando ? (
            <p className="text-gray-500">Cargando historial...</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                  <th className="p-3 rounded-tl-lg">Fecha</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Cantidad Añadida</th>
                  <th className="p-3">Proveedor</th>
                  <th className="p-3 rounded-tr-lg">Registrado por</th>
                </tr>
              </thead>
              <tbody>
                {entradas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">
                      No hay registros de entradas de mercancía.
                    </td>
                  </tr>
                ) : (
                  entradas.map((ent) => (
                    <tr key={ent.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(ent.fecha_entrada).toLocaleDateString('es-CO', { 
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </td>
                      <td className="p-3 font-medium text-gray-800">{ent.Producto?.nombre}</td>
                      <td className="p-3 text-blue-600 font-bold">+{ent.cantidad_kilos} Kg</td>
                      <td className="p-3 text-gray-600">{ent.proveedor || 'N/A'}</td>
                      <td className="p-3 text-sm text-gray-500">{ent.Usuario?.nombre}</td>
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