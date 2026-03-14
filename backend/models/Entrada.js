const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Entrada = sequelize.define('Entrada', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cantidad_kilos: {
    type: DataTypes.DECIMAL(10, 3), 
    allowNull: false,
  },
  fecha_entrada: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, 
  },
  proveedor: {
    type: DataTypes.STRING,
    allowNull: true, 
  }
}, {
  tableName: 'entradas',
  timestamps: true,
});

module.exports = Entrada;