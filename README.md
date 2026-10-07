# Mesa de Soporte TI

Sistema web para registrar las solicitudes de soporte TI de una organización y seguirlas hasta su cierre, con responsable, prioridad, estado y fechas.

## Problema

Hoy las solicitudes de soporte llegan por correo, mensajería y conversaciones informales. No hay un registro único, así que no se sabe quién se hace cargo de cada una, cuál es más urgente ni en qué estado está.

## Equipo

| Integrante | Usuario GitHub |
|---|---|
| Cristóbal Chacón | @Instacris |
| Milton Zambrano | @SIKEto |

## Tecnología

Node.js (**22.13 o superior**) · Express 5 · EJS · SQLite (módulo `node:sqlite`, sin servidor de base de datos aparte).

Arquitectura en tres capas: `src/rutas.js` (HTTP) → `src/servicios.js` (validaciones y reglas de negocio) → `src/repositorio.js` (consultas SQL).

## Cómo ejecutarlo

```bash
node --version        # debe ser 22.13 o superior
npm install
npm start             # abre http://localhost:3000
```

La primera vez se crea `db/mesa.db` con `db/schema.sql` y `db/seed.sql` (datos de prueba ficticios).

| Comando | Qué hace |
|---|---|
| `npm start` | Inicia la aplicación (puerto 3000, o el de la variable `PORT`) |
| `npm run dev` | Inicia con recarga automática |
| `npm test` | Ejecuta las pruebas automatizadas con una BD en memoria |
| `npm run db:reset` | Borra y recrea la BD con los datos de prueba (detener la app antes) |

## Documentación

- [H1 – Inicio y planificación](docs/01_H1_inicio.md)
- [H2 – Línea base](docs/02_H2_linea_base.md)
- [Backlog](docs/backlog.csv)
- [Pruebas y registro de defectos](docs/pruebas.md)
- [H3 – Revisión QA y revisión cruzada](docs/03_H3_revision_QA.md)
- [H3 – Reporte de Avance N.º 1](docs/03_H3_reporte_avance_1.md)
