const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Importamos la conexión

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false, 
    unique: true,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  precio_por_kilo: {
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false,
  },
  stock_actual_kilos: {
    type: DataTypes.DECIMAL(10, 3), 
    defaultValue: 0.000,
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'productos',
  timestamps: true,       
});

module.exports = Producto;