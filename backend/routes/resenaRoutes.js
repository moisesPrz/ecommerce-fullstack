const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/resenaController');
const { verificarToken } = require('../middleware/authMiddleware');
const { validarCrearResena } = require('../middleware/validaciones');

router.get('/producto/:id', ctrl.obtenerResenasProducto);
router.post('/', verificarToken, validarCrearResena, ctrl.crearResena);
router.delete('/:id', verificarToken, ctrl.eliminarResena);

module.exports = router;
