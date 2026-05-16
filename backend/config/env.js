/**
 * ARCHIVO: backend/config/env.js
 * 
 * PROPÓSITO: Validar que todas las variables de entorno críticas existen
 * antes de que el servidor arranque. Si falta alguna, el servidor NO inicia
 * y muestra exactamente qué falta.
 * 
 * PRINCIPIO: Fail Fast — mejor fallar al inicio con mensaje claro
 * que fallar silenciosamente en producción.
 */

const requeridas = [
  // Base de datos
  { key: 'DB_HOST',     desc: 'Host de MySQL' },
  { key: 'DB_USER',     desc: 'Usuario de MySQL' },
  { key: 'DB_PASSWORD', desc: 'Contraseña de MySQL' },
  { key: 'DB_NAME',     desc: 'Nombre de la base de datos' },

  // Autenticación
  { key: 'JWT_SECRET',  desc: 'Secreto para firmar JWT (mín. 32 chars)' },

  // Stripe
  { key: 'STRIPE_SECRET_KEY', desc: 'Llave secreta de Stripe' },
];

const opcionales = [
  { key: 'PORT',              default: '3001' },
  { key: 'NODE_ENV',          default: 'development' },
  { key: 'DB_PORT',           default: '3306' },
  { key: 'CLOUDINARY_CLOUD_NAME', default: '' },
];

const validarEnv = () => {
  const errores = [];

  // Verificar variables requeridas
  requeridas.forEach(({ key, desc }) => {
    if (!process.env[key] || process.env[key].trim() === '') {
      errores.push(`  ❌ ${key} — ${desc}`);
    }
  });

  // Verificar longitud mínima del JWT_SECRET
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errores.push('  ⚠️  JWT_SECRET debe tener al menos 32 caracteres');
  }

  // Si hay errores, detener el servidor
  if (errores.length > 0) {
    console.error('\n🚨 ERROR: Variables de entorno faltantes o inválidas:');
    console.error(errores.join('\n'));
    console.error('\n💡 Copia .env.example a .env y completa los valores.\n');
    process.exit(1);
  }

  // Asignar defaults para opcionales
  opcionales.forEach(({ key, default: defaultVal }) => {
    if (!process.env[key]) process.env[key] = defaultVal;
  });

  console.log('✅ Variables de entorno validadas correctamente');
};

module.exports = { validarEnv };
