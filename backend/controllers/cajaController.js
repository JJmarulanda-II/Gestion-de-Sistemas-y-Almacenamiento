const { Caja, Salida, Usuario } = require('../models');
const { Op } = require('sequelize');

// 1. Obtener si hay una caja abierta actualmente
const obtenerEstado = async (req, res) => {
  try {
    const cajaAbierta = await Caja.findOne({
      where: { estado: 'ABIERTA' },
      include: [{ model: Usuario, attributes: ['nombre'] }]
    });
    res.status(200).json(cajaAbierta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar el estado de la caja.' });
  }
};

// 2. Abrir una nueva caja
const abrirCaja = async (req, res) => {
  try {
    const { monto_apertura } = req.body;
    const usuario_id = req.usuario.id;

    // Verificamos que no haya ya una caja abierta
    const cajaExistente = await Caja.findOne({ where: { estado: 'ABIERTA' } });
    if (cajaExistente) {
      return res.status(400).json({ mensaje: 'Ya existe una caja abierta. Ciérrala antes de abrir otra.' });
    }

    const nuevaCaja = await Caja.create({ monto_apertura, usuario_id });
    res.status(201).json({ mensaje: 'Caja abierta con éxito.', caja: nuevaCaja });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error crítico al abrir la caja.' });
  }
};

// 3. Cerrar la caja y calcular descuadres
const cerrarCaja = async (req, res) => {
  try {
    const { monto_cierre } = req.body; 

    const caja = await Caja.findOne({ where: { estado: 'ABIERTA' } });
    if (!caja) return res.status(400).json({ mensaje: 'No hay cajas abiertas.' });

    // Sumar todas las ventas hechas desde la hora en que se abrió la caja
    const totalVentas = await Salida.sum('total_venta', {
      where: {
        fecha_venta: { [Op.gte]: caja.fecha_apertura } // gte = Mayor o igual a
      }
    }) || 0;

    // Calcular la diferencia
    const teorico = parseFloat(caja.monto_apertura) + parseFloat(totalVentas);
    const diferencia = parseFloat(monto_cierre) - teorico;

    await caja.update({
      monto_cierre,
      total_ventas_calculado: totalVentas,
      diferencia,
      estado: 'CERRADA',
      fecha_cierre: new Date()
    });

    res.status(200).json({ mensaje: 'Caja cerrada exitosamente.', caja });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cerrar la caja.' });
  }
};

// 4. Obtener historial de todas las cajas
const historialCajas = async (req, res) => {
  try {
    const cajas = await Caja.findAll({
      include: [{ model: Usuario, attributes: ['nombre'] }],
      order: [['fecha_apertura', 'DESC']]
    });
    res.status(200).json(cajas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el historial.' });
  }
};

module.exports = { obtenerEstado, abrirCaja, cerrarCaja, historialCajas };