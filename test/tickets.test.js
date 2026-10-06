// Pruebas funcionales automatizadas (plan de pruebas, docs/02_H2_linea_base.md §9).
// Cada prueba levanta la app con una BD en memoria cargada con db/seed.sql.
const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
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
  const r = await fetch(base + ruta, {
    method: 'POST',
    body: new URLSearchParams(datos),
    redirect: 'manual',
  });
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

test('CP-01 (RF-01): registrar ticket válido lo guarda en estado Nuevo y aparece en el listado', async () => {
  const r = await post('/tickets', TICKET_VALIDO);
  assert.equal(r.status, 303);
  assert.match(r.location, /^\/\?ok=creado&codigo=TKT-000007$/);

  const t = db.prepare("SELECT * FROM ticket WHERE codigo = 'TKT-000007'").get();
  assert.equal(t.titulo, 'Monitor sin imagen');
  assert.equal(t.estado, 'Nuevo');
  assert.equal(t.responsable_id, null);
  assert.equal(contar("SELECT COUNT(*) n FROM historial_ticket WHERE ticket_id = ? AND campo = 'creacion'", t.id), 1);

  const listado = await get(r.location);
  assert.match(listado.html, /Monitor sin imagen/);
  assert.match(listado.html, /Solicitud registrada correctamente/);
});

test('CP-02 (RF-01/CAL-01): sin título no se guarda y muestra mensaje', async () => {
  const antes = contar('SELECT COUNT(*) n FROM ticket');
  const r = await post('/tickets', { ...TICKET_VALIDO, titulo: '   ' });
  assert.equal(r.status, 422);
  assert.match(r.html, /El título es obligatorio/);
  assert.equal(contar('SELECT COUNT(*) n FROM ticket'), antes);
});

test('CP-03 (CAL-01): descripción demasiado corta no se guarda', async () => {
  const r = await post('/tickets', { ...TICKET_VALIDO, descripcion: 'error' });
  assert.equal(r.status, 422);
  assert.match(r.html, /al menos 10 caracteres/);
  // Conserva lo que el usuario ya escribió
  assert.match(r.html, /value="Monitor sin imagen"/);
});

test('CAL-01: rechaza categoría, solicitante y prioridad inexistentes', async () => {
  const r = await post('/tickets', { ...TICKET_VALIDO, categoriaId: '999', solicitanteId: 'abc', prioridad: 'Urgentísima' });
  assert.equal(r.status, 422);
  assert.match(r.html, /Seleccione una categoría válida/);
  assert.match(r.html, /Seleccione un solicitante válido/);
  assert.match(r.html, /Seleccione una prioridad válida/);
});

test('CP-04 (RF-02): códigos únicos y correlativos con fecha de creación automática', async () => {
  await post('/tickets', TICKET_VALIDO);
  await post('/tickets', { ...TICKET_VALIDO, titulo: 'Teclado no responde' });
  const filas = db.prepare('SELECT codigo, fecha_creacion FROM ticket WHERE id > 6 ORDER BY id').all();
  assert.deepEqual(filas.map((f) => f.codigo), ['TKT-000007', 'TKT-000008']);
  filas.forEach((f) => assert.match(f.fecha_creacion, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/));
});

test('CP-05 (RF-03): el listado muestra todos los tickets con estado, prioridad y responsable', async () => {
  const { status, html } = await get('/');
  assert.equal(status, 200);
  for (let i = 1; i <= 6; i++) assert.match(html, new RegExp(`TKT-00000${i}`));
  assert.match(html, /Sin asignar/);
  assert.match(html, /Elena Soto/);
  assert.match(html, /En proceso/);
  assert.match(html, /Crítica/);
});

test('CP-06 (RF-04): asignar responsable actualiza el ticket y registra historial', async () => {
  const r = await post('/tickets/1/asignar', { responsableId: '4', usuarioId: '6', comentario: 'Revisar hoy' });
  assert.equal(r.status, 303);
  assert.equal(db.prepare('SELECT responsable_id FROM ticket WHERE id = 1').get().responsable_id, 4);
  const h = db.prepare("SELECT * FROM historial_ticket WHERE ticket_id = 1 AND campo = 'responsable'").get();
  assert.equal(h.valor_nuevo, 'Diego Rojas');
  assert.equal(h.usuario_id, 6);

  const detalle = await get(r.location);
  assert.match(detalle.html, /Responsable asignado/);
  assert.match(detalle.html, /Revisar hoy/);
});

test('RF-04: no se puede asignar como responsable a un solicitante', async () => {
  const r = await post('/tickets/1/asignar', { responsableId: '2', usuarioId: '6' });
  assert.equal(r.status, 422);
  assert.match(r.html, /Seleccione un técnico válido/);
});

test('CP-07 (RF-04): cambio de estado válido Nuevo → En proceso con responsable', async () => {
  await post('/tickets/1/asignar', { responsableId: '4', usuarioId: '6' });
  const r = await post('/tickets/1/estado', { estado: 'En proceso', usuarioId: '4' });
  assert.equal(r.status, 303);
  assert.equal(db.prepare('SELECT estado FROM ticket WHERE id = 1').get().estado, 'En proceso');
  assert.equal(contar("SELECT COUNT(*) n FROM historial_ticket WHERE ticket_id = 1 AND campo = 'estado'"), 1);
});

test('CP-08 (RF-04): no se puede pasar a En proceso sin responsable', async () => {
  const r = await post('/tickets/1/estado', { estado: 'En proceso', usuarioId: '6' });
  assert.equal(r.status, 422);
  assert.match(r.html, /primero asigne un responsable/);
  assert.equal(db.prepare('SELECT estado FROM ticket WHERE id = 1').get().estado, 'Nuevo');
});

test('RF-04: rechaza saltos de estado fuera del flujo (En proceso → Cerrado)', async () => {
  const r = await post('/tickets/2/estado', { estado: 'Cerrado', usuarioId: '4' });
  assert.equal(r.status, 422);
  assert.match(r.html, /No se puede pasar de &#34;En proceso&#34; a &#34;Cerrado&#34;/);
});

test('CP-09 (RF-04): cerrar un ticket resuelto registra la fecha de cierre y bloquea cambios', async () => {
  const r = await post('/tickets/3/estado', { estado: 'Cerrado', usuarioId: '3', comentario: 'Conforme' });
  assert.equal(r.status, 303);
  const t = db.prepare('SELECT estado, fecha_cierre FROM ticket WHERE id = 3').get();
  assert.equal(t.estado, 'Cerrado');
  assert.ok(t.fecha_cierre);

  const otra = await post('/tickets/3/asignar', { responsableId: '4', usuarioId: '6' });
  assert.equal(otra.status, 422);
  assert.match(otra.html, /ticket cerrado/);
});

test('RF-04: reabrir un ticket resuelto (Resuelto → En proceso) limpia la fecha de cierre', async () => {
  const r = await post('/tickets/3/estado', { estado: 'En proceso', usuarioId: '5' });
  assert.equal(r.status, 303);
  const t = db.prepare('SELECT estado, fecha_cierre FROM ticket WHERE id = 3').get();
  assert.equal(t.estado, 'En proceso');
  assert.equal(t.fecha_cierre, null);
});

test('RF-04: exige indicar quién realiza el cambio', async () => {
  const r = await post('/tickets/1/asignar', { responsableId: '4', usuarioId: '' });
  assert.equal(r.status, 422);
  assert.match(r.html, /Seleccione quién realiza el cambio/);
});

test('CP-14 (CAL-01): ticket inexistente muestra página amigable, sin traza técnica', async () => {
  for (const ruta of ['/tickets/9999', '/tickets/abc']) {
    const { status, html } = await get(ruta);
    assert.equal(status, 404);
    assert.match(html, /Ticket no encontrado/);
    assert.doesNotMatch(html, /at .*\.js/);
  }
  const accion = await post('/tickets/9999/estado', { estado: 'En proceso', usuarioId: '4' });
  assert.equal(accion.status, 404);
});

test('CAL-01: el contenido ingresado se escapa (sin inyección de HTML)', async () => {
  await post('/tickets', { ...TICKET_VALIDO, titulo: '<script>alert(1)</script>' });
  const { html } = await get('/');
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /&lt;script&gt;/);
});

// Cuenta las filas de la tabla del listado (enlaces al detalle en la columna Código)
const filasListado = (html) => (html.match(/<td><a href="\/tickets\/\d+">TKT-/g) || []).length;

test('CP-10 (RF-05): filtrar por estado muestra solo los tickets en ese estado', async () => {
  const { html } = await get('/?estado=' + encodeURIComponent('En proceso'));
  assert.equal(filasListado(html), 2);
  assert.match(html, /TKT-000002/);
  assert.match(html, /TKT-000005/);
});

test('CP-11 (RF-05): filtros combinados (Red + Crítica) se aplican a la vez', async () => {
  const { html } = await get('/?categoriaId=3&prioridad=' + encodeURIComponent('Crítica'));
  assert.equal(filasListado(html), 1);
  assert.match(html, /TKT-000002/);
  assert.match(html, /Limpiar/);
});

test('RF-05: filtros sin coincidencias muestran mensaje; valores inválidos se ignoran', async () => {
  const sinResultados = await get('/?estado=Cerrado&prioridad=' + encodeURIComponent('Crítica'));
  assert.equal(filasListado(sinResultados.html), 0);
  assert.match(sinResultados.html, /Ninguna solicitud coincide/);

  const invalidos = await get('/?estado=Inventado&categoriaId=999&prioridad=x');
  assert.equal(invalidos.status, 200);
  assert.equal(filasListado(invalidos.html), 6);
});

test('CP-12 (RF-06): el resumen muestra total y cantidad por estado', async () => {
  const cifra = (html, etiqueta) =>
    Number(new RegExp(`<span>${etiqueta}</span>\\s*<strong>(\\d+)</strong>`).exec(html)[1]);
  let { html } = await get('/');
  assert.equal(cifra(html, 'Total'), 6);
  assert.equal(cifra(html, 'Nuevo'), 2);
  assert.equal(cifra(html, 'En proceso'), 2);
  assert.equal(cifra(html, 'Resuelto'), 1);
  assert.equal(cifra(html, 'Cerrado'), 1);

  // Se actualiza al registrar y al cambiar estado; no depende de los filtros
  await post('/tickets', TICKET_VALIDO);
  await post('/tickets/3/estado', { estado: 'Cerrado', usuarioId: '3' });
  ({ html } = await get('/?estado=Nuevo'));
  assert.equal(cifra(html, 'Total'), 7);
  assert.equal(cifra(html, 'Nuevo'), 3);
  assert.equal(cifra(html, 'Resuelto'), 0);
  assert.equal(cifra(html, 'Cerrado'), 2);
});
