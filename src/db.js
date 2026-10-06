const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DB_DIR = path.join(__dirname, '..', 'db');
const RUTA_POR_DEFECTO = path.join(DB_DIR, 'mesa.db');

function ejecutarScript(db, archivo) {
  db.exec(fs.readFileSync(path.join(DB_DIR, archivo), 'utf8'));
}

// Crea las tablas y carga los datos de prueba.
function inicializar(db, { conDatosDePrueba = true } = {}) {
  ejecutarScript(db, 'schema.sql');
  if (conDatosDePrueba) ejecutarScript(db, 'seed.sql');
}

// Abre la base de datos. Si el archivo no existe (o es ':memory:'), la crea desde los scripts.
function abrir(ruta = process.env.DB_PATH || RUTA_POR_DEFECTO) {
  const esNueva = ruta === ':memory:' || !fs.existsSync(ruta);
  const db = new DatabaseSync(ruta);
  db.exec('PRAGMA foreign_keys = ON;');
  if (esNueva) inicializar(db);
  return db;
}

module.exports = { abrir, inicializar, RUTA_POR_DEFECTO };
