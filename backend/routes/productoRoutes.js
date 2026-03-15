const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');


const { verificarToken, esAdmin } = require('../middleware/authMiddleware');

// --- RUTAS PROTEGIDAS ---

// GET /api/productos -> Cualquier usuario con token válido puede ver el catálogo
router.get('/', verificarToken, productoController.obtenerProductos);

// POST /api/productos -> Solo el Admin puede crear
router.post('/', verificarToken, esAdmin, productoController.crearProducto);

// PUT /api/productos/:id -> Solo el Admin puede actualizar precios/nombres
router.put('/:id', verificarToken, esAdmin, productoController.actualizarProducto);

// DELETE /api/productos/:id -> Solo el Admin puede dar de baja un producto
router.delete('/:id', verificarToken, esAdmin, productoController.eliminarProducto);

module.exports = router;