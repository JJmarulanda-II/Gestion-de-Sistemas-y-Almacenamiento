import api from './api';

// Obtener el historial completo de ventas
export const obtenerSalidas = async () => {
  const response = await api.get('/salidas');
  return response.data;
};

// Registrar una nueva venta (resta stock y calcula ganancias)
export const registrarSalida = async (salidaData) => {
  const response = await api.post('/salidas', salidaData);
  return response.data;
};