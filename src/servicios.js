// Capa de lógica: validaciones (CAL-01) y reglas de negocio del flujo de estados (RF-04).

const PRIORIDADES = ['Baja', 'Media', 'Alta', 'Crítica'];
const ESTADOS = ['Nuevo', 'En proceso', 'Resuelto', 'Cerrado'];

// Flujo permitido: Nuevo → En proceso → Resuelto → Cerrado, con reapertura Resuelto → En proceso.
const TRANSICIONES = {
  'Nuevo': ['En proceso'],
  'En proceso': ['Resuelto'],
  'Resuelto': ['Cerrado', 'En proceso'],
  'Cerrado': [],
};

const TITULO_MIN = 5;
const TITULO_MAX = 120;
const DESCRIPCION_MIN = 10;
const DESCRIPCION_MAX = 2000;
const COMENTARIO_MAX = 500;

// Error esperado de negocio o validación: se muestra al usuario tal cual.
class ErrorNegocio extends Error {
  constructor(mensaje, { errores = {}, status = 400 } = {}) {
    super(mensaje);
    this.errores = errores;
    this.status = status;
  }
}

function aEntero(valor) {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function crearServicios(repo) {
  function buscarTicket(id) {
    const ticket = aEntero(id) && repo.obtenerTicket(aEntero(id));
    if (!ticket) throw new ErrorNegocio('Ticket no encontrado.', { status: 404 });
    return ticket;
  }

  function validarUsuarioQueActua(usuarioId) {
    const usuario = aEntero(usuarioId) && repo.obtenerUsuario(aEntero(usuarioId));
    if (!usuario || !usuario.activo) throw new ErrorNegocio('Seleccione quién realiza el cambio.');
    return usuario;
  }

  function validarComentario(comentario) {
    const c = texto(comentario);
    if (c.length > COMENTARIO_MAX) {
      throw new ErrorNegocio(`El comentario no puede superar ${COMENTARIO_MAX} caracteres.`);
    }
    return c;
  }

  return {
    buscarTicket,

    // RF-05: descarta valores de filtro que no correspondan a opciones válidas
    normalizarFiltros(query) {
      const estado = texto(query.estado);
      const prioridad = texto(query.prioridad);
      const categoriaId = aEntero(query.categoriaId);
      return {
        estado: ESTADOS.includes(estado) ? estado : '',
        prioridad: PRIORIDADES.includes(prioridad) ? prioridad : '',
        categoriaId: categoriaId && repo.obtenerCategoria(categoriaId) ? categoriaId : null,
      };
    },

    // CAL-01: valida los datos del formulario de RF-01. Devuelve { errores, valores }.
    validarNuevoTicket(datos) {
      const valores = {
        titulo: texto(datos.titulo),
        descripcion: texto(datos.descripcion),
        solicitanteId: aEntero(datos.solicitanteId),
        categoriaId: aEntero(datos.categoriaId),
        prioridad: texto(datos.prioridad),
      };
      const errores = {};

      if (!valores.titulo) errores.titulo = 'El título es obligatorio.';
      else if (valores.titulo.length < TITULO_MIN || valores.titulo.length > TITULO_MAX) {
        errores.titulo = `El título debe tener entre ${TITULO_MIN} y ${TITULO_MAX} caracteres.`;
      }

      if (!valores.descripcion) errores.descripcion = 'La descripción es obligatoria.';
      else if (valores.descripcion.length < DESCRIPCION_MIN) {
        errores.descripcion = `La descripción debe tener al menos ${DESCRIPCION_MIN} caracteres.`;
      } else if (valores.descripcion.length > DESCRIPCION_MAX) {
        errores.descripcion = `La descripción no puede superar ${DESCRIPCION_MAX} caracteres.`;
      }

      const solicitante = valores.solicitanteId && repo.obtenerUsuario(valores.solicitanteId);
      if (!solicitante || !solicitante.activo) errores.solicitanteId = 'Seleccione un solicitante válido.';

      const categoria = valores.categoriaId && repo.obtenerCategoria(valores.categoriaId);
      if (!categoria || !categoria.activa) errores.categoriaId = 'Seleccione una categoría válida.';

      if (!PRIORIDADES.includes(valores.prioridad)) errores.prioridad = 'Seleccione una prioridad válida.';

      return { errores, valores };
    },

    // RF-01 + RF-02
    registrarTicket(datos) {
      const { errores, valores } = this.validarNuevoTicket(datos);
      if (Object.keys(errores).length > 0) {
        throw new ErrorNegocio('Revise los campos marcados.', { errores });
      }
      return repo.crearTicket(valores);
    },

    // RF-04
    asignarResponsable(ticketId, { responsableId, usuarioId, comentario }) {
      const ticket = buscarTicket(ticketId);
      if (ticket.estado === 'Cerrado') {
        throw new ErrorNegocio('No se puede cambiar el responsable de un ticket cerrado.');
      }
      const responsable = aEntero(responsableId) && repo.obtenerUsuario(aEntero(responsableId));
      if (!responsable || !responsable.activo || !['TECNICO', 'ADMIN'].includes(responsable.rol)) {
        throw new ErrorNegocio('Seleccione un técnico válido como responsable.');
      }
      if (responsable.id === ticket.responsable_id) {
        throw new ErrorNegocio(`${responsable.nombre} ya es el responsable de este ticket.`);
      }
      const usuario = validarUsuarioQueActua(usuarioId);
      repo.asignarResponsable(ticket, responsable, usuario.id, validarComentario(comentario));
    },

    // RF-04
    cambiarEstado(ticketId, { estado, usuarioId, comentario }) {
      const ticket = buscarTicket(ticketId);
      const nuevoEstado = texto(estado);
      if (!ESTADOS.includes(nuevoEstado)) throw new ErrorNegocio('Seleccione un estado válido.');
      if (!TRANSICIONES[ticket.estado].includes(nuevoEstado)) {
        throw new ErrorNegocio(`No se puede pasar de "${ticket.estado}" a "${nuevoEstado}".`);
      }
      if (nuevoEstado !== 'Nuevo' && !ticket.responsable_id) {
        throw new ErrorNegocio(`No se puede cambiar a "${nuevoEstado}": primero asigne un responsable.`);
      }
      const usuario = validarUsuarioQueActua(usuarioId);
      repo.cambiarEstado(ticket, nuevoEstado, usuario.id, validarComentario(comentario));
    },
  };
}

module.exports = { crearServicios, ErrorNegocio, PRIORIDADES, ESTADOS, TRANSICIONES };
