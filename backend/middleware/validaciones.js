/**
 * ARCHIVO: backend/middleware/validaciones.js
 * 
 * PROPÓSITO: Centralizar todas las reglas de validación de inputs.
 * 
 * PATRÓN: Cada función retorna un array de middlewares de validación.
 * El último elemento siempre es `manejarErrores` que procesa los resultados.
 * 
 * PRINCIPIO: Nunca confiar en datos del cliente — validar TODO en backend.
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware final que verifica si hay errores de validación.
 * Si hay errores, retorna 400 con detalle de cada campo inválido.
 */
const manejarErrores = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errores: errores.array().map(e => ({
        campo: e.path,
        mensaje: e.msg,
        valor: e.value,
      })),
    });
  }
  next();
};

// ── AUTENTICACIÓN ────────────────────────────────────────

const validarRegistro = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),

  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('El email no tiene un formato válido')
    .normalizeEmail()
    .isLength({ max: 100 }).withMessage('El email no puede tener más de 100 caracteres'),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres')
    .isLength({ max: 128 }).withMessage('La contraseña no puede exceder 128 caracteres')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número'),

  body('rol')
    .optional()
    .isIn(['cliente', 'vendedor']).withMessage('El rol debe ser cliente o vendedor'),

  manejarErrores,
];

const validarLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ max: 128 }).withMessage('Contraseña demasiado larga'),

  manejarErrores,
];

// ── PRODUCTOS ────────────────────────────────────────────

const validarCrearProducto = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre del producto es requerido')
    .isLength({ min: 3, max: 255 }).withMessage('El nombre debe tener entre 3 y 255 caracteres')
    .escape(), // Previene XSS

  body('precio')
    .notEmpty().withMessage('El precio es requerido')
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser un número positivo')
    .custom(val => parseFloat(val) < 1000000).withMessage('El precio no puede exceder $1,000,000'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo')
    .custom(val => parseInt(val) <= 99999).withMessage('El stock no puede exceder 99,999 unidades'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('La descripción no puede exceder 2000 caracteres')
    .escape(),

  body('id_categoria')
    .optional()
    .isInt({ min: 1 }).withMessage('La categoría debe ser un ID válido'),

  manejarErrores,
];

const validarActualizarProducto = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de producto inválido'),

  body('precio')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser un número positivo'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo'),

  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 }).withMessage('El nombre debe tener entre 3 y 255 caracteres')
    .escape(),

  manejarErrores,
];

// ── PEDIDOS ──────────────────────────────────────────────

const validarCrearPedido = [
  body('items')
    .isArray({ min: 1 }).withMessage('El carrito no puede estar vacío'),

  body('items.*.id')
    .isInt({ min: 1 }).withMessage('ID de producto inválido'),

  body('items.*.quantity')
    .isInt({ min: 1, max: 100 }).withMessage('La cantidad debe estar entre 1 y 100'),

  body('items.*.precio')
    .isFloat({ min: 0 }).withMessage('El precio debe ser positivo'),

  manejarErrores,
];

// ── PAGOS ────────────────────────────────────────────────

const validarIntentoPago = [
  body('items')
    .isArray({ min: 1 }).withMessage('Se requiere al menos un producto para pagar'),

  body('items.*.id')
    .isInt({ min: 1 }).withMessage('ID de producto inválido en el carrito'),

  body('items.*.quantity')
    .isInt({ min: 1, max: 100 }).withMessage('Cantidad inválida'),

  manejarErrores,
];

// ── CATEGORÍAS ───────────────────────────────────────────

const validarCrearCategoria = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre de la categoría es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .escape(),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres')
    .escape(),

  manejarErrores,
];

// ── RESEÑAS ───────────────────────────────────────────────

const validarCrearResena = [
  body('id_producto')
    .notEmpty().withMessage('id_producto es requerido')
    .isInt({ min: 1 }).withMessage('id_producto debe ser un entero positivo'),

  body('calificacion')
    .notEmpty().withMessage('La calificación es requerida')
    .isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser un entero entre 1 y 5'),

  body('comentario')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('El comentario no puede exceder 1000 caracteres')
    .escape(),

  manejarErrores,
];

// ── DIRECCIONES ──────────────────────────────────────────

const validarDireccion = [
  body('nombre_destinatario')
    .trim()
    .notEmpty().withMessage('El nombre del destinatario es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('Debe tener entre 2 y 100 caracteres')
    .escape(),

  body('direccion')
    .trim()
    .notEmpty().withMessage('La dirección es requerida')
    .isLength({ min: 5, max: 255 }).withMessage('La dirección debe tener entre 5 y 255 caracteres')
    .escape(),

  body('ciudad')
    .trim()
    .notEmpty().withMessage('La ciudad es requerida')
    .isLength({ min: 2, max: 100 }).withMessage('La ciudad debe tener entre 2 y 100 caracteres')
    .escape(),

  body('departamento')
    .trim()
    .notEmpty().withMessage('El departamento es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El departamento debe tener entre 2 y 100 caracteres')
    .escape(),

  body('codigo_postal')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('El código postal no puede exceder 20 caracteres')
    .escape(),

  body('telefono')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres'),

  manejarErrores,
];

// ── ADMIN ────────────────────────────────────────────────

const validarCambiarRol = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de usuario inválido'),

  body('rol')
    .notEmpty().withMessage('El rol es requerido')
    .isIn(['cliente', 'vendedor', 'administrador']).withMessage('Rol inválido'),

  manejarErrores,
];

const validarCambiarEstado = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de pedido inválido'),

  body('estado')
    .notEmpty().withMessage('El estado es requerido')
    .isIn(['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado', 'completado'])
    .withMessage('Estado inválido'),

  manejarErrores,
];

// ── PARÁMETROS DE BÚSQUEDA ───────────────────────────────

const validarBusqueda = [
  query('busqueda')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('La búsqueda no puede exceder 100 caracteres')
    .escape(),

  query('categoria')
    .optional()
    .isInt({ min: 1 }).withMessage('Categoría inválida'),

  manejarErrores,
];

module.exports = {
  validarRegistro,
  validarLogin,
  validarCrearProducto,
  validarActualizarProducto,
  validarCrearPedido,
  validarIntentoPago,
  validarCrearCategoria,
  validarCrearResena,
  validarDireccion,
  validarCambiarRol,
  validarCambiarEstado,
  validarBusqueda,
  manejarErrores,
};
