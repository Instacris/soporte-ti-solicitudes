// Borra y vuelve a crear la base de datos con los datos de prueba.
// Uso: npm run db:reset  (con la aplicación detenida)
const fs = require('node:fs');
const { abrir, RUTA_POR_DEFECTO } = require('../src/db');

const ruta = process.env.DB_PATH || RUTA_POR_DEFECTO;
try {
  if (fs.existsSync(ruta)) fs.rmSync(ruta);
} catch (err) {
  if (err.code !== 'EPERM' && err.code !== 'EBUSY') throw err;
  console.error('No se pudo borrar la base de datos: está en uso. Detenga la aplicación (Ctrl+C) y reintente.');
  process.exit(1);
}
abrir(ruta).close();
console.log(`Base de datos recreada en ${ruta}`);
