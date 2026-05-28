const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/direccionController');
const { verificarToken } = require('../middleware/authMiddleware');
const { validarDireccion } = require('../middleware/validaciones');

router.get('/',                    verificarToken, ctrl.listarDirecciones);
router.post('/',                   verificarToken, validarDireccion, ctrl.crearDireccion);
router.put('/:id',                 verificarToken, validarDireccion, ctrl.actualizarDireccion);
router.delete('/:id',              verificarToken, ctrl.eliminarDireccion);
router.patch('/:id/principal',     verificarToken, ctrl.establecerPrincipal);

module.exports = router;
