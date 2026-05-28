const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoriaController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');
const { validarCrearCategoria } = require('../middleware/validaciones');

router.get('/', ctrl.obtenerCategorias);
router.post('/', verificarToken, esAdmin, validarCrearCategoria, ctrl.crearCategoria);
router.put('/:id', verificarToken, esAdmin, validarCrearCategoria, ctrl.actualizarCategoria);
router.delete('/:id', verificarToken, esAdmin, ctrl.eliminarCategoria);

module.exports = router;
