// Pruebas de integración H4: recorren varias funciones juntas (RF-01 a RF-06, BD-01, CAL-01).
// Mismo estilo que test/tickets.test.js: app real, BD en memoria cargada con db/seed.sql.
const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { abrir } = require('../src/db');
const { crearApp } = require('../src/app');

let servidor;
let base;
let db;

beforeEach(async () => {
  db = abrir(':memory:');
  servidor = crearApp(db).listen(0);
  await new Promise((ok) => servidor.once('listening', ok));
  base = `http://localhost:${servidor.address().port}`;
});

afterEach(() => {
  servidor.close();
  db.close();
});

async function get(ruta) {
  const r = await fetch(base + ruta);
  return { status: r.status, html: await r.text() };
}

async function post(ruta, datos) {
  const r = await fetch(base + ruta, { method: 'POST', body: new URLSearchParams(datos), redirect: 'manual' });
  return { status: r.status, location: r.headers.get('location'), html: await r.text() };
}

const TICKET_VALIDO = {
  solicitanteId: '1',
  titulo: 'Monitor sin imagen',
  descripcion: 'El monitor principal no muestra imagen desde hoy.',
  categoriaId: '1',
  prioridad: 'Alta',
};

const contar = (sql, ...p) => db.prepare(sql).get(...p).n;
const filas = (html) => (html.match(/<td><a href="\/tickets\/\d+">TKT-\d+<\/a><\/td>/g) || []).length;
const cifra = (html, etiqueta) =>
  Number(new RegExp(`<span>${etiqueta}</span>\\s*<strong>(\\d+)</strong>`).exec(html)[1]);

test('INT-01 (RF-01 a RF-04, RF-06): ciclo de vida completo de un ticket, de Nuevo a Cerrado', async () => {
  const creado = await post('/tickets', TICKET_VALIDO);
  assert.equal(creado.status, 303);
  assert.match(creado.location, /codigo=TKT-000007$/);

  await post('/tickets/7/asignar', { responsableId: '4', usuarioId: '6', comentario: 'Se toma el caso' });
  await post('/tickets/7/estado', { estado: 'En proceso', usuarioId: '4' });
  await post('/tickets/7/estado', { estado: 'Resuelto', usuarioId: '4', comentario: 'Monitor reemplazado' });
  const cierre = await post('/tickets/7/estado', { estado: 'Cerrado', usuarioId: '1', comentario: 'Conforme' });
  assert.equal(cierre.status, 303);

  const t = db.prepare('SELECT estado, responsable_id, fecha_cierre FROM ticket WHERE id = 7').get();
  assert.equal(t.estado, 'Cerrado');
  assert.equal(t.responsable_id, 4);
  assert.ok(t.fecha_cierre);
  // creación + responsable + 3 cambios de estado
  assert.equal(contar('SELECT COUNT(*) n FROM historial_ticket WHERE ticket_id = 7'), 5);

  const detalle = await get('/tickets/7');
  assert.match(detalle.html, /Diego Rojas/);
  assert.match(detalle.html, /Monitor reemplazado/);

  const { html } = await get('/');
  assert.equal(cifra(html, 'Total'), 7);
  assert.equal(cifra(html, 'Nuevo'), 2);
  assert.equal(cifra(html, 'En proceso'), 2);
  assert.equal(cifra(html, 'Resuelto'), 1);
  assert.equal(cifra(html, 'Cerrado'), 2);
});

test('INT-02 (RF-03, RF-05, RF-06): filtros, listado y resumen se mantienen coherentes tras los cambios', async () => {
  await post('/tickets', { ...TICKET_VALIDO, categoriaId: '3', prioridad: 'Crítica' }); // TKT-000007
  await post('/tickets', { ...TICKET_VALIDO, titulo: 'Teclado con teclas rotas', categoriaId: '5', prioridad: 'Baja' }); // TKT-000008

  let { html } = await get('/?estado=Nuevo');
  assert.equal(filas(html), 4); // 2 de prueba + 2 nuevos
  assert.equal(cifra(html, 'Total'), 8); // el resumen no depende del filtro
  assert.match(html, /4 solicitud\(es\) de 8 \(filtradas\)/);

  ({ html } = await get('/?categoriaId=3&prioridad=' + encodeURIComponent('Crítica')));
  assert.equal(filas(html), 2); // TKT-000002 y TKT-000007
  assert.match(html, /TKT-000007/);

  await post('/tickets/7/asignar', { responsableId: '4', usuarioId: '6' });
  await post('/tickets/7/estado', { estado: 'En proceso', usuarioId: '4' });

  ({ html } = await get('/?estado=Nuevo'));
  assert.equal(filas(html), 3);
  assert.equal(cifra(html, 'Nuevo'), 3);
  assert.equal(cifra(html, 'En proceso'), 3);
  ({ html } = await get('/?estado=' + encodeURIComponent('En proceso')));
  assert.equal(filas(html), 3);
  assert.match(html, /TKT-000007/);
});

test('INT-03 (CAL-01): una operación rechazada no altera tickets, historial ni resumen', async () => {
  const tickets = contar('SELECT COUNT(*) n FROM ticket');
  const historial = contar('SELECT COUNT(*) n FROM historial_ticket');

  const a = await post('/tickets', { ...TICKET_VALIDO, titulo: '   ' });
  const b = await post('/tickets/1/estado', { estado: 'Cerrado', usuarioId: '6' });
  const c = await post('/tickets/1/asignar', { responsableId: '2', usuarioId: '6' });
  assert.deepEqual([a.status, b.status, c.status], [422, 422, 422]);

  assert.equal(contar('SELECT COUNT(*) n FROM ticket'), tickets);
  assert.equal(contar('SELECT COUNT(*) n FROM historial_ticket'), historial);
  const { html } = await get('/');
  assert.equal(cifra(html, 'Total'), 6);
  assert.equal(cifra(html, 'Nuevo'), 2);
});

test('INT-04 (BD-01): los datos persisten en un archivo SQLite tras cerrar y volver a abrir la base', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mesa-'));
  const ruta = path.join(dir, 'mesa.db');
  try {
    let bd = abrir(ruta);
    const srv = crearApp(bd).listen(0);
    await new Promise((ok) => srv.once('listening', ok));
    const r = await fetch(`http://localhost:${srv.address().port}/tickets`, {
      method: 'POST',
      body: new URLSearchParams(TICKET_VALIDO),
      redirect: 'manual',
    });
    assert.equal(r.status, 303);
    srv.close();
    bd.close();

    bd = abrir(ruta); // simula reiniciar la aplicación
    const t = bd.prepare("SELECT titulo, estado FROM ticket WHERE codigo = 'TKT-000007'").get();
    assert.equal(t.titulo, 'Monitor sin imagen');
    assert.equal(t.estado, 'Nuevo');
    bd.close();
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
