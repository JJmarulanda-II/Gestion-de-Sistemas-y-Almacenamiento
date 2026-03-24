import { useState, useEffect } from 'react';
import { obtenerSalidas, registrarSalida } from '../services/salidaService';
import { obtenerProductos } from '../services/productoService';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- FUNCIONES DE FORMATEO ---
const formatearKilos = (valor) => {
  if (valor == null) return '0';
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

  const [productoId, setProductoId] = useState('');
  const [cantidadKilos, setCantidadKilos] = useState('');
  const [totalEstimado, setTotalEstimado] = useState(0);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (productoId && cantidadKilos) {
      // Usamos '==' para evitar errores de tipo al multiplicar
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
      
      const opciones = productosData.map(prod => ({
        value: prod.id,
        // RESTAURADO: formatearKilos en el stock del desplegable
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

  const formatoMoneda = (valor) => {
    const numero = Number(valor) || 0;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(numero);
  };

  // --- FUNCIÓN SENIOR PARA EXPORTAR A PDF ---
  const exportarPDF = () => {
    if (ventas.length === 0) {
      alert("No hay ventas para exportar.");
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Reporte de Ventas - Pollo Fresh ERP", 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}`, 14, 28);

    const columnas = ["Fecha", "Producto", "Kilos Vendidos", "Total Cobrado", "Vendedor"];
    const filas = ventas.map(venta => [
      new Date(venta.fecha_venta).toLocaleDateString('es-CO'),
      venta.Producto?.nombre,
      // APLICADO: formatearKilos en el PDF
      `${formatearKilos(venta.cantidad_kilos)} Kg`,
      formatoMoneda(venta.total_venta),
      venta.Usuario?.nombre
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 35, 
      theme: 'grid',
      headStyles: { fillColor: [234, 179, 8] }, 
    });

    doc.save(`Reporte_Ventas_${new Date().getTime()}.pdf`);
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
            {/* RESTAURADO: step="any" para soportar decimales */}
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
              {/* Noté que cambiaste los estilos del botón, pero lo dejamos como estaba en tu código base
                  Si tenías clases específicas para el amarillo, asegúrate de mantenerlas en tu componente Button */}
              <Button type="submit" cargando={cargandoForm}>
                Confirmar Venta
              </Button>
            </div>
          </form>
        </div>

        {/* Tabla de Historial de Ventas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md overflow-x-auto">
          {/* Encabezado con Botón de Exportar */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-700">Historial de Salidas</h3>
            <button 
              onClick={exportarPDF}
              className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow flex items-center gap-2"
            >
              <span>📄</span> Exportar a PDF
            </button>
          </div>
          
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
                        {new Date(venta.fecha_venta).toLocaleDateString('es-CO')}
                      </td>
                      <td className="p-3 font-medium text-gray-800">{venta.Producto?.nombre}</td>
                      {/* RESTAURADO: formatearKilos en la tabla visual */}
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