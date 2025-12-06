// ARCHIVO: backend/middleware/authMiddleware.js

// ❌ ELIMINADA: require('dotenv').config(); - Ya se carga en server.js
const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar la validez del JWT en la cabecera de la solicitud.
 */
const verifyToken = (req, res, next) => { // Definida como constante
    // ESTÁNDAR PROFESIONAL: El token se espera en el header 'Authorization'
    // Formato: Bearer <token_jwt_aqui>
    const authHeader = req.header('Authorization');

    // 1. Verificar si existe la cabecera
    if (!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    // 2. Extraer el token de la cabecera "Bearer "
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Formato de token inválido.' });
    }

    try {
        // 3. Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Adjuntar la información del usuario
        req.usuario = decoded; 
        
        // 5. Continuar al siguiente paso de la ruta
        next(); 

    } catch (error) {
        // Manejar tokens expirados o inválidos
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

// Exportación como objeto para ser importado fácilmente como { verifyToken }
module.exports = {
    verifyToken,
};