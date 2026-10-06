// Capa de acceso a datos: todas las consultas SQL de la aplicación.

const SELECT_TICKET = `
  SELECT t.id, t.codigo, t.titulo, t.descripcion, t.prioridad, t.estado,
         t.fecha_creacion, t.fecha_actualizacion, t.fecha_cierre,
         t.solicitante_id, s.nombre AS solicitante, s.area AS solicitante_area,
         t.categoria_id, c.nombre AS categoria,
         t.responsable_id, r.nombre AS responsable
  FROM ticket t
  JOIN usuario s   ON s.id = t.solicitante_id
  JOIN categoria c ON c.id = t.categoria_id
  LEFT JOIN usuario r ON r.id = t.responsable_id`;

function crearRepositorio(db) {
  function enTransaccion(fn) {
    db.exec('BEGIN');
    try {
      const resultado = fn();
      db.exec('COMMIT');
      return resultado;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }

  function registrarHistorial(ticketId, usuarioId, campo, anterior, nuevo, comentario) {
    db.prepare(`
      INSERT INTO historial_ticket (ticket_id, usuario_id, campo, valor_anterior, valor_nuevo, comentario)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run(ticketId, usuarioId ?? null, campo, anterior ?? null, nuevo ?? null, comentario || null);
  }

  return {
    listarUsuariosActivos() {
      return db.prepare('SELECT id, nombre, area, rol FROM usuario WHERE activo = 1 ORDER BY nombre').all();
    },

    listarTecnicos() {
      return db.prepare(`
        SELECT id, nombre FROM usuario
        WHERE activo = 1 AND rol IN ('TECNICO', 'ADMIN') ORDER BY nombre`).all();
    },

    listarCategorias() {
      return db.prepare('SELECT id, nombre FROM categoria WHERE activa = 1 ORDER BY nombre').all();
    },

    obtenerUsuario(id) {
      return db.prepare('SELECT id, nombre, rol, activo FROM usuario WHERE id = ?').get(id);
    },

    obtenerCategoria(id) {
      return db.prepare('SELECT id, nombre, activa FROM categoria WHERE id = ?').get(id);
    },

    // RF-03 + RF-05: los filtros ya vienen validados por la capa de servicios
    listarTickets({ estado, prioridad, categoriaId } = {}) {
      const condiciones = [];
      const params = [];
      if (estado) { condiciones.push('t.estado = ?'); params.push(estado); }
      if (prioridad) { condiciones.push('t.prioridad = ?'); params.push(prioridad); }
      if (categoriaId) { condiciones.push('t.categoria_id = ?'); params.push(categoriaId); }
      const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
      return db.prepare(`${SELECT_TICKET} ${where} ORDER BY t.fecha_creacion DESC, t.id DESC`).all(...params);
    },

    // RF-06
    resumenPorEstado() {
      const filas = db.prepare('SELECT estado, cantidad FROM v_resumen_estado').all();
      return {
        total: filas.reduce((suma, f) => suma + f.cantidad, 0),
        porEstado: filas,
      };
    },

    obtenerTicket(id) {
      return db.prepare(`${SELECT_TICKET} WHERE t.id = ?`).get(id);
    },

    historialDeTicket(ticketId) {
      return db.prepare(`
        SELECT h.fecha, h.campo, h.valor_anterior, h.valor_nuevo, h.comentario, u.nombre AS usuario
        FROM historial_ticket h
        LEFT JOIN usuario u ON u.id = h.usuario_id
        WHERE h.ticket_id = ?
        ORDER BY h.fecha DESC, h.id DESC`).all(ticketId);
    },

    // RF-01 / RF-02: el código TKT-000000 lo genera el trigger de la BD
    crearTicket({ titulo, descripcion, solicitanteId, categoriaId, prioridad }) {
      return enTransaccion(() => {
        const { lastInsertRowid } = db.prepare(`
          INSERT INTO ticket (titulo, descripcion, solicitante_id, categoria_id, prioridad)
          VALUES (?, ?, ?, ?, ?)`)
          .run(titulo, descripcion, solicitanteId, categoriaId, prioridad);
        const id = Number(lastInsertRowid);
        registrarHistorial(id, solicitanteId, 'creacion', null, 'Nuevo', 'Ticket creado');
        return this.obtenerTicket(id);
      });
    },

    // RF-04
    asignarResponsable(ticket, responsable, usuarioId, comentario) {
      enTransaccion(() => {
        db.prepare(`
          UPDATE ticket SET responsable_id = ?, fecha_actualizacion = datetime('now', 'localtime')
          WHERE id = ?`).run(responsable.id, ticket.id);
        registrarHistorial(ticket.id, usuarioId, 'responsable', ticket.responsable, responsable.nombre, comentario);
      });
    },

    // RF-04
    cambiarEstado(ticket, nuevoEstado, usuarioId, comentario) {
      enTransaccion(() => {
        db.prepare(`
          UPDATE ticket
          SET estado = ?,
              fecha_actualizacion = datetime('now', 'localtime'),
              fecha_cierre = CASE WHEN ? = 'Cerrado' THEN datetime('now', 'localtime') ELSE NULL END
          WHERE id = ?`).run(nuevoEstado, nuevoEstado, ticket.id);
        registrarHistorial(ticket.id, usuarioId, 'estado', ticket.estado, nuevoEstado, comentario);
      });
    },
  };
}

module.exports = { crearRepositorio };
