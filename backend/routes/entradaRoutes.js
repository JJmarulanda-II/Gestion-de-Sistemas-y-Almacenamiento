const express = require('express');
const router = express.Router();
const entradaController = require('../controllers/entradaController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');

// --- RUTAS PROTEGIDAS DE ENTRADAS ---

// POST /api/entradas -> Registrar llegada de pollo (Solo ADMIN)
router.post('/', verificarToken, esAdmin, entradaController.registrarEntrada);

// GET /api/entradas -> Ver el historial de llegadas (Solo ADMIN)
router.get('/', verificarToken, esAdmin, entradaController.obtenerEntradas);

module.exports = router;