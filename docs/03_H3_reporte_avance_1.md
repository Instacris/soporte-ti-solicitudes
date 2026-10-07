# Reporte de Avance N.º 1 · H3 · MVP funcional

**Fecha:** 06-10-2026 · **Repositorio:** https://github.com/Instacris/soporte-ti-solicitudes
**Equipo:** Cristóbal Chacón (@Instacris), Milton Zambrano (@SIKEto)
**Tablero:** Kanban con las columnas Backlog, Por hacer, En curso, En revisión/pruebas, Hecho y Bloqueado. Su exportación está versionada en `docs/backlog.csv` y las capturas con fecha en `docs/evidencias/`.

## 1. Resumen
El MVP permite registrar solicitudes con código `TKT-000001` y fecha, listarlas con estado, prioridad y responsable, asignar responsable y cambiar el estado siguiendo un flujo definido, todo con persistencia en SQLite e historial de cambios. RF-01 a RF-04 están implementados. Además se adelantaron RF-05 (filtros) y RF-06 (resumen), que correspondían al H4. Las 20 pruebas automatizadas registradas en `docs/pruebas.md` están aprobadas y fueron confirmadas en la revisión cruzada del 06-10 (`03_H3_revision_QA.md`). Hay 2 defectos registrados, corregidos y con retest, y ninguno abierto.

## 2. Roles del hito
La rotación planificada en `02_H2_linea_base.md` asignaba para el H3: Desarrollo a Milton Zambrano, y Líder y Datos/QA a Cristóbal Chacón.

| Rol | Planificado | Quién ejecutó el trabajo |
|---|---|---|
| Solución y Desarrollo | Milton Zambrano | Cristóbal Chacón (tareas T-11 a T-19 del backlog) |
| Líder y Datos/QA | Cristóbal Chacón | Cristóbal (ejecución de pruebas) y Milton (revisión cruzada y QA) |

**Desviación registrada:** el desarrollo del H3 lo realizó Cristóbal en lugar de seguir la rotación planificada. Se declara por transparencia y se compensa en el H4 con trabajo conjunto, como indica la evaluación. Imprevisto previo ya registrado: equipo de 2 integrantes (T-00).

**Aportes de Milton Zambrano en este hito:** revisión cruzada de las decisiones técnicas y del modelo de datos, ejecución de la revisión QA (`03_H3_revision_QA.md`), actualización del README con las instrucciones de ejecución y redacción de este reporte.

**Traspaso 30-09 → 06-10.**
- Terminado: H1 y H2 (planificación, línea base, diagrama ER, scripts SQL, wireframes y plan de pruebas).
- En curso: validación formal de RF-05 y RF-06, adelantados del H4.
- Bloqueado: nada.
- Evidencia: `docs/evidencias/`, `docs/pruebas.md` y `docs/backlog.csv`.
- Decisión que continúa el nuevo responsable: mantener la arquitectura en tres capas y el flujo de estados definido.

## 3. Avance planificado vs. real
Datos tomados de `docs/backlog.csv`. El avance se controla por estado y fecha objetivo; el detalle de horas reales por tarea se incorporará al informe final.

| Tarea | Requisito | Resp. | Fecha obj. | Est. (h) | Estado al 06-10 | Cumplimiento |
|---|---|---|---|---|---|---|
| T-11 Estructura base Express + SQLite | BD-01 | Cristóbal | 01-10 | 3 | Hecho | En fecha |
| T-12 Registro de ticket | RF-01, RF-02 | Cristóbal | 02-10 | 6 | Hecho | En fecha |
| T-13 Listado de tickets | RF-03 | Cristóbal | 03-10 | 4 | Hecho | En fecha |
| T-14 Asignar responsable y cambiar estado | RF-04 | Cristóbal | 05-10 | 6 | Hecho | En fecha |
| T-15 Validaciones y manejo de errores | CAL-01 | Cristóbal | 05-10 | 4 | Hecho | En fecha |
| T-16 Pruebas funcionales iniciales | CAL-01 | Cristóbal | 06-10 | 5 | Hecho | En fecha |
| T-17 Reporte de Avance N.º 1 | — | Cristóbal / Milton | 06-10 | 2 | Hecho | En fecha |
| T-18 Filtros (H3/H4) | RF-05 | Cristóbal | 06-10 | 4 | Hecho | En fecha |
| T-19 Resumen por estado (H4) | RF-06 | Cristóbal | 07-10 | 3 | Hecho | Adelantado un día |

**Lectura:** las 9 tareas del período están terminadas y ninguna quedó atrasada. El plan del H3 sin adelantos (T-11 a T-17) suma 30 h estimadas; se adelantaron además 7 h del H4 (T-18 y T-19). Quedan para el H4: T-20 (integración, QA, retest y análisis de cambio) y T-21 (Reporte de Avance N.º 2).

**Observación:** la "Ejecución 1" de `pruebas.md` figura con fecha 30-09 y las tareas del backlog tienen fechas entre el 01 y el 05-10. Las fechas reales se unificarán antes del informe final (ver R-02).

## 4. Decisiones técnicas
| Decisión | Motivo |
|---|---|
| Node.js + Express + EJS + SQLite | Stack pequeño, sin servidor de base de datos aparte, reproducible con `npm install` |
| Tres capas (rutas, servicios, repositorio) | Separa HTTP, reglas de negocio y SQL; permite probar cada parte |
| Flujo de estados con transiciones permitidas | Evita saltos como Nuevo → Cerrado y exige responsable para avanzar |
| Reglas también en la BD (`CHECK`, trigger del código) | La base protege los datos aunque falle la aplicación |
| Tabla `historial_ticket` con autor del cambio | Cumple BD-01 y da trazabilidad de estado y responsable |

## 5. Calidad y pruebas
- Plan de pruebas: `02_H2_linea_base.md` §9, con los casos CP-01 a CP-15.
- Ejecuciones registradas en `docs/pruebas.md`: 20 de 20 pruebas automatizadas aprobadas más recorrido manual.
- Revisión cruzada de Milton Zambrano el 06-10: `docs/03_H3_revision_QA.md`, con resultado aprobado y observaciones OBS-02 y OBS-03.
- Defectos: DEF-01 (fechas de prueba inconsistentes) y DEF-02 (error técnico en `db:reset`), ambos corregidos y con retest aprobado el 30-09.

## 6. Riesgos y bloqueos
| ID | Riesgo o bloqueo | Acción |
|---|---|---|
| T-00 | Inicio tardío y equipo reducido a 2 integrantes (resuelto) | H1 y H2 consolidados el 30-09 y rotación adaptada |
| R-01 | Trabajo y commits concentrados en un integrante | Repartir el trabajo del H4 (T-20, T-21) para que cada uno haga commits de lo que ejecuta |
| R-02 | Fechas del backlog y de las pruebas no coinciden | Unificarlas antes de cerrar el H4 |
| R-03 | La aplicación exige Node 22.13 o superior | Indicado en el README |
| R-04 | No hay inicio de sesión: el autor del cambio se elige en el formulario | Se declara como limitación del MVP |

No hay bloqueos activos al 06-10.

## 7. Próximos pasos (H4 · 07-10)
Integración completa de las funciones, pruebas de integración y retest, análisis de un cambio o imprevisto con actualización de alcance y cronograma si corresponde, y Reporte de Avance N.º 2.

## 8. Evidencias
- Tablero: captura del 06-10 en `docs/evidencias/2026-10-06_H3_tablero_kanban.jpg` y exportación en `docs/backlog.csv`.
- Repositorio y commits de ambos integrantes: pestaña *Commits* del repositorio.
- Pruebas y defectos: `docs/pruebas.md` y `docs/03_H3_revision_QA.md`.
- Demo parcial: abrir la aplicación → registrar un ticket → verlo en el listado → asignar responsable → cambiar estado → revisar el historial → reiniciar y comprobar que los datos persisten.
