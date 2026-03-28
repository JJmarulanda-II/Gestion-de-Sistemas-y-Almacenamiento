const Producto = require('./Producto');
const Entrada = require('./Entrada');
const Salida = require('./Salida');
const Usuario = require('./Usuario');
const Caja = require('./Caja');

Producto.hasMany(Entrada, { foreignKey: 'producto_id' });
Entrada.belongsTo(Producto, { foreignKey: 'producto_id' });

Producto.hasMany(Salida, { foreignKey: 'producto_id' });
Salida.belongsTo(Producto, { foreignKey: 'producto_id' });


Usuario.hasMany(Entrada, { foreignKey: 'usuario_id' });
// Una Entrada fue registrada por un solo Usuario
Entrada.belongsTo(Usuario, { foreignKey: 'usuario_id' });


Usuario.hasMany(Salida, { foreignKey: 'usuario_id' });
Salida.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Usuario.hasMany(Caja, { foreignKey: 'usuario_id' });
Caja.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = {
  Producto,
  Entrada,
  Salida,
  Usuario,
  Caja
};