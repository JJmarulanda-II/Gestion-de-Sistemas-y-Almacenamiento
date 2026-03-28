const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Caja = sequelize.define('Caja', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  monto_apertura: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false, // El dinero base con el que empieza el día
  },
  monto_cierre: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // El dinero físico reportado al final del día
  },
  total_ventas_calculado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // Lo que el sistema sumó en facturas
  },
  diferencia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // Positivo (sobró plata), Negativo (faltó plata), Cero (Perfecto)
  },
  estado: {
    type: DataTypes.ENUM('ABIERTA', 'CERRADA'),
    defaultValue: 'ABIERTA',
  },
  fecha_apertura: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  fecha_cierre: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'cajas',
  timestamps: false,
});

module.exports = Caja;