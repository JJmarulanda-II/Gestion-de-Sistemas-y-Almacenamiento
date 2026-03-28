import api from './api';

export const obtenerEstadoCaja = async () => {
  const response = await api.get('/cajas/estado');
  return response.data;
};

export const abrirCaja = async (monto_apertura) => {
  const response = await api.post('/cajas/abrir', { monto_apertura });
  return response.data;
};

export const cerrarCaja = async (monto_cierre) => {
  const response = await api.post('/cajas/cerrar', { monto_cierre });
  return response.data;
};

export const obtenerHistorialCajas = async () => {
  const response = await api.get('/cajas/historial');
  return response.data;
};