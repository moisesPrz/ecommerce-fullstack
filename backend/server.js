// Cargar variables de entorno
require('dotenv').config();

// 1. IMPORTACIONES DE LIBRERÍAS
const express = require('express');
const helmet = require('helmet');
const cors = require('cors'); 
const path = require('path'); 
const { connectDB, sequelize } = require('./config/database');

// 2. IMPORTACIÓN DE MODELOS (TABLAS)
const Usuario = require('./models/Usuario'); 
const Producto = require('./models/Producto'); 
const Pedido = require('./models/Pedido');
const DetallePedido = require('./models/DetallePedido');

// 3. DEFINIR RELACIONES ENTRE TABLAS (¡OBLIGATORIO PARA COMPRAS!)
// Un Usuario puede tener muchos Pedidos
Usuario.hasMany(Pedido);
Pedido.belongsTo(Usuario);

// Un Pedido contiene muchos Productos (y un Producto puede estar en muchos Pedidos)
// La tabla "DetallePedido" sirve de puente y guarda la cantidad y precio histórico.
Pedido.belongsToMany(Producto, { through: DetallePedido });
Producto.belongsToMany(Pedido, { through: DetallePedido });

// 4. IMPORTACIÓN DE RUTAS
// Usamos path.join para evitar errores de rutas en diferentes sistemas operativos
const authRoutes = require(path.join(__dirname, 'routes', 'authRoutes'));
const testRoutes = require(path.join(__dirname, 'routes', 'testRoutes'));
const productoRoutes = require(path.join(__dirname, 'routes', 'productoRoutes'));
const paymentRoutes = require(path.join(__dirname, 'routes', 'paymentRoutes'));
const pedidoRoutes = require(path.join(__dirname, 'routes', 'pedidoRoutes'));


// 5. CONFIGURACIÓN DE EXPRESS
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares Globales
app.use(express.json()); 
app.use(helmet());
// Configuración de CORS para permitir que el Frontend (React) se conecte
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:5174', 
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'https://techmarket-frontend.vercel.app',
        'https://techmarket-frontend-TU_USUARIO.vercel.app'
    ], 
    credentials: true
}));

// Manejo de errores de JSON mal formados
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('❌ JSON mal formado recibido:', err.message);
        return res.status(400).json({ error: 'El JSON enviado tiene errores de sintaxis.' });
    }
    next();
});

// Diagnóstico en consola (Ver qué peticiones llegan)
app.use((req, res, next) => {
    console.log(`\n📢 [REQUEST] ${req.method} ${req.url}`);
    next();
});


// 6. DEFINICIÓN DE ENDPOINTS (URLs)
app.get('/', (req, res) => res.send('API E-commerce Funcionando 🚀'));

app.use('/api/auth', authRoutes); 
app.use('/api/test', testRoutes); 
app.use('/api/productos', productoRoutes); 
app.use('/api/pedidos', pedidoRoutes); // ✅ Ruta activa para comprar
app.use('/api/pagos', paymentRoutes);

// 7. INICIAR SERVIDOR Y BASE DE DATOS
async function startServer() {
    await connectDB(); 

    // 'alter: true' revisa si creaste tablas nuevas (como Pedidos) y las agrega a MySQL
    await sequelize.sync({ alter: true }); 
    console.log('✅ Modelos y Relaciones sincronizados correctamente.');
    
    app.listen(PORT, () => {
        console.log(`🚀 Servidor listo y escuchando en http://localhost:${PORT}`);
    });
}

startServer();