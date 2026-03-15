const { Producto } = require('../models');

// 1. Crear un nuevo producto (Solo ADMIN)
const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio_por_kilo } = req.body;

    // Verificamos que el producto no exista ya
    const productoExistente = await Producto.findOne({ where: { nombre } });
    if (productoExistente) {
      return res.status(400).json({ mensaje: 'Ya existe un producto con este nombre.' });
    }

    const nuevoProducto = await Producto.create({
      nombre,
      descripcion,
      precio_por_kilo
    });

    res.status(201).json({ mensaje: 'Producto creado exitosamente', producto: nuevoProducto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor al crear producto.' });
  }
};

// 2. Obtener todos los productos activos (Empleados y Admin)
const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({ 
      where: { estado: true },
      order: [['nombre', 'ASC']]
    });
    
    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el catálogo de productos.' });
  }
};

// 3. Actualizar un producto (Solo ADMIN)
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params; // Obtenemos el ID de la URL
    const { nombre, descripcion, precio_por_kilo } = req.body;

    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    }

    // Actualizamos los datos
    await producto.update({ nombre, descripcion, precio_por_kilo });

    res.status(200).json({ mensaje: 'Producto actualizado correctamente', producto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el producto.' });
  }
};

// 4. Eliminar (Desactivar) un producto (Solo ADMIN)
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    }

    // En lugar de destruirlo, lo ocultamos
    await producto.update({ estado: false });

    res.status(200).json({ mensaje: 'Producto desactivado del sistema.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar el producto.' });
  }
};

module.exports = {
  crearProducto,
  obtenerProductos,
  actualizarProducto,
  eliminarProducto
};