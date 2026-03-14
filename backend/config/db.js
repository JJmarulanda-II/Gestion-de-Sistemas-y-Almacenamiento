const { Sequelize } = require('sequelize');
require('dotenv').config();


const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

// Función para probar la conexión
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos MySQL establecida con éxito.');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1); 
  }
};

module.exports = { sequelize, connectDB };