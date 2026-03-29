import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrarSalida } from '../services/salidaService';
import { obtenerProductos } from '../services/productoService';
import { obtenerEstadoCaja } from '../services/cajaService';
import Button from '../components/Button';
import { io } from 'socket.io-client';

// --- FUNCIÓN DE FORMATEO  ---
const formatearKilos = (valor) => {
  if (valor == null) return '0';
  return parseFloat(valor).toString();
};

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [pagoCliente, setPagoCliente] = useState('');
  const [cargando, setCargando] = useState(true);
  
  // Estados de Caja y Seguridad
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [verificando, setVerificando] = useState(true);
  
  // --- NUEVO ESTADO: Peso en vivo de la báscula ---
  const [pesoBascula, setPesoBascula] = useState("0.000");

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // 1. Efecto para verificar la caja
  useEffect(() => {
    verificarEstadoYCargar();
  }, []);

  // 2. Efecto para conectarse a la báscula
  useEffect(() => {
    // Nos conectamos al microservicio local de la báscula
    const socket = io('http://localhost:5000');
    
    socket.on('peso', (nuevoPeso) => {
      setPesoBascula(nuevoPeso); 
    });

    // Limpia la conexión si el usuario cambia de pantalla
    return () => socket.disconnect();
  }, []);

  const verificarEstadoYCargar = async () => {
    try {
      const estadoCaja = await obtenerEstadoCaja();
      
      if (estadoCaja && estadoCaja.estado === 'ABIERTA') {
        setCajaAbierta(true);
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
      setCargando(false); // Apagamos el estado de carga
    }
  };

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) return;
    setCarrito([...carrito, { ...producto, cantidad_kilos: '', subtotal: 0 }]);
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

  const totalFactura = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  const cambio = parseFloat(pagoCliente) - totalFactura;

  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(valor || 0);
  };

  const handleFinalizarVenta = async () => {
    if (carrito.length === 0) return setError('El carrito está vacío.');
    const invalido = carrito.some(item => parseFloat(item.cantidad_kilos) <= 0 || !item.cantidad_kilos);
    if (invalido) return setError('Ingresa un peso válido para todos los productos.');
    if (cambio < 0) return setError('El pago del cliente es insuficiente.');

    setError(''); setExito(''); setProcesando(true);
    try {
      const promesasVentas = carrito.map(item => 
        registrarSalida({ producto_id: item.id, cantidad_kilos: item.cantidad_kilos })
      );
      await Promise.all(promesasVentas);
      setExito('Venta registrada y stock descontado con éxito.');
      setCarrito([]); setPagoCliente('');
      await verificarEstadoYCargar(); 
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al procesar la venta.');
    } finally {
      setProcesando(false);
      setTimeout(() => setExito(''), 4000);
    }
  };

  // --- INTERFAZ DE BLOQUEO DE CAJA ---
  if (verificando) return <div className="min-h-screen flex items-center justify-center bg-gray-100 font-bold text-gray-500">Verificando estado de caja...</div>;
  if (!cajaAbierta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-lg border-t-8 border-red-500">
          <span className="text-7xl block mb-6 animate-bounce">🔒</span>
          <h2 className="text-3xl font-black text-gray-800 mb-4">Caja Cerrada</h2>
          <p className="text-gray-600 mb-8 text-lg">Por motivos de seguridad, no puedes acceder al Punto de Venta sin iniciar tu turno operativo.</p>
          <Link to="/caja" className="inline-block bg-primary hover:bg-yellow-600 text-white font-extrabold py-4 px-8 rounded-xl transition-all shadow-lg transform hover:-translate-y-1">
            Ir a Abrir Caja Ahora
          </Link>
        </div>
      </div>
    );
  }

  // --- INTERFAZ DEL PUNTO DE VENTA (POS) ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      
      {/* PANEL IZQUIERDO: Catálogo */}
      <div className="lg:w-2/3 p-6 overflow-y-auto h-screen">
        <h2 className="text-3xl font-bold text-gray-800 border-l-4 border-primary pl-4 mb-6">Punto de Venta (POS)</h2>
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
                  prod.stock_actual_kilos <= 0 ? 'bg-gray-200 border-gray-300 opacity-60 cursor-not-allowed' : 'bg-white hover:border-primary hover:shadow-lg active:scale-95'
                }`}
              >
                <h3 className="font-bold text-gray-800 text-lg group-hover:text-primary transition-colors">{prod.nombre}</h3>
                <p className="text-primary font-black mt-1">{formatoMoneda(prod.precio_por_kilo)} / kg</p>
                <span className={`text-xs mt-2 px-2 py-1 rounded-full font-bold ${
                  prod.stock_actual_kilos > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {/* LIMPIEZA DE KILOS APLICADA */}
                  Stock: {formatearKilos(prod.stock_actual_kilos)} Kg
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* PANEL DERECHO: Carrito y Báscula */}
      <div className="lg:w-1/3 bg-white shadow-2xl z-10 flex flex-col h-screen border-l border-gray-200">
        
        {/* Cabecera del Carrito */}
        <div className="bg-primary text-white p-4 font-bold text-xl flex items-center justify-between shadow-md">
          <span>🛒 Caja</span>
          <span className="bg-white text-primary px-3 py-1 rounded-full text-sm">{carrito.length} Ítems</span>
        </div>

        {/* --- MONITOR DE BÁSCULA EN VIVO --- */}
        <div className="bg-blue-50 border-b-2 border-blue-200 p-4 flex justify-between items-center shadow-inner">
          <span className="text-blue-800 font-bold text-sm flex items-center gap-2">
            <span className="animate-pulse">🔴</span> BÁSCULA:
          </span>
          <span className="text-3xl font-black text-blue-600 font-mono tracking-widest">
            {pesoBascula} <span className="text-lg">kg</span>
          </span>
        </div>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
          {carrito.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 italic">Seleccione productos</div>
          ) : (
            carrito.map(item => (
              <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-800">{item.nombre}</span>
                  <button onClick={() => eliminarDelCarrito(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded transition">🗑️</button>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    step="any"
                    placeholder="0.000"
                    value={item.cantidad_kilos}
                    onChange={(e) => actualizarCantidad(item.id, e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-primary focus:border-primary outline-none"
                  />
                  
                  {/* BOTÓN PARA EXTRAER EL PESO DE LA BÁSCULA */}
                  <button
                    type="button"
                    onClick={() => actualizarCantidad(item.id, pesoBascula)}
                    className="bg-blue-100 hover:bg-blue-500 hover:text-white text-blue-700 px-3 py-1 rounded shadow-sm transition-all font-bold text-sm"
                    title="Obtener peso de la báscula"
                  >
                    ⚖️ Obtener
                  </button>

                  <span className="ml-auto font-black text-green-700">{formatoMoneda(item.subtotal)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cobro */}
        <div className="p-6 bg-white border-t-2 border-dashed border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold text-gray-600">TOTAL:</span>
            <span className="text-3xl font-black text-gray-900">{formatoMoneda(totalFactura)}</span>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">Paga con ($):</label>
            <input 
              type="number"
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
          <Button onClick={handleFinalizarVenta} cargando={procesando}>Finalizar Venta</Button>
        </div>
      </div>
    </div>
  );
}