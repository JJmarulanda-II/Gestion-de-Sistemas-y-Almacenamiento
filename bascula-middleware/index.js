const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// 1. Configurar Servidor Web y WebSockets
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } 
});

// 2. Configuración de la Báscula (Basado en la imagen: COM3 a 9600 baudios)
const PUERTO_SERIAL = 'COM3'; 
const BAUD_RATE = 9600;

let pesoActual = "0.000";
let simuladorActivo = false;

// 3. Función para leer la báscula
const conectarBascula = () => {
  try {
    const port = new SerialPort({ path: PUERTO_SERIAL, baudRate: BAUD_RATE });
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' })); // Lee línea por línea

    port.on('open', () => {
      console.log(`✅ [HARDWARE] Conectado exitosamente a la báscula en ${PUERTO_SERIAL}`);
      simuladorActivo = false;
    });

    // Cada vez que la báscula manda un dato, lo limpiamos y lo emitimos
    parser.on('data', (data) => {
      // Extraemos solo los números y puntos (Ej: "[17:00:21] Peso: 0.370 kg" -> "0.370")
      const match = data.toString().match(/\d+\.\d+/);
      if (match) {
        pesoActual = parseFloat(match[0]).toFixed(3);
        io.emit('peso', pesoActual); // 📣 Gritamos el peso al navegador
      }
    });

    port.on('error', (err) => {
      console.error(`❌ [HARDWARE] Error en el puerto ${PUERTO_SERIAL}:`, err.message);
      iniciarSimulador();
    });

  } catch (error) {
    iniciarSimulador();
  }
};

// 4. Modo Simulador (Para cuando programas en casa sin la báscula)
const iniciarSimulador = () => {
  if (simuladorActivo) return;
  console.log(`⚠️ [SIMULADOR] No se detectó la báscula física en ${PUERTO_SERIAL}. Iniciando modo simulador...`);
  simuladorActivo = true;

  // Cambiamos el peso aleatoriamente cada 2 segundos
  setInterval(() => {
    // Genera un peso entre 0.500 kg y 3.500 kg
    const pesoRandom = (Math.random() * 3 + 0.5).toFixed(3);
    pesoActual = pesoRandom;
    io.emit('peso', pesoActual); // 📣 Gritamos el peso simulado
  }, 2000);
};

// 5. Conexión de React
io.on('connection', (socket) => {
  console.log('💻 [WEBSOCKET] Un Punto de Venta (React) se ha conectado para leer el peso.');
  // Apenas se conecta, le mandamos el peso actual
  socket.emit('peso', pesoActual); 
});

// Arrancamos el programa
conectarBascula();

server.listen(5000, () => {
  console.log('===================================================');
  console.log('🚀 LECTOR DE BÁSCULA INICIADO');
  console.log('📡 Escuchando en el puerto 5000');
  console.log('===================================================');
});