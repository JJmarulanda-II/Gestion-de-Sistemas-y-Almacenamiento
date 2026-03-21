require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const { sequelize, connectDB } = require('./config/db'); 
const app = express();


const { Producto, Entrada, Salida } = require('./models');

app.use(cors());

app.use(express.json()); 


app.get('/', (req, res) => {
  res.json({ mensaje: '🐔 API de Pollo Fresh funcionando correctamente' });
});

// --- Rutas de prueba ---
app.get('/', (req, res) => {
  res.json({ mensaje: '🐔 API de Pollo Fresh funcionando correctamente' });
});

// --- RUTAS DE LA API ---
const authRoutes = require('./routes/authRoutes');
const productoRoutes = require('./routes/productoRoutes');
const entradaRoutes = require('./routes/entradaRoutes');
const salidaRoutes = require('./routes/salidaRoutes');

app.use('/api/productos', productoRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/entradas', entradaRoutes);
app.use('/api/salidas', salidaRoutes);

// --- Inicialización del Servidor ---
const PORT = process.env.PORT || 3001;

// Levantamos el servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  await connectDB();

  await sequelize.sync({ alter: true });
  console.log('📦 Modelos sincronizados con la base de datos.')
});