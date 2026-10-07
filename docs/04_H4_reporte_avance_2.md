# Reporte de Avance N.º 2 · H4 · Integración, QA y control

**Fecha:** 07-10-2026 · **Repositorio:** https://github.com/Instacris/soporte-ti-solicitudes
**Equipo:** Cristóbal Chacón (@Instacris), Milton Zambrano (@SIKEto)
**Versión del producto:** MVP v0.9

## 1. Resumen
El MVP integra RF-01 a RF-06: registro, listado, asignación, estados, filtros y resumen por estado, con persistencia en SQLite e historial de cambios. En este hito se ejecutaron pruebas de regresión e integración (`docs/04_H4_pruebas_integracion.md`), se analizó un imprevisto de recursos (`docs/04_H4_registro_cambio.md`, CR-01) y se redistribuyó el trabajo restante entre los dos integrantes.

## 2. Roles del hito
El 07-10 es de integración conjunta. Reparto acordado:
| Integrante | Trabajo del H4 |
|---|---|
| Milton Zambrano | Pruebas de integración y QA (T-20), retest, registro del cambio, este reporte (T-21) |
| Cristóbal Chacón | Correcciones, unificación de fechas, revisión cruzada de los documentos |

## 3. Avance planificado vs. real
| Tarea | Resp. | Fecha obj. | Est. (h) | Estado | Cumplimiento |
|---|---|---|---|---|---|
| T-18 Filtros (RF-05) | Cristóbal | 06-10 | 4 | Hecho | En fecha |
| T-19 Resumen por estado (RF-06) | Cristóbal | 07-10 | 3 | Hecho | Adelantado un día |
| T-20 Integración, QA, retest y análisis de cambio | Milton | 07-10 | 7 | Hecho | En fecha |
| T-21 Reporte de Avance N.º 2 | Milton | 07-10 | 2 | Hecho | En fecha |
| T-22 Informe final, presentación y demo | Equipo | 13-10 | 18 | Por hacer | En plazo |
| T-23 Mejoras visuales / exportar CSV (opcional) | Sin asignar | 12-10 | 4 | Backlog | Opcional |

**Lectura:** el producto está completo en funciones (RF-01 a RF-06) un hito antes de lo planificado, y el trabajo pendiente es de documentación y cierre.

## 4. Cambio o imprevisto tratado
CR-01: concentración del desarrollo en un integrante y redistribución del trabajo restante. Detalle, análisis de impacto y decisión en `docs/04_H4_registro_cambio.md`. El alcance y el cronograma no cambian; sí cambia la asignación de responsables en el tablero.

## 5. Calidad y pruebas
- Regresión: `npm test` con los 20 casos del H3.
- Integración: INT-01 a INT-04 (automatizadas) y M-01 a M-05 (manuales), en `docs/04_H4_pruebas_integracion.md`.
- Resultado de la ejecución: 24 pruebas ejecutadas, 24 aprobadas y 0 fallidas; los 5 casos manuales también quedaron aprobados.
- Defectos: DEF-01 y DEF-02 cerrados en el H2; defectos nuevos del H4: ninguno.

## 6. Riesgos y bloqueos
| ID | Riesgo | Estado |
|---|---|---|
| R-01 | Trabajo concentrado en un integrante | Mitigado con CR-01 |
| R-02 | Fechas de backlog y pruebas no coinciden | En tratamiento (Cristóbal) |
| R-03 | La app exige Node 22.13 o superior | Cerrado, indicado en el README |
| R-04 | Sin inicio de sesión | Aceptado como limitación del MVP; se declara en el informe |
| R-05 | Poco tiempo para el informe final (T-22, 18 h) hasta el 13-10 | Abierto: empezar el borrador con los capítulos de calidad y reportes ya redactados |

## 7. Próximos pasos
Informe final de 12 a 18 páginas, presentación, demo y paquete de entrega del 13-10; completar el tablero con la vista final (hecho, pendiente y descartado) y la matriz de rotación de roles validada por ambos integrantes.

## 8. Evidencias
- Tablero con captura del 07-10: `docs/evidencias/2026-10-07_H4_tablero_kanban.jpg`
- Matriz de pruebas y capturas: `docs/04_H4_pruebas_integracion.md` y `docs/evidencias/`
- Commits de ambos integrantes: pestaña *Commits* del repositorio
