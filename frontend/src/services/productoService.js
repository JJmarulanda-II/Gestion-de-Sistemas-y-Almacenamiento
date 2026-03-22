import api from './api';

// Obtener todos los productos
export const obtenerProductos = async () => {
  const response = await api.get('/productos');
  return response.data;
};

// Crear un nuevo producto
export const crearProducto = async (productoData) => {
  const response = await api.post('/productos', productoData);
  return response.data;
};
