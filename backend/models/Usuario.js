const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Definición del modelo "Usuario"
const Usuario = sequelize.define('Usuario', {
    // Definición de las columnas (debe coincidir con la tabla 'usuarios' en MySQL)
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true, // Debe ser único (como lo definimos en SQL)
    },
    hash_contrasena: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    rol: {
        type: DataTypes.ENUM('cliente', 'administrador'),
        defaultValue: 'cliente',
    },
    // Sequelize automáticamente añade `createdAt` y `updatedAt`.
    // La columna `fecha_registro` que definimos en SQL se mapea a `createdAt` por defecto si no se especifica.
}, {
    // Opciones del modelo
    tableName: 'usuarios', // Nombre exacto de la tabla en MySQL
    timestamps: true, // Habilita createdAt y updatedAt
    createdAt: 'fecha_registro', // Mapea 'createdAt' al nombre SQL 'fecha_registro'
    updatedAt: false, // Deshabilitamos la columna 'updatedAt' si no la necesitamos
});

// Exportamos el modelo
module.exports = Usuario;