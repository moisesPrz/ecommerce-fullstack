/**
 * ARCHIVO: backend/routes/productoRoutes.js
 * 
 * MEJORAS: Validaciones en crear y actualizar productos.
 */

const express = require('express');
const router  = express.Router();
const multer  = require('multer');

const productoController = require('../controllers/productoController');
const { verificarToken, esAdmin, esVendedor } = require('../middleware/authMiddleware');
const {
  validarCrearProducto,
  validarActualizarProducto,
  validarBusqueda,
} = require('../middleware/validaciones');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten archivos de imagen'), false);
    }
    cb(null, true);
  },
});

// Rutas públicas
router.get('/', validarBusqueda, productoController.obtenerProductos);
router.get('/:id', productoController.obtenerProductoPorId);

// Rutas protegidas
router.post('/',
  verificarToken,
  upload.single('imagen'),
  validarCrearProducto,
  productoController.crearProducto
);

router.put('/:id',
  verificarToken,
  upload.single('imagen'),
  validarActualizarProducto,
  productoController.actualizarProducto
);

router.delete('/:id', verificarToken, productoController.eliminarProducto);

module.exports = router;
