# Revisión cruzada y QA · H3

**Revisor:** Milton Zambrano · **Fecha:** 06-10-2026 · **Revisa trabajo de:** Cristóbal Chacón

## 1. Ejecución de la revisión
```bash
npm install
npm test            # esperado según pruebas.md: 20 pruebas aprobadas
npm start           # probado en http://localhost:3000
```
| Verificación | Resultado | Comentario |
|---|---|---|
| `npm test` termina con todas las pruebas aprobadas | ☑ Sí ☐ No | N.º de pruebas: 20, todas aprobadas, coincide con lo registrado en `pruebas.md` |
| La app abre en el navegador y muestra el listado | ☑ Sí ☐ No | Se ven los 6 tickets de prueba con estado, prioridad y responsable |
| Registrar ticket válido → aparece en el listado con código TKT | ☑ Sí ☐ No | Se asigna un código correlativo `TKT-00000X` y la fecha de creación automática |
| Registrar con campos vacíos → mensajes de error y no se guarda | ☑ Sí ☐ No | El formulario marca los campos con error, conserva lo escrito y no crea el ticket |
| Asignar responsable → queda en el listado y en el historial | ☑ Sí ☐ No | Solo permite técnicos o administradores y registra quién hizo el cambio |
| Cambiar estado respetando el flujo; salto inválido se rechaza | ☑ Sí ☐ No | Un salto fuera del flujo se rechaza con el aviso "No se puede pasar de X a Y" |
| Reiniciar la app → los datos siguen guardados | ☑ Sí ☐ No | Los datos quedan en `db/mesa.db` y siguen ahí tras reiniciar el servidor |

## 2. Revisión de decisiones técnicas (revisión cruzada)
Revisado: arquitectura en tres capas, `db/schema.sql`, reglas de transición de estados.

- **Arquitectura:** la separación entre rutas, servicios y repositorio es clara. Las validaciones y reglas de negocio están en una sola capa (`servicios.js`) y todo el SQL en otra (`repositorio.js`), lo que facilita probarlas por separado.
- **Base de datos:** las restricciones `CHECK` (estado, prioridad, largo de textos), las claves foráneas y el trigger del código protegen los datos aunque falle la aplicación. La tabla `historial_ticket` cumple BD-01.
- **Reglas de negocio:** el flujo Nuevo → En proceso → Resuelto → Cerrado, con reapertura desde Resuelto, y la exigencia de responsable para avanzar son coherentes con RF-04.
- **Errores:** las páginas de error no muestran trazas técnicas (CAL-01).

Las decisiones son consistentes con RF-01 a RF-04, BD-01 y CAL-01.

## 3. Observaciones
| ID | Observación | Severidad | Propuesta |
|---|---|---|---|
| OBS-01 | El README no explicaba cómo ejecutar el proyecto | Baja | Corregido en este hito |
| OBS-02 | Las fechas de ejecución de pruebas (30-09) no coinciden con las del backlog (01 a 05-10) | Media | Unificar fechas reales |
| OBS-03 | No hay inicio de sesión; "quién realiza el cambio" se elige en un selector | Baja | Declarar limitación del MVP |
| OBS-04 | La revisión QA de `pruebas.md` tenía textos `[ok/observaciones]` sin completar | Baja | Reemplazada por este documento |

## 4. Conclusión
Se aprueba el hito H3. El MVP cumple RF-01 a RF-04: registra solicitudes con código y fecha, las lista con estado, prioridad y responsable, permite asignar responsable y cambiar el estado según el flujo definido, y conserva los datos en la base de datos. Las 20 pruebas automatizadas pasan y el recorrido manual no mostró fallos. No quedan defectos abiertos.

La aprobación queda con las observaciones OBS-02 y OBS-03:
- **OBS-02:** unificar las fechas de ejecución de pruebas y del backlog antes del informe final, para que el planificado vs. real sea coherente.
- **OBS-03:** declarar en el informe que el MVP no tiene autenticación.

RF-05 y RF-06 se adelantaron desde el H4 y quedan para validación formal en ese hito, junto con las pruebas de integración y el retest.
