const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const multer = require('multer');

// Configuración básica de Multer (Guardar temporalmente en carpeta 'uploads/')
const upload = multer({ dest: 'uploads/' });

router.get('/', productoController.obtenerProductos);
router.get('/:id', productoController.obtenerProductoPorId);

// AGREGAMOS EL MIDDLEWARE 'upload.single'
// Esto dice: "Espera un archivo llamado 'imagen' en el formulario"
router.post('/', upload.single('imagen'), productoController.crearProducto);

// También para editar (PUT)
router.put('/:id', upload.single('imagen'), productoController.actualizarProducto); 

router.delete('/:id', productoController.eliminarProducto);

module.exports = router;