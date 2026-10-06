const path = require('node:path');
const express = require('express');
const { crearRepositorio } = require('./repositorio');
const { crearServicios, ErrorNegocio } = require('./servicios');
const { crearRutas } = require('./rutas');

function crearApp(db) {
  const repo = crearRepositorio(db);
  const servicios = crearServicios(repo);
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));

  // Ayudantes disponibles en todas las vistas
  app.locals.clase = (valor) =>
    String(valor).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '-');
  app.locals.fecha = (valor) => {
    const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/.exec(valor || '');
    return m ? `${m[3]}-${m[2]}-${m[1]} ${m[4]}:${m[5]}` : '—';
  };

  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use(crearRutas(repo, servicios));

  // 404: ruta inexistente
  app.use((req, res) => {
    res.status(404).render('error', { titulo: 'No encontrado', mensaje: 'La página solicitada no existe.' });
  });

  // CAL-01: manejo de errores sin mostrar trazas técnicas al usuario
  app.use((err, req, res, next) => {
    if (err instanceof ErrorNegocio) {
      return res.status(err.status).render('error', { titulo: 'Aviso', mensaje: err.message });
    }
    console.error(err);
    res.status(500).render('error', {
      titulo: 'Error',
      mensaje: 'Ocurrió un error inesperado. Intente nuevamente o contacte al administrador.',
    });
  });

  return app;
}

module.exports = { crearApp };
