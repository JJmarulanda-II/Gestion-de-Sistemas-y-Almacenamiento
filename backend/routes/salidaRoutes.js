const express = require('express');
const router = express.Router();
const salidaController = require('../controllers/salidaController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');

// --- RUTAS DE SALIDAS (VENTAS) ---

router.post('/', verificarToken, salidaController.registrarSalida);

router.get('/', verificarToken, esAdmin, salidaController.obtenerSalidas);

module.exports = router;