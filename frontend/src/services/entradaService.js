import api from './api';

// Obtener el historial completo de llegadas de mercancía
export const obtenerEntradas = async () => {
  const response = await api.get('/entradas');
  return response.data;
};

// Registrar una nueva llegada (suma al stock automáticamente)
export const registrarEntrada = async (entradaData) => {
  const response = await api.post('/entradas', entradaData);
  return response.data;
};