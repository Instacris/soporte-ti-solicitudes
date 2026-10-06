# Pruebas funcionales y registro de defectos

Plan de pruebas: [02_H2_linea_base.md §9](02_H2_linea_base.md#9-plan-de-pruebas-inicial).

Las pruebas automatizadas están en [`test/tickets.test.js`](../test/tickets.test.js) y se ejecutan con:

```bash
npm test
```

Cada prueba levanta la aplicación con una base de datos en memoria cargada con `db/seed.sql`, envía las
peticiones HTTP que haría el navegador y verifica la respuesta y el contenido de la BD.

## Ejecución 1 — 30-09 (MVP v0.1, RF-01 a RF-04)

**Ejecutado por:** Cristóbal Chacón · **Versión:** commit del 30-09 · **Resultado:** 16/16 automatizadas aprobadas + recorrido manual aprobado

| ID | Requisito | Caso | Tipo | Resultado |
|---|---|---|---|---|
| CP-01 | RF-01 | Registrar ticket válido → estado Nuevo y visible en listado | Automatizada + manual | ✅ Aprobado |
| CP-02 | RF-01 / CAL-01 | Registrar sin título → no se guarda, mensaje | Automatizada | ✅ Aprobado |
| CP-03 | CAL-01 | Descripción corta → no se guarda, conserva lo escrito | Automatizada | ✅ Aprobado |
| CP-03b | CAL-01 | Categoría / solicitante / prioridad inexistentes → rechazo | Automatizada | ✅ Aprobado |
| CP-04 | RF-02 | Códigos TKT correlativos y fecha automática | Automatizada | ✅ Aprobado |
| CP-05 | RF-03 | Listado con estado, prioridad y responsable | Automatizada + manual | ✅ Aprobado |
| CP-06 | RF-04 | Asignar responsable + historial | Automatizada + manual | ✅ Aprobado |
| CP-06b | RF-04 | No se puede asignar a un solicitante como responsable | Automatizada | ✅ Aprobado |
| CP-07 | RF-04 | Nuevo → En proceso con responsable | Automatizada + manual | ✅ Aprobado |
| CP-08 | RF-04 | En proceso sin responsable → rechazo | Automatizada | ✅ Aprobado |
| CP-08b | RF-04 | Salto de estado fuera del flujo → rechazo | Automatizada | ✅ Aprobado |
| CP-09 | RF-04 | Cerrar ticket → fecha de cierre, sin más cambios | Automatizada | ✅ Aprobado |
| CP-09b | RF-04 | Reabrir Resuelto → En proceso | Automatizada | ✅ Aprobado |
| CP-09c | RF-04 | Exige indicar quién realiza el cambio | Automatizada | ✅ Aprobado |
| CP-10 | RF-05 | Filtrar por estado | Automatizada | ✅ Aprobado (ejecución 2) |
| CP-11 | RF-05 | Filtros combinados | Automatizada | ✅ Aprobado (ejecución 2) |
| CP-12 | RF-06 | Resumen por estado (se actualiza al registrar y cerrar) | Automatizada + manual | ✅ Aprobado (ejecución 2) |
| CP-13 | BD-01 | Persistencia tras reiniciar la app | Manual | ✅ Aprobado |
| CP-14 | CAL-01 | Ticket inexistente → página amigable (404) | Automatizada | ✅ Aprobado |
| CP-15 | CAL-01 | Texto con HTML se muestra escapado | Automatizada | ✅ Aprobado |

**Recorrido manual (navegador):** se registró *TKT-000007 "Proyector de sala B no enciende"* desde el formulario,
se asignó a Elena Soto, se cambió a "En proceso" y se verificó el historial con los 3 movimientos y sus autores.
Tras reiniciar el servidor el ticket seguía en la BD (CP-13).


## Ejecución 2 — 30-09 (RF-05 y RF-06)

**Ejecutado por:** Cristóbal Chacón · **Resultado:** 20/20 automatizadas aprobadas (16 anteriores como regresión + 4 nuevas)

- CP-10, CP-11, CP-12 y un caso extra de RF-05 (filtros sin coincidencias y valores inválidos en la URL) aprobados.
- Manual: filtro Categoría = Red → 2 de 7 tickets; el resumen sigue mostrando el total general (7).
  Evidencia: [`evidencias/2026-09-30_listado_filtro_resumen.jpg`](evidencias/2026-09-30_listado_filtro_resumen.jpg).
## Revisión QA - 30-09
**Revisado Por:** Milton Zambrano
- Revise el Plan de pruebas y los casos CP-01 a CP-15:[ok/observaciones]
- Revisé y validé la línea base del H2 (alcance, costos, diagrama ER):[ok/observaciones]

## Registro de defectos

| ID | Fecha | Descripción | Severidad | Causa | Corrección | Retest |
|---|---|---|---|---|---|---|
| DEF-01 | 30-09 | Los tickets de prueba mostraban fecha de creación posterior a la de actualización (fechas de octubre en `seed.sql`) | Baja | Datos de prueba con fechas futuras | Fechas movidas a septiembre y `fecha_actualizacion` calculada desde el historial | ✅ 30-09 |
| DEF-02 | 30-09 | `npm run db:reset` terminaba con un error técnico (EPERM) si la app estaba abierta | Baja | El servidor mantiene abierto el archivo `mesa.db` | El script muestra "Detenga la aplicación y reintente" | ✅ 30-09 |
