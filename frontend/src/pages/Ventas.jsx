import { useState, useEffect } from 'react';
import { obtenerSalidas, registrarSalida } from '../services/salidaService';
import { obtenerProductos } from '../services/productoService';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import Button from '../components/Button';

// --- FUNCIONES DE FORMATEO ---
const formatearKilos = (valor) => {
  if (valor == null) return '0'; // Retorna solo el número, el "Kg" lo ponemos en el HTML
  return parseFloat(valor).toString(); 
};

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [productosRaw, setProductosRaw] = useState([]);
  const [opcionesProductos, setOpcionesProductos] = useState([]);
  
  const [cargando, setCargando] = useState(true);
  const [cargandoForm, setCargandoForm] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Estados del formulario
  const [productoId, setProductoId] = useState('');
  const [cantidadKilos, setCantidadKilos] = useState('');
  const [totalEstimado, setTotalEstimado] = useState(0);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Efecto para calcular el total estimado cada vez que cambian los kilos o el producto
  useEffect(() => {
    if (productoId && cantidadKilos) {
      const productoSeleccionado = productosRaw.find(p => p.id.toString() === productoId);
      if (productoSeleccionado) {
        const calculo = parseFloat(cantidadKilos) * parseFloat(productoSeleccionado.precio_por_kilo);
        setTotalEstimado(calculo || 0);
      }
    } else {
      setTotalEstimado(0);
    }
  }, [productoId, cantidadKilos, productosRaw]);

  const cargarDatosIniciales = async () => {
    try {
      const [ventasData, productosData] = await Promise.all([
        obtenerSalidas(),
        obtenerProductos()
      ]);
      setVentas(ventasData);
      setProductosRaw(productosData);
      
      // APLICANDO EL FORMATO AL STOCK EN EL SELECT
      const opciones = productosData.map(prod => ({
        value: prod.id,
        label: `${prod.nombre} - $${parseFloat(prod.precio_por_kilo).toLocaleString('es-CO')} (Stock: ${formatearKilos(prod.stock_actual_kilos)} Kg)`
      }));
      setOpcionesProductos(opciones);
      
      if (opciones.length > 0) {
        setProductoId(opciones[0].value);
      }
      
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
      await registrarSalida({
        producto_id: productoId,
        cantidad_kilos: cantidadKilos
      });
      
      setExito('Venta registrada exitosamente. Stock descontado.');
      
      // Limpiamos el formulario (solo cantidad para agilizar ventas del mismo producto)
      setCantidadKilos('');
      
      await cargarDatosIniciales();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar la venta.');
    } finally {
      setCargandoForm(false);
      setTimeout(() => setExito(''), 4000);
    }
  };

  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 border-l-4 border-green-500 pl-4">
        Registro de Ventas
      </h2>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
      {exito && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm font-bold">{exito}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de Venta */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit border-t-4 border-green-500">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Nueva Venta</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <SelectField 
              label="Producto a Vender"
              options={opcionesProductos}
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              required
            />
            {/* Input para la cantidad, permitiendo decimales con step="any" */}
            <InputField 
              label="Cantidad (Kilos)" 
              type="number"
              step="any"
              placeholder="Ej: 2.5" 
              value={cantidadKilos} 
              onChange={(e) => setCantidadKilos(e.target.value)} 
              required 
            />
            
            {/* Panel de Cobro Dinámico */}
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center border border-gray-200">
              <p className="text-sm text-gray-500 font-medium mb-1">Total a Cobrar:</p>
              <p className="text-3xl font-black text-green-600">
                {formatoMoneda(totalEstimado)}
              </p>
            </div>

            <div className="pt-2">
              <Button type="submit" cargando={cargandoForm}>
                Confirmar Venta
              </Button>
            </div>
          </form>
        </div>

        {/* Tabla de Historial de Ventas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md overflow-x-auto">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Historial de Salidas</h3>
          
          {cargando ? (
            <p className="text-gray-500">Cargando historial...</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                  <th className="p-3 rounded-tl-lg">Fecha</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Kilos</th>
                  <th className="p-3">Total Venta</th>
                  <th className="p-3 rounded-tr-lg">Vendedor</th>
                </tr>
              </thead>
              <tbody>
                {ventas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">
                      Aún no hay ventas registradas.
                    </td>
                  </tr>
                ) : (
                  ventas.map((venta) => (
                    <tr key={venta.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(venta.fecha_venta).toLocaleDateString('es-CO', { 
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </td>
                      <td className="p-3 font-medium text-gray-800">{venta.Producto?.nombre}</td>
                      
                      {/* APLICANDO EL FORMATO A LOS KILOS DE LA TABLA */}
                      <td className="p-3 text-red-500 font-bold">-{formatearKilos(venta.cantidad_kilos)} Kg</td>
                      
                      <td className="p-3 text-green-700 font-black">{formatoMoneda(venta.total_venta)}</td>
                      <td className="p-3 text-sm text-gray-500">{venta.Usuario?.nombre}</td>
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