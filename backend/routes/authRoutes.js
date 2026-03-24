const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');

// --- RUTA PÚBLICA ---
// Cualquier persona (con credenciales) puede iniciar sesión
router.post('/login', authController.login);

// --- RUTAS PROTEGIDAS (SOLO ADMINISTRADOR) ---
// Registrar un nuevo empleado
router.post('/registrar', verificarToken, esAdmin, authController.registrarUsuario);

// Obtener la lista de todos los empleados
router.get('/usuarios', verificarToken, esAdmin, authController.obtenerUsuarios);

// NUEVA RUTA: PUT /api/auth/usuarios/:id/estado -> Cambiar estado (Solo ADMIN)
router.put('/usuarios/:id/estado', verificarToken, esAdmin, authController.cambiarEstadoUsuario);

module.exports = router;