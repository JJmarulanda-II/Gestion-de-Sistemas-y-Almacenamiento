const { Salida, Producto, Usuario } = require('../models');
const { sequelize } = require('../config/db');

// 1. Registrar una nueva salida (Venta)
const registrarSalida = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { producto_id, cantidad_kilos } = req.body;
    const usuario_id = req.usuario.id; // Obtenemos el empleado del token

    // 1. Buscamos el producto
    const producto = await Producto.findByPk(producto_id, { transaction: t });
    if (!producto) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    }

    // 2. Validación de regla de negocio: ¿Hay suficiente stock?
    const stockActual = parseFloat(producto.stock_actual_kilos);
    const kilosVenta = parseFloat(cantidad_kilos);

    if (stockActual < kilosVenta) {
      await t.rollback();
      return res.status(400).json({ 
        mensaje: `Stock insuficiente. Solo quedan ${stockActual} kg de ${producto.nombre}.` 
      });
    }

    // 3. Calculamos el total a cobrar de forma segura en el servidor
    const precioPorKilo = parseFloat(producto.precio_por_kilo);
    const total_venta = kilosVenta * precioPorKilo;

    // 4. Registramos la salida
    const nuevaSalida = await Salida.create({
      cantidad_kilos: kilosVenta,
      total_venta: total_venta,
      producto_id,
      usuario_id
    }, { transaction: t });

    // 5. Descontamos el stock
    const nuevoStock = stockActual - kilosVenta;
    await producto.update(
      { stock_actual_kilos: nuevoStock }, 
      { transaction: t }
    );

    // 6. Confirmamos la transacción
    await t.commit();

    res.status(201).json({ 
      mensaje: 'Venta registrada exitosamente', 
      salida: nuevaSalida,
      stock_restante: nuevoStock
    });

  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ mensaje: 'Error crítico al registrar la venta.' });
  }
};

// 2. Obtener el historial de salidas (Para cuadre de caja)
const obtenerSalidas = async (req, res) => {
  try {
    const salidas = await Salida.findAll({
      include: [
        { model: Producto, attributes: ['nombre', 'precio_por_kilo'] },
        { model: Usuario, attributes: ['nombre'] }
      ],
      order: [['fecha_venta', 'DESC']]
    });
    
    res.status(200).json(salidas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el historial de ventas.' });
  }
};

module.exports = {
  registrarSalida,
  obtenerSalidas
};