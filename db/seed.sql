-- =============================================================
-- Mesa de Soporte TI - Datos de prueba
-- Ejecutar después de schema.sql
-- =============================================================

PRAGMA foreign_keys = ON;

INSERT INTO usuario (nombre, email, area, rol) VALUES
    ('Ana Torres',      'ana.torres@empresa.cl',      'Finanzas',        'SOLICITANTE'),
    ('Bruno Díaz',      'bruno.diaz@empresa.cl',      'Recursos Humanos','SOLICITANTE'),
    ('Carla Muñoz',     'carla.munoz@empresa.cl',     'Ventas',          'SOLICITANTE'),
    ('Diego Rojas',     'diego.rojas@empresa.cl',     'TI',              'TECNICO'),
    ('Elena Soto',      'elena.soto@empresa.cl',      'TI',              'TECNICO'),
    ('Felipe Vargas',   'felipe.vargas@empresa.cl',   'TI',              'ADMIN');

INSERT INTO categoria (nombre, descripcion) VALUES
    ('Hardware',    'Equipos, monitores, teclados, periféricos'),
    ('Software',    'Instalación, errores o licencias de programas'),
    ('Red',         'Internet, WiFi, VPN, cableado'),
    ('Accesos',     'Cuentas, contraseñas y permisos'),
    ('Impresoras',  'Impresión, escáner, tóner'),
    ('Otro',        'Solicitudes no clasificadas');

-- Tickets en distintos estados para probar listado, filtros y resumen
INSERT INTO ticket (titulo, descripcion, solicitante_id, categoria_id, prioridad, estado, responsable_id, fecha_creacion) VALUES
    ('Notebook no enciende',          'El notebook no enciende desde esta mañana, la luz de carga parpadea.',  1, 1, 'Alta',    'Nuevo',      NULL, '2026-09-24 09:12:00'),
    ('Sin acceso a la VPN',           'Al conectar la VPN desde casa aparece error de autenticación.',          2, 3, 'Crítica', 'En proceso', 4,    '2026-09-24 10:05:00'),
    ('Instalar Excel en equipo nuevo','Necesito Excel instalado en el equipo asignado la semana pasada.',       3, 2, 'Media',   'Resuelto',   5,    '2026-09-24 11:30:00'),
    ('Impresora del 2° piso atascada','La impresora del segundo piso atasca todas las hojas.',                  1, 5, 'Baja',    'Cerrado',    4,    '2026-09-25 08:45:00'),
    ('Restablecer contraseña de ERP', 'Olvidé mi contraseña del ERP y quedó bloqueada la cuenta.',              3, 4, 'Alta',    'En proceso', 5,    '2026-09-25 14:20:00'),
    ('WiFi lento en sala de reuniones','La conexión WiFi en la sala de reuniones es muy lenta.',                2, 3, 'Media',   'Nuevo',      NULL, '2026-09-26 16:00:00');

UPDATE ticket SET fecha_cierre = '2026-09-25 12:00:00' WHERE estado = 'Cerrado';

INSERT INTO historial_ticket (ticket_id, usuario_id, campo, valor_anterior, valor_nuevo, comentario, fecha) VALUES
    (1, 1, 'creacion',    NULL,          'Nuevo',        'Ticket creado',                 '2026-09-24 09:12:00'),
    (2, 2, 'creacion',    NULL,          'Nuevo',        'Ticket creado',                 '2026-09-24 10:05:00'),
    (2, 6, 'responsable', NULL,          'Diego Rojas',  'Asignado por coordinador',      '2026-09-24 10:20:00'),
    (2, 4, 'estado',      'Nuevo',       'En proceso',   'Revisando credenciales',        '2026-09-24 10:30:00'),
    (3, 3, 'creacion',    NULL,          'Nuevo',        'Ticket creado',                 '2026-09-24 11:30:00'),
    (3, 6, 'responsable', NULL,          'Elena Soto',   NULL,                            '2026-09-24 11:45:00'),
    (3, 5, 'estado',      'Nuevo',       'En proceso',   NULL,                            '2026-09-24 12:00:00'),
    (3, 5, 'estado',      'En proceso',  'Resuelto',     'Excel instalado y activado',    '2026-09-24 15:10:00'),
    (4, 1, 'creacion',    NULL,          'Nuevo',        'Ticket creado',                 '2026-09-25 08:45:00'),
    (4, 6, 'responsable', NULL,          'Diego Rojas',  NULL,                            '2026-09-25 09:00:00'),
    (4, 4, 'estado',      'Nuevo',       'En proceso',   NULL,                            '2026-09-25 09:05:00'),
    (4, 4, 'estado',      'En proceso',  'Resuelto',     'Se retiró papel atascado',      '2026-09-25 11:30:00'),
    (4, 1, 'estado',      'Resuelto',    'Cerrado',      'Solicitante confirma solución', '2026-09-25 12:00:00'),
    (5, 3, 'creacion',    NULL,          'Nuevo',        'Ticket creado',                 '2026-09-25 14:20:00'),
    (5, 6, 'responsable', NULL,          'Elena Soto',   NULL,                            '2026-09-25 14:30:00'),
    (5, 5, 'estado',      'Nuevo',       'En proceso',   NULL,                            '2026-09-25 14:35:00'),
    (6, 2, 'creacion',    NULL,          'Nuevo',        'Ticket creado',                 '2026-09-26 16:00:00');

-- La fecha de actualización corresponde al último movimiento del historial
UPDATE ticket
SET fecha_actualizacion = COALESCE(
    (SELECT MAX(h.fecha) FROM historial_ticket h WHERE h.ticket_id = ticket.id),
    fecha_creacion);
