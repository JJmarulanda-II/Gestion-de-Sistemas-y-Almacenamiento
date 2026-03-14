const Producto = require('./Producto');
const Entrada = require('./Entrada');
const Salida = require('./Salida');

// --- Definición de Relaciones ---

Producto.hasMany(Entrada, { foreignKey: 'producto_id' });

Entrada.belongsTo(Producto, { foreignKey: 'producto_id' });


Producto.hasMany(Salida, { foreignKey: 'producto_id' });

Salida.belongsTo(Producto, { foreignKey: 'producto_id' });

module.exports = {
  Producto,
  Entrada,
  Salida
};