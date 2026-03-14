const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Salida = sequelize.define('Salida', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cantidad_kilos: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
  },
  total_venta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  fecha_venta: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'salidas',
  timestamps: true,
});

module.exports = Salida;