const { abrir } = require('./db');
const { crearApp } = require('./app');

const PUERTO = Number(process.env.PORT) || 3000;

const app = crearApp(abrir());
app.listen(PUERTO, () => {
  console.log(`Mesa de Soporte TI en http://localhost:${PUERTO}`);
});
