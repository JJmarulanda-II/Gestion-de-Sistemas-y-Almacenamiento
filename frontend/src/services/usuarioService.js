import api from './api';

export const obtenerUsuarios = async () => {
  const response = await api.get('/auth/usuarios');
  return response.data;
};

export const registrarUsuario = async (usuarioData) => {
  const response = await api.post('/auth/registrar', usuarioData);
  return response.data;
};

export const cambiarEstadoUsuario = async (id) => {
  const response = await api.put(`/auth/usuarios/${id}/estado`);
  return response.data;
};