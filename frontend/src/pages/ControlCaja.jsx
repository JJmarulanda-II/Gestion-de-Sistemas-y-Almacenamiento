import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { obtenerEstadoCaja, abrirCaja, cerrarCaja, obtenerHistorialCajas } from '../services/cajaService';
import InputField from '../components/InputField';
import Button from '../components/Button';

export default function ControlCaja() {
  const { usuario } = useContext(AuthContext);
  
  const [cajaActiva, setCajaActiva] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Estados de formularios
  const [montoApertura, setMontoApertura] = useState('');
  const [montoCierre, setMontoCierre] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const estado = await obtenerEstadoCaja();
      setCajaActiva(estado);
      
      // Solo cargamos el historial si es ADMIN
      if (usuario?.rol === 'ADMIN') {
        const hist = await obtenerHistorialCajas();
        setHistorial(hist);
      }
    } catch (err) {
      console.error(err);
      setError('Error al sincronizar con el servidor de auditoría.');
    } finally {
      setCargando(false);
    }
  };

  const handleAbrir = async (e) => {
    e.preventDefault();
    setError(''); setExito(''); setProcesando(true);
    try {
      await abrirCaja(montoApertura);
      setExito('Turno iniciado. La caja está lista para registrar ventas.');
      setMontoApertura('');
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al abrir la caja.');
    } finally {
      setProcesando(false);
      setTimeout(() => setExito(''), 4000);
    }
  };

  const handleCerrar = async (e) => {
    e.preventDefault();
    const confirmar = window.confirm('¿Estás seguro de cerrar la caja? Verifica bien el dinero físico antes de continuar.');
    if (!confirmar) return;

    setError(''); setExito(''); setProcesando(true);
    try {
      const res = await cerrarCaja(montoCierre);
      const dif = parseFloat(res.caja.diferencia);
      
      let mensajeDif = dif === 0 
        ? '¡Caja cuadrada perfectamente!' 
        : dif > 0 ? `Sobraron ${formatoMoneda(dif)}.` : `Faltaron ${formatoMoneda(Math.abs(dif))}.`;
        
      setExito(`Caja cerrada. ${mensajeDif}`);
      setMontoCierre('');
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cerrar la caja.');
    } finally {
      setProcesando(false);
    }
  };

  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(valor || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 border-l-4 border-primary pl-4">
        Control y Cuadre de Caja
      </h2>

      {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl shadow-sm font-medium">{error}</div>}
      {exito && <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-xl shadow-sm font-medium">{exito}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL DE OPERACIÓN (IZQUIERDA) */}
        <div className="lg:col-span-1">
          {cargando ? (
            <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
          ) : cajaActiva ? (
            /* --- VISTA: CAJA ABIERTA --- */
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-emerald-500 p-6 text-center text-white">
                <span className="text-4xl block mb-2">✅</span>
                <h3 className="text-2xl font-black tracking-wide">CAJA OPERATIVA</h3>
                <p className="text-emerald-100 mt-1">Abierta por: {cajaActiva.Usuario?.nombre}</p>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Fondo Inicial:</span>
                  <span className="text-2xl font-bold text-gray-800">{formatoMoneda(cajaActiva.monto_apertura)}</span>
                </div>
                
                <form onSubmit={handleCerrar} className="space-y-4">
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <InputField 
                      label="Dinero Físico en Cajón (Para Cierre)" 
                      type="number"
                      placeholder="Ej: 1500000"
                      value={montoCierre}
                      onChange={(e) => setMontoCierre(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" cargando={procesando}>
                    🔒 Procesar Cierre de Caja
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            /* --- VISTA: CAJA CERRADA --- */
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gray-100 p-6 text-center text-gray-500">
                <span className="text-4xl block mb-2">🔒</span>
                <h3 className="text-xl font-bold">CAJA CERRADA</h3>
                <p className="text-sm mt-1">Inicia el turno para facturar</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleAbrir} className="space-y-4">
                  <InputField 
                    label="Monto Base (Monedas/Billetes de cambio)" 
                    type="number"
                    placeholder="Ej: 200000"
                    value={montoApertura}
                    onChange={(e) => setMontoApertura(e.target.value)}
                    required
                  />
                  <Button type="submit" cargando={procesando}>
                    🔓 Abrir Caja Ahora
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* PANEL DE HISTORIAL (DERECHA - SOLO ADMIN) */}
        {usuario?.rol === 'ADMIN' && (
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
            <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <span>📊</span> Historial de Movimientos
            </h3>
            
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 rounded-tl-lg font-bold">Fecha / Hora</th>
                  <th className="p-4 font-bold">Cajero</th>
                  <th className="p-4 font-bold">Apertura</th>
                  <th className="p-4 font-bold">Ventas Sist.</th>
                  <th className="p-4 font-bold">Cierre Físico</th>
                  <th className="p-4 rounded-tr-lg font-bold text-center">Diferencia</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {historial.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-400 italic">No hay registros de caja previos.</td></tr>
                ) : (
                  historial.map((reg) => {
                    const dif = parseFloat(reg.diferencia);
                    return (
                      <tr key={reg.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="p-4 text-gray-600">
                          {new Date(reg.fecha_apertura).toLocaleDateString('es-CO')} <br/>
                          <span className="text-xs text-gray-400">{new Date(reg.fecha_apertura).toLocaleTimeString('es-CO')}</span>
                        </td>
                        <td className="p-4 font-medium text-gray-800">{reg.Usuario?.nombre}</td>
                        <td className="p-4 text-gray-600">{formatoMoneda(reg.monto_apertura)}</td>
                        <td className="p-4 text-blue-600 font-medium">{reg.total_ventas_calculado ? formatoMoneda(reg.total_ventas_calculado) : '---'}</td>
                        <td className="p-4 text-gray-800 font-bold">{reg.monto_cierre ? formatoMoneda(reg.monto_cierre) : 'Operando'}</td>
                        <td className="p-4 text-center">
                          {reg.estado === 'ABIERTA' ? (
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">En Curso</span>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              dif === 0 ? 'bg-green-100 text-green-700' : dif > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {dif === 0 ? 'OK' : formatoMoneda(dif)}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}