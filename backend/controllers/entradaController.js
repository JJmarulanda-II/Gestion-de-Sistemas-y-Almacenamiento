const { Entrada, Producto, Usuario } = require('../models');
const { sequelize } = require('../config/db'); 

// 1. Registrar una nueva entrada de mercancía
const registrarEntrada = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    // cantidad_kilos debe ser un número decimal (ej. 15.500)
    const { producto_id, cantidad_kilos, proveedor } = req.body;
    
    const usuario_id = req.usuario.id; 

    // 1. Verificamos que el producto exista
    const producto = await Producto.findByPk(producto_id, { transaction: t });
    if (!producto) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Producto no encontrado en el sistema.' });
    }

    // 2. Creamos el registro en el historial de entradas
    const nuevaEntrada = await Entrada.create({
      cantidad_kilos,
      proveedor,
      producto_id,
      usuario_id
    }, { transaction: t });

    // 3. Calculamos y actualizamos el nuevo stock en la tabla de productos
    const nuevoStock = parseFloat(producto.stock_actual_kilos) + parseFloat(cantidad_kilos);
    await producto.update(
      { stock_actual_kilos: nuevoStock }, 
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({ 
      mensaje: 'Entrada registrada exitosamente. Stock actualizado.', 
      entrada: nuevaEntrada 
    });

  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ mensaje: 'Error crítico al registrar la entrada de mercancía.' });
  }
};

// 2. Obtener el historial de entradas (Para auditoría)
const obtenerEntradas = async (req, res) => {
  try {
    const entradas = await Entrada.findAll({
      include: [
        { model: Producto, attributes: ['nombre'] },
        { model: Usuario, attributes: ['nombre'] }
      ],
      order: [['fecha_entrada', 'DESC']]
    });
    
    res.status(200).json(entradas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el historial de entradas.' });
  }
};

module.exports = {
  registrarEntrada,
  obtenerEntradas
};