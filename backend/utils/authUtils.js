// ARCHIVO: backend/utils/authUtils.js

// Cargar variables de entorno (para JWT_SECRET)
//require('dotenv').config(); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. FUNCIÓN PARA HASHEAR/CIFRAR LA CONTRASEÑA
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

// 2. FUNCIÓN PARA COMPARAR CONTRASEÑAS (usada para el Login)
async function comparePassword(candidatePassword, hash) {
    return await bcrypt.compare(candidatePassword, hash);
}

// 3. FUNCIÓN PARA GENERAR EL JSON WEB TOKEN (JWT)
function generateToken(user) {
    const payload = {
        id: user.id,
        rol: user.rol 
    };

    const token = jwt.sign(
        payload, 
        process.env.JWT_SECRET, // Lee la clave secreta del .env
        {
            expiresIn: '1d' // Token expira en 1 día
        }
    );

    return token;
}

// Exportación correcta
module.exports = {
    hashPassword,
    comparePassword,
    generateToken
};