require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db'); 
const app = express();


app.use(cors());

app.use(express.json()); 


app.get('/', (req, res) => {
  res.json({ mensaje: '🐔 API de Pollo Fresh funcionando correctamente' });
});

// --- Inicialización del Servidor ---
const PORT = process.env.PORT || 3001;

// Levantamos el servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  await connectDB();
});