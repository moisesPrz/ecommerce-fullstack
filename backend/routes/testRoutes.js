const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');

// Ruta Protegida: Solo accesible con un JWT válido
// URL: /api/test/profile
router.get('/profile', verificarToken, (req, res) => {
    // Si llegamos aquí, el token es válido. La información del usuario está en req.usuario
    res.status(200).json({
        message: 'Acceso a ruta protegida exitoso.',
        data: {
            id: req.usuario.id,
            rol: req.usuario.rol,
            info_secreta: 'Esta información solo la ve un usuario autenticado.'
        }
    });
});

module.exports = router;