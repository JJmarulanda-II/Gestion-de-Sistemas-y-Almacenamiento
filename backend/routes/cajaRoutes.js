const express = require('express');
const router = express.Router();
const cajaController = require('../controllers/cajaController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');

router.get('/estado', verificarToken, cajaController.obtenerEstado);
router.post('/abrir', verificarToken, cajaController.abrirCaja);
router.post('/cerrar', verificarToken, cajaController.cerrarCaja);
router.get('/historial', verificarToken, esAdmin, cajaController.historialCajas);

module.exports = router;