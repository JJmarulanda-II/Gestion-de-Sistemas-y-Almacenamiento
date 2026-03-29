import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrarSalida } from '../services/salidaService';
import { obtenerProductos } from '../services/productoService';
import { obtenerEstadoCaja } from '../services/cajaService';
import Button from '../components/Button';

// --- FUNCIÓN DE FORMATEO ---
const formatearKilos = (valor) => {
  if (valor == null) return '0';
  return parseFloat(valor).toString();
};

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [pagoCliente, setPagoCliente] = useState('');
  const [cargando, setCargando] = useState(true);
  
  // --- NUEVOS ESTADOS ---
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [verificando, setVerificando] = useState(true);
  
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Modificamos el useEffect para que revise la caja primero
  useEffect(() => {
    verificarEstadoYCargar();
  }, []);

  const verificarEstadoYCargar = async () => {
    try {
      const estadoCaja = await obtenerEstadoCaja();
      
      if (estadoCaja && estadoCaja.estado === 'ABIERTA') {
        setCajaAbierta(true);
        // Solo cargamos el catálogo si la caja está abierta
        const data = await obtenerProductos();
        setProductos(data);
      } else {
        setCajaAbierta(false);
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
      console.error(err);
    } finally {
      setVerificando(false);
      setCargando(false); 
    }
  };

  // --- LÓGICA DEL CARRITO ---
  const agregarAlCarrito = (producto) => {
    // Verificamos si ya está en el carrito
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) return; // Si ya está, no lo duplicamos

    setCarrito([...carrito, { 
      ...producto, 
      cantidad_kilos: '', 
      subtotal: 0 
    }]);
  };

  const actualizarCantidad = (id, kilos) => {
    const nuevoCarrito = carrito.map(item => {
      if (item.id === id) {
        const peso = parseFloat(kilos) || 0;
        return { 
          ...item, 
          cantidad_kilos: kilos, 
          subtotal: peso * parseFloat(item.precio_por_kilo) 
        };
      }
      return item;
    });
    setCarrito(nuevoCarrito);
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  // --- CÁLCULOS MATEMÁTICOS ---
  const totalFactura = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  const cambio = parseFloat(pagoCliente) - totalFactura;

  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(valor || 0);
  };

  // --- FINALIZAR VENTA ---
  const handleFinalizarVenta = async () => {
    if (carrito.length === 0) {
      setError('El carrito está vacío.');
      return;
    }

    // Validar que todos los items tengan peso mayor a 0
    const invalido = carrito.some(item => parseFloat(item.cantidad_kilos) <= 0 || !item.cantidad_kilos);
    if (invalido) {
      setError('Asegúrate de ingresar el peso correcto para todos los productos.');
      return;
    }

    if (cambio < 0) {
      setError('El pago del cliente es insuficiente.');
      return;
    }

    setError('');
    setExito('');
    setProcesando(true);

    try {
      // Disparamos todas las peticiones al backend en paralelo
      const promesasVentas = carrito.map(item => 
        registrarSalida({
          producto_id: item.id,
          cantidad_kilos: item.cantidad_kilos
        })
      );

      await Promise.all(promesasVentas);
      
      setExito('Venta registrada y stock descontado con éxito.');
      setCarrito([]);
      setPagoCliente('');
      await verificarEstadoYCargar(); // SOLUCIÓN 2: Usamos el nombre correcto de la función
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al procesar la venta. Verifica el stock.');
    } finally {
      setProcesando(false);
      setTimeout(() => setExito(''), 4000);
    }
  };

  // --- INTERFAZ DE BLOQUEO ---
  if (verificando) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 font-bold text-gray-500">Verificando estado de caja...</div>;
  }

  if (!cajaAbierta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-lg border-t-8 border-red-500">
          <span className="text-7xl block mb-6 animate-bounce">🔒</span>
          <h2 className="text-3xl font-black text-gray-800 mb-4">Caja Cerrada</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Por motivos de seguridad y auditoría, no puedes acceder al Punto de Venta sin antes declarar la base de efectivo e iniciar tu turno operativo.
          </p>
          <Link 
            to="/caja" 
            className="inline-block bg-primary hover:bg-yellow-600 text-black font-extrabold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Ir a Abrir Caja Ahora
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      
      {/* PANEL IZQUIERDO: Catálogo POS (70%) */}
      <div className="lg:w-2/3 p-6 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 border-l-4 border-primary pl-4">
            Punto de Venta (POS)
          </h2>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold">{error}</div>}
        {exito && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm font-bold">{exito}</div>}

        {cargando ? (
          <p className="text-gray-500">Cargando catálogo...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {productos.map(prod => (
              <button
                key={prod.id}
                onClick={() => agregarAlCarrito(prod)}
                disabled={prod.stock_actual_kilos <= 0}
                className={`p-4 rounded-xl shadow border-2 transition-all flex flex-col items-center justify-center h-32 text-center group ${
                  prod.stock_actual_kilos <= 0 
                    ? 'bg-gray-200 border-gray-300 opacity-60 cursor-not-allowed' 
                    : 'bg-white border-transparent hover:border-primary hover:shadow-lg active:scale-95'
                }`}
              >
                <h3 className="font-bold text-gray-800 text-lg group-hover:text-primary transition-colors">
                  {prod.nombre}
                </h3>
                <p className="text-primary font-black mt-1">
                  {formatoMoneda(prod.precio_por_kilo)} / kg
                </p>
                <span className={`text-xs mt-2 px-2 py-1 rounded-full font-bold ${
                  prod.stock_actual_kilos > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {/* SOLUCIÓN 3: Limpieza de kilos aplicada */}
                  Stock: {formatearKilos(prod.stock_actual_kilos)} Kg
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* PANEL DERECHO: Carrito y Facturación (30%) */}
      <div className="lg:w-1/3 bg-white shadow-2xl z-10 flex flex-col h-screen border-l border-gray-200">
        <div className="bg-primary text-white p-4 font-bold text-xl flex items-center justify-between shadow-md">
          <span>🛒 Caja</span>
          <span className="bg-white text-primary px-3 py-1 rounded-full text-sm">
            {carrito.length} Ítems
          </span>
        </div>

        {/* Lista de Productos Seleccionados */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {carrito.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 italic">
              Seleccione productos del catálogo
            </div>
          ) : (
            <div className="space-y-3">
              {carrito.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-800">{item.nombre}</span>
                    <button 
                      onClick={() => eliminarDelCarrito(item.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded transition"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      step="any" // Agregado por seguridad para soportar decimales
                      placeholder="0.000"
                      value={item.cantidad_kilos}
                      onChange={(e) => actualizarCantidad(item.id, e.target.value)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-primary focus:border-primary outline-none"
                    />
                    <span className="text-sm text-gray-500">kg</span>
                    <span className="ml-auto font-black text-green-700">
                      {formatoMoneda(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totales y Cobro */}
        <div className="p-6 bg-white border-t-2 border-dashed border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold text-gray-600">TOTAL:</span>
            <span className="text-3xl font-black text-gray-900">{formatoMoneda(totalFactura)}</span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">Paga con ($):</label>
            <input 
              type="number"
              placeholder="Efectivo recibido"
              value={pagoCliente}
              onChange={(e) => setPagoCliente(e.target.value)}
              className="w-full px-4 py-3 text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mb-6">
            <span className="text-lg font-bold text-gray-600">CAMBIO:</span>
            <span className={`text-2xl font-black ${cambio >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {pagoCliente ? formatoMoneda(cambio) : '$0'}
            </span>
          </div>

          <Button 
            onClick={handleFinalizarVenta} 
            cargando={procesando}
          >
            Finalizar Venta
          </Button>
        </div>
      </div>

    </div>
  );
}