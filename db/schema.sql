-- =============================================================
-- Mesa de Soporte TI - Script de creación de base de datos
-- Motor: SQLite 3 (portable a MySQL con cambios menores)
-- Versión: 1.0 (H2 - 30-09)
-- =============================================================

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS historial_ticket;
DROP TABLE IF EXISTS ticket;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS usuario;

-- -------------------------------------------------------------
-- USUARIO: solicitantes, técnicos (responsables) y administradores
-- -------------------------------------------------------------
CREATE TABLE usuario (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre      TEXT    NOT NULL CHECK (length(trim(nombre)) >= 3),
    email       TEXT    NOT NULL UNIQUE CHECK (email LIKE '%_@_%._%'),
    area        TEXT,
    rol         TEXT    NOT NULL DEFAULT 'SOLICITANTE'
                        CHECK (rol IN ('SOLICITANTE', 'TECNICO', 'ADMIN')),
    activo      INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
    creado_en   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- -------------------------------------------------------------
-- CATEGORIA: tipo de solicitud
-- -------------------------------------------------------------
CREATE TABLE categoria (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre      TEXT    NOT NULL UNIQUE,
    descripcion TEXT,
    activa      INTEGER NOT NULL DEFAULT 1 CHECK (activa IN (0, 1))
);

-- -------------------------------------------------------------
-- TICKET: solicitud de soporte (RF-01, RF-02, RF-04)
-- codigo = identificador legible, ej. TKT-000001 (RF-02)
-- -------------------------------------------------------------
CREATE TABLE ticket (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo              TEXT    UNIQUE,
    titulo              TEXT    NOT NULL CHECK (length(trim(titulo)) BETWEEN 5 AND 120),
    descripcion         TEXT    NOT NULL CHECK (length(trim(descripcion)) >= 10),
    solicitante_id      INTEGER NOT NULL REFERENCES usuario(id),
    categoria_id        INTEGER NOT NULL REFERENCES categoria(id),
    prioridad           TEXT    NOT NULL DEFAULT 'Media'
                                CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Crítica')),
    estado              TEXT    NOT NULL DEFAULT 'Nuevo'
                                CHECK (estado IN ('Nuevo', 'En proceso', 'Resuelto', 'Cerrado')),
    responsable_id      INTEGER REFERENCES usuario(id),
    fecha_creacion      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    fecha_actualizacion TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    fecha_cierre        TEXT,
    -- No se puede estar "En proceso" o "Resuelto" sin responsable
    CHECK (estado = 'Nuevo' OR responsable_id IS NOT NULL)
);

CREATE INDEX idx_ticket_estado    ON ticket(estado);
CREATE INDEX idx_ticket_prioridad ON ticket(prioridad);
CREATE INDEX idx_ticket_categoria ON ticket(categoria_id);

-- Genera el código TKT-000001 a partir del id al insertar (RF-02)
CREATE TRIGGER trg_ticket_codigo
AFTER INSERT ON ticket
WHEN NEW.codigo IS NULL
BEGIN
    UPDATE ticket SET codigo = 'TKT-' || printf('%06d', NEW.id) WHERE id = NEW.id;
END;

-- -------------------------------------------------------------
-- HISTORIAL_TICKET: cambios relevantes (BD-01, trazabilidad)
-- -------------------------------------------------------------
CREATE TABLE historial_ticket (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id       INTEGER NOT NULL REFERENCES ticket(id) ON DELETE CASCADE,
    usuario_id      INTEGER REFERENCES usuario(id),       -- quién hizo el cambio
    campo           TEXT    NOT NULL
                            CHECK (campo IN ('creacion', 'estado', 'responsable', 'prioridad')),
    valor_anterior  TEXT,
    valor_nuevo     TEXT,
    comentario      TEXT,
    fecha           TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX idx_historial_ticket ON historial_ticket(ticket_id);

-- -------------------------------------------------------------
-- Vista para el resumen (RF-06)
-- -------------------------------------------------------------
CREATE VIEW v_resumen_estado AS
SELECT e.estado,
       COUNT(t.id) AS cantidad
FROM (SELECT 'Nuevo' AS estado, 1 AS orden
      UNION ALL SELECT 'En proceso', 2
      UNION ALL SELECT 'Resuelto', 3
      UNION ALL SELECT 'Cerrado', 4) e
LEFT JOIN ticket t ON t.estado = e.estado
GROUP BY e.estado, e.orden
ORDER BY e.orden;
