# Revisión cruzada y QA · H3

**Revisor:** Milton Zambrano · **Fecha:** 06-10-2026 · **Revisa trabajo de:** Cristóbal Chacón

## 1. Ejecución de la revisión (completar con lo que se vea en tu computador)
```bash
npm install
npm test            # esperado según pruebas.md: 20 pruebas aprobadas
npm start           # probar en http://localhost:3000
```
| Verificación | Resultado (marcar) | Comentario |
|---|---|---|
| `npm test` termina con todas las pruebas aprobadas | ☐ Sí ☐ No | N.º de pruebas: [ ] |
| La app abre en el navegador y muestra el listado | ☐ Sí ☐ No | |
| Registrar ticket válido → aparece en el listado con código TKT | ☐ Sí ☐ No | |
| Registrar con campos vacíos → mensajes de error y no se guarda | ☐ Sí ☐ No | |
| Asignar responsable → queda en el listado y en el historial | ☐ Sí ☐ No | |
| Cambiar estado respetando el flujo; salto inválido se rechaza | ☐ Sí ☐ No | |
| Reiniciar la app → los datos siguen guardados | ☐ Sí ☐ No | |

## 2. Revisión de decisiones técnicas (revisión cruzada)
Revisado: arquitectura en tres capas, `db/schema.sql`, reglas de transición de estados.
Parecen correctas y consistentes con RF-01 a RF-04, BD-01 y CAL-01.

## 3. Observaciones
| ID | Observación | Severidad | Propuesta |
|---|---|---|---|
| OBS-01 | El README no explicaba cómo ejecutar el proyecto | Baja | Corregido en este hito |
| OBS-02 | Las fechas de ejecución de pruebas (30-09) no coinciden con las del backlog (01 a 05-10) | Media | Unificar fechas reales |
| OBS-03 | No hay inicio de sesión; "quién realiza el cambio" se elige en un selector | Baja | Declarar limitación del MVP |
| OBS-04 | La revisión QA de `pruebas.md` tenía textos `[ok/observaciones]` sin completar | Baja | Reemplazada por este documento |

## 4. Conclusión
[COMPLETAR tras ejecutar la sección 1: por ejemplo "Se aprueba el hito H3 con las observaciones OBS-02 y OBS-03".]
