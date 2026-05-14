import type {
  ApoderadoRegistro,
  EventoOperacional,
  InfraccionHistorial,
  NotificacionItem,
} from '../models/demo.models';

const daysAgo = (d: number): Date => {
  const x = new Date();
  x.setDate(x.getDate() - d);
  return x;
};

export const MOCK_APODERADOS: ApoderadoRegistro[] = [
  {
    id: 'a1',
    nombre: 'María González',
    rut: '12.345.678-9',
    estudiante: 'Tomás González',
    curso: '4°B',
    correo: 'm.gonzalez@demo.cl',
    patente: 'ABCD12',
  },
  {
    id: 'a2',
    nombre: 'Carlos Pérez',
    rut: '15.987.654-3',
    estudiante: 'Isidora Pérez',
    curso: '2°A',
    correo: 'c.perez@demo.cl',
    patente: 'JKLP45',
  },
  {
    id: 'a3',
    nombre: 'Francisca Rojas',
    rut: '18.223.344-K',
    estudiante: 'Mateo Rojas',
    curso: '6°C',
    correo: 'f.rojas@demo.cl',
    patente: 'MNOP78',
  },
  {
    id: 'a4',
    nombre: 'Andrés Muñoz',
    rut: '11.009.887-1',
    estudiante: 'Antonia Muñoz',
    curso: '1°B',
    correo: 'a.munoz@demo.cl',
    patente: 'STUV90',
  },
];

export const MOCK_INFRACCIONES: InfraccionHistorial[] = [
  {
    id: 'i1',
    fecha: daysAgo(0),
    patente: 'WXYZ11',
    apoderado: 'Patricia Soto',
    tiempoExcedidoSeg: 312,
    estadoNotificacion: 'Enviada',
    camara: 'Cámara Norte',
  },
  {
    id: 'i2',
    fecha: daysAgo(2),
    patente: 'QWER22',
    apoderado: 'Luis Herrera',
    tiempoExcedidoSeg: 278,
    estadoNotificacion: 'Pendiente',
    camara: 'Cámara Sur',
  },
  {
    id: 'i3',
    fecha: daysAgo(5),
    patente: 'ASDF33',
    apoderado: 'Daniela Fuentes',
    tiempoExcedidoSeg: 410,
    estadoNotificacion: 'Enviada',
    camara: 'Cámara Norte',
  },
  {
    id: 'i4',
    fecha: daysAgo(10),
    patente: 'ZXCV44',
    apoderado: 'Rodrigo Castillo',
    tiempoExcedidoSeg: 255,
    estadoNotificacion: 'Fallida',
    camara: 'Cámara Sur',
  },
];

export const MOCK_NOTIFICACIONES: NotificacionItem[] = [
  {
    id: 'n1',
    fecha: daysAgo(0),
    tipo: 'correo',
    titulo: 'Correo enviado',
    descripcion: 'Aviso de permanencia extendida a m.gonzalez@demo.cl',
  },
  {
    id: 'n2',
    fecha: daysAgo(0),
    tipo: 'sms',
    titulo: 'SMS enviado',
    descripcion: 'Alerta rápida al apoderado patente ABCD12',
  },
  {
    id: 'n3',
    fecha: daysAgo(1),
    tipo: 'admin',
    titulo: 'Alerta administrativa',
    descripcion: 'Coordinación académica notificada por congestión sur',
  },
  {
    id: 'n4',
    fecha: daysAgo(3),
    tipo: 'correo',
    titulo: 'Correo enviado',
    descripcion: 'Resumen semanal de infracciones al equipo directivo',
  },
];

export const MOCK_EVENTOS_OPERACIONALES: EventoOperacional[] = [
  {
    id: 'e0',
    fecha: daysAgo(0),
    tipoEvento: 'Infracción',
    camara: 'Cámara Norte',
    patente: 'WXYZ11',
    estado: 'Registrado',
    observacion: 'Tiempo máximo de permanencia excedido según política del colegio.',
  },
  {
    id: 'e1',
    fecha: daysAgo(1),
    tipoEvento: 'Baja visibilidad',
    camara: 'Ambas',
    patente: '—',
    estado: 'Advertencia activa',
    observacion: 'Niebla matinal en turno de entrada; revisar lecturas en terreno.',
  },
  {
    id: 'e2',
    fecha: daysAgo(2),
    tipoEvento: 'Patente no registrada',
    camara: 'Cámara Sur',
    patente: 'ZZ99XX',
    estado: 'Pendiente de validación',
    observacion: 'Sin coincidencia en base de apoderados; pendiente validación administrativa.',
  },
];

/** Serie horaria de infracciones (08:00–15:00) para el gráfico */
export const MOCK_INFRACCIONES_POR_HORA = [1, 0, 2, 3, 5, 4, 6, 3];
