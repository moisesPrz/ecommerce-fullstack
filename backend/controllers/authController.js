// ARCHIVO: backend/controllers/authController.js

const Usuario = require('../models/Usuario');
const { hashPassword, generateToken, comparePassword } = require('../utils/authUtils');

exports.register = async (req, res) => {
    const { nombre, email, password } = req.body;

    // 1. Validación básica
    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // 2. 🛡️ VALIDACIÓN DE SEGURIDAD (NUEVO)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            error: 'La contraseña es débil. Requiere: 8 caracteres, mayúscula, minúscula, número y símbolo.' 
        });
    }

    try {
        // Verificar si existe el email
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(409).json({ error: 'El correo ya está registrado.' });
        }

        // Crear usuario
        const hash_contrasena = await hashPassword(password);
        const nuevoUsuario = await Usuario.create({
            nombre,
            email,
            hash_contrasena,
            rol: 'cliente',
        });

        // Generar token y responder
        const token = generateToken(nuevoUsuario);
        return res.status(201).json({ 
            message: 'Registro exitoso.',
            token,
            usuario: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email,
                rol: nuevoUsuario.rol,
            },
        });

    } catch (error) {
        console.error('Error al registrar:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Datos incompletos.' });

    try {
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas.' });

        const isMatch = await comparePassword(password, usuario.hash_contrasena);
        if (!isMatch) return res.status(401).json({ error: 'Credenciales inválidas.' });

        const token = generateToken(usuario);
        return res.status(200).json({
            message: 'Login exitoso.',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor.' });
    }
};