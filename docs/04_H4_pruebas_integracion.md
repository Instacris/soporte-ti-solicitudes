# Pruebas de integración y QA · H4

**Fecha:** 07-10-2026 · **Versión:** MVP v0.9 · **Responsable QA del hito:** Milton Zambrano · **Revisión:** Cristóbal Chacón

## 1. Estrategia
1. **Regresión:** `npm test` vuelve a ejecutar los 20 casos del H3 (CP-01 a CP-15 y casos adicionales) para comprobar que nada se rompió al integrar RF-05 y RF-06.
2. **Integración automatizada:** `test/integracion.test.js` recorre varias funciones juntas (registro, asignación, estados, filtros, resumen y persistencia).
3. **Recorrido manual en el navegador:** valida la interfaz completa con capturas como evidencia.

Resultado obtenido de `npm test`: 24 pruebas ejecutadas y 24 aprobadas (20 existentes + 4 de integración).

## 2. Matriz de casos de integración
| ID | Requisitos | Qué se verifica | Tipo | Resultado |
|---|---|---|---|---|
| INT-01 | RF-01 a RF-04, RF-06 | Un ticket recorre Nuevo → En proceso → Resuelto → Cerrado con responsable; queda historial de 5 movimientos y el resumen se actualiza | Automatizada | ☑ Aprobado ☐ Falló |
| INT-02 | RF-03, RF-05, RF-06 | Filtros, listado y resumen son coherentes tras crear y mover tickets; el resumen no depende del filtro | Automatizada | ☑ Aprobado ☐ Falló |
| INT-03 | CAL-01 | Una operación rechazada (422) no crea tickets ni historial ni cambia el resumen | Automatizada | ☑ Aprobado ☐ Falló |
| INT-04 | BD-01 | Los datos persisten en archivo SQLite al cerrar y reabrir la base | Automatizada | ☑ Aprobado ☐ Falló |
| M-01 | RF-01 a RF-04 | En el navegador: registrar, asignar y cambiar estado de un ticket | Manual | ☑ Aprobado ☐ Falló |
| M-02 | RF-05 | Filtro combinado Categoría + Prioridad; botón Limpiar | Manual (captura) | ☑ Aprobado ☐ Falló |
| M-03 | RF-06 | El resumen cambia al registrar y cerrar tickets | Manual (captura) | ☑ Aprobado ☐ Falló |
| M-04 | CAL-01 | Abrir `/tickets/9999` muestra página amigable sin traza técnica | Manual | ☑ Aprobado ☐ Falló |
| M-05 | BD-01 | Reiniciar el servidor (`Ctrl+C` y `npm start`) y comprobar que los datos siguen | Manual | ☑ Aprobado ☐ Falló |

### Observaciones del recorrido manual
| Caso | Qué se comprobó |
|---|---|
| M-01 | Se registró un ticket desde el formulario, se asignó a un técnico y se cambió a *En proceso*; el listado y el historial mostraron cada movimiento con su autor |
| M-02 | Con Categoría = Red y Prioridad = Crítica el listado muestra solo las solicitudes que cumplen ambas condiciones; el botón *Limpiar* vuelve a mostrar todas |
| M-03 | El resumen (total y cantidad por estado) cambia al registrar y al cerrar tickets, y no se altera al aplicar filtros |
| M-04 | `/tickets/9999` muestra la página "No encontrado" con un mensaje claro y sin traza técnica |
| M-05 | Tras detener y volver a iniciar el servidor, los tickets creados siguen en el listado |

## 3. Ejecución
| Dato | Valor |
|---|---|
| Comando | `npm test` |
| Pruebas ejecutadas / aprobadas / fallidas | 24 / 24 / 0 (20 de regresión del H3 y 4 de integración) |
| Capturas guardadas en | `docs/evidencias/2026-10-07_H4_npm_test.jpg`, `2026-10-07_H4_filtro.jpg`, `2026-10-07_H4_resumen.jpg` y `2026-10-07_H4_tablero_kanban.jpg` |

## 4. Defectos encontrados y retest
Ni las pruebas automatizadas ni el recorrido manual del H4 mostraron fallos, por lo que no hubo correcciones ni retest. Los defectos DEF-01 y DEF-02 siguen cerrados desde el H2.

| ID | Descripción | Severidad | Corrección | Retest |
|---|---|---|---|---|
| — | No se encontraron defectos nuevos en el H4 | — | — | — |

## 5. Pendientes
Unificar las fechas de ejecución de `pruebas.md` con las del backlog (OBS-02 de la revisión del H3).

## 6. Conclusión
Se aprueba la integración del MVP v0.9. RF-01 a RF-06 funcionan en conjunto, la regresión del H3 se mantiene aprobada y no quedan defectos abiertos. RF-05 y RF-06, adelantados desde el H4, quedan validados formalmente con los casos INT-02, M-02 y M-03.
