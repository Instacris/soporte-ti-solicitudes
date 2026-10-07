# Reporte de Avance N.º 1 · H3 · MVP funcional

**Fecha:** 06-10-2026 · **Repositorio:** https://github.com/Instacris/soporte-ti-solicitudes · **Tablero:** [COMPLETAR enlace]
**Equipo:** Cristóbal Chacón (@Instacris), Milton Zambrano (@SIKEto)

## 1. Resumen
El MVP permite registrar solicitudes con código `TKT-000001` y fecha, listarlas con estado, prioridad y responsable, asignar responsable y cambiar el estado siguiendo un flujo definido, todo con persistencia en SQLite e historial de cambios. RF-01 a RF-04 están implementados. Además ya se adelantaron RF-05 (filtros) y RF-06 (resumen), que correspondían al H4. Según `docs/pruebas.md`, 20 pruebas automatizadas están aprobadas y hay 2 defectos registrados y corregidos.

## 2. Roles del hito
La rotación planificada en `02_H2_linea_base.md` asignaba para el H3: Desarrollo a Milton Zambrano, y Líder y Datos/QA a Cristóbal Chacón.

| Rol | Planificado | Quién ejecutó el trabajo |
|---|---|---|
| Solución y Desarrollo | Milton Zambrano | Cristóbal Chacón (tareas T-11 a T-19 en el backlog) |
| Líder y Datos/QA | Cristóbal Chacón | Cristóbal (ejecución de pruebas) y Milton (revisión cruzada y QA, ver `03_H3_revision_QA.md`) |

**Desviación registrada:** el desarrollo del H3 lo realizó Cristóbal en lugar de seguir la rotación. Esto se declara aquí por transparencia y se compensará en el H4 con trabajo conjunto, como indica la evaluación. Imprevisto previo ya registrado: equipo de 2 integrantes (T-00).

**Traspaso 30-09 → 06-10.** Terminado: H1 y H2 (planificación, línea base, ER, scripts, wireframes). En curso: MVP. Bloqueado: nada. Evidencia: `docs/evidencias/`. Decisión que continúa: mantener la arquitectura en tres capas.

## 3. Avance planificado vs. real
Datos tomados de `docs/backlog.csv`. Las horas reales deben completarse con lo que registró cada uno.

| Tarea | Requisito | Resp. | Fecha obj. | Est. (h) | Real (h) | Estado |
|---|---|---|---|---|---|---|
| T-11 Estructura base Express + SQLite | BD-01 | Cristóbal | 01-10 | 3 | [ ] | Hecho |
| T-12 Registro de ticket | RF-01, RF-02 | Cristóbal | 02-10 | 6 | [ ] | Hecho |
| T-13 Listado de tickets | RF-03 | Cristóbal | 03-10 | 4 | [ ] | Hecho |
| T-14 Asignar responsable y cambiar estado | RF-04 | Cristóbal | 05-10 | 6 | [ ] | Hecho |
| T-15 Validaciones y manejo de errores | CAL-01 | Cristóbal | 05-10 | 4 | [ ] | Hecho |
| T-16 Pruebas funcionales iniciales | CAL-01 | Cristóbal | 06-10 | 5 | [ ] | Hecho |
| T-17 Reporte de Avance N.º 1 | — | Cristóbal / Milton | 06-10 | 2 | [ ] | Hecho |
| T-18 Filtros (adelantado del H4) | RF-05 | Cristóbal | 06-10 | 4 | [ ] | Hecho |
| T-19 Resumen por estado (adelantado del H4) | RF-06 | Cristóbal | 07-10 | 3 | [ ] | Hecho |

Estimado del H3 sin adelantos (T-11 a T-17): 30 h. Adelantado del H4 (T-18 y T-19): 7 h. **Pendiente de H4:** T-20 (integración, QA, retest y análisis de cambio), T-21 (Reporte N.º 2).
**Observación:** la "Ejecución 1" de `pruebas.md` está fechada 30-09 y las tareas del backlog llevan fechas del 01 al 05-10. Hay que unificar las fechas reales antes del informe final.

## 4. Decisiones técnicas
| Decisión | Motivo |
|---|---|
| Node.js + Express + EJS + SQLite | Stack pequeño, sin servidor de BD aparte |
| Tres capas (rutas, servicios, repositorio) | Separa HTTP, reglas de negocio y SQL; permite probar cada parte |
| Flujo de estados con transiciones permitidas | Evita saltos como Nuevo → Cerrado; exige responsable para avanzar |
| Reglas también en la BD (`CHECK`, trigger del código) | La base protege los datos aunque falle la aplicación |

## 5. Calidad y pruebas
Plan en `02_H2_linea_base.md` §9, casos CP-01 a CP-15 y ejecuciones en `docs/pruebas.md`. Revisión cruzada de Milton Zambrano en `docs/03_H3_revision_QA.md`. Defectos: DEF-01 (fechas de prueba inconsistentes) y DEF-02 (error técnico en `db:reset`), ambos corregidos y con retest.

## 6. Riesgos y bloqueos
| ID | Riesgo | Acción |
|---|---|---|
| R-01 | Trabajo y commits concentrados en un integrante | Repartir el trabajo del H4 (T-20, T-21) y cada uno hace commits de lo que ejecuta |
| R-02 | Fechas del backlog y de las pruebas no coinciden | Corregirlas antes de cerrar el H4 |
| R-03 | La app exige Node 22.13+ | Indicado en el README |
| R-04 | No hay inicio de sesión: el autor del cambio se elige en el formulario | Se declara como limitación del MVP |

## 7. Próximos pasos (H4 · 07-10)
Integración completa, pruebas de integración y retest, análisis de un cambio o imprevisto, actualizar alcance y cronograma si corresponde, Reporte de Avance N.º 2.

## 8. Evidencias
- Captura del tablero con fecha 06-10: [ADJUNTAR]
- Commits de ambos integrantes: ver pestaña *Commits* del repositorio
- Demo parcial: abrir app → registrar ticket → ver el listado → asignar responsable → cambiar estado → ver historial → reiniciar y comprobar persistencia
