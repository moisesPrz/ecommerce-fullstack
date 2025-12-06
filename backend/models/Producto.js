// ARCHIVO: backend/models/Producto.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('Producto', {
    // Definimos las columnas exactamente como están en MySQL
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    imagen_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // --- ESTA ES LA COLUMNA QUE PROBABLEMENTE FALTABA ---
    id_categoria: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'id_categoria' // Asegura que coincida con la columna en MySQL
    }
}, {
    tableName: 'productos', // Nombre exacto de la tabla en MySQL
    timestamps: true // Para createdAt y updatedAt
});

module.exports = Producto;