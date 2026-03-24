import { useState, useEffect } from 'react';
import { obtenerSalidas, registrarSalida } from '../services/salidaService';
import { obtenerProductos } from '../services/productoService';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import Button from '../components/Button';

// --- FUNCIONES DE FORMATEO ---
const formatearKilos = (valor) => {
  if (valor == null) return '0';
  return parseFloat(valor).toString(); 
};

// Sacamos la función de moneda afuera para poder usarla en el menú desplegable también
const formatoMoneda = (valor) => {
  const numero = Number(valor) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(numero);
};

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [productosRaw, setProductosRaw] = useState([]);
  const [opcionesProductos, setOpcionesProductos] = useState([]);
  
  const [cargando, setCargando] = useState(true);
  const [cargandoForm, setCargandoForm] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const [productoId, setProductoId] = useState('');
  const [cantidadKilos, setCantidadKilos] = useState('');
  const [totalEstimado, setTotalEstimado] = useState(0);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // --- FIX: EFECTO DE CÁLCULO EN TIEMPO REAL ---
  useEffect(() => {
    if (productoId && cantidadKilos) {
      // Usamos '==' para que Javascript iguale Texto con Número sin fallar
      const productoSeleccionado = productosRaw.find(p => p.id == productoId);
      
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
      
      // APLICANDO EL FORMATO DE MONEDA CORRECTO AQUÍ
      const opciones = productosData.map(prod => ({
        value: prod.id,
        label: `${prod.nombre} - ${formatoMoneda(prod.precio_por_kilo)} (Stock: ${formatearKilos(prod.stock_actual_kilos)} Kg)`
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
      setCantidadKilos('');
      
      await cargarDatosIniciales();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar la venta.');
    } finally {
      setCargandoForm(false);
      setTimeout(() => setExito(''), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 border-l-4 border-green-500 pl-4">
        Registro de Ventas
      </h2>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
      {exito && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm font-bold">{exito}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
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
            <InputField 
              label="Cantidad (Kilos)" 
              type="number"
              step="any"
              placeholder="Ej: 2.5" 
              value={cantidadKilos} 
              onChange={(e) => setCantidadKilos(e.target.value)} 
              required 
            />
            
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