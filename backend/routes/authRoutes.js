const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para registrar un usuario: POST http://localhost:3306/api/auth/registrar
router.post('/registrar', authController.registrarUsuario);

// Ruta para iniciar sesión: POST http://localhost:3306/api/auth/login
router.post('/login', authController.login);

module.exports = router;