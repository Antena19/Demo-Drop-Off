export interface ApoderadoRegistro {
  id: string;
  nombre: string;
  rut: string;
  estudiante: string;
  curso: string;
  correo: string;
  patente: string;
}

/** Estados posibles en tabla de monitoreo */
export type EstadoVehiculo =
  | 'normal'
  | 'alerta'
  | 'infraccion'
  | 'pendiente-validacion'
  | 'lectura-parcial'
  | 'no-reconocida';

export interface VehiculoEnDropOff {
  id: string;
  patente: string;
  apoderado: string;
  horaIngreso: Date;
  segundosDetenido: number;
  estado: EstadoVehiculo;
  camara: 'Cámara Norte' | 'Cámara Sur';
  /** Captura o clip asociado al evento (almacenamiento temporal hasta validación). */
  evidenciaId?: string;
  /** Patente no en base: no infracción ni notificación automática hasta validación manual. */
  requiereValidacionPatente?: boolean;
}

export interface InfraccionHistorial {
  id: string;
  fecha: Date;
  patente: string;
  apoderado: string;
  tiempoExcedidoSeg: number;
  estadoNotificacion: 'Enviada' | 'Pendiente' | 'Fallida';
  camara: string;
}

export type TipoNotificacion = 'correo' | 'sms' | 'admin';

export interface NotificacionItem {
  id: string;
  fecha: Date;
  tipo: TipoNotificacion;
  titulo: string;
  descripcion: string;
}

/** Escenarios operativos (solo frontend) */
export type EscenarioOperativo =
  | 'normal'
  | 'unknownPlate'
  | 'rain'
  | 'fog'
  | 'night'
  | 'networkDown'
  | 'cameraOffline'
  | 'traffic';

/** Banda de estado general (colores UI) */
export type BandaEstadoSistema = 'operativo' | 'monitoreo' | 'advertencia' | 'error';

export type FiltroHistorial = 'hoy' | 'semana' | 'todas';

/** Historial unificado de eventos operacionales para la demo */
export interface EventoOperacional {
  id: string;
  fecha: Date;
  tipoEvento: string;
  camara: string;
  patente: string;
  estado: string;
  observacion: string;
}

/** Nivel para UI del catálogo (colores: verde / azul / amarillo / rojo) */
export type NivelRespuestaOperativa = 'normal' | 'informacion' | 'advertencia' | 'critico';

/** Definición de respuesta operativa en vida real vs. acción del sistema */
export interface EventoOperacionalCatalogo {
  id: string;
  eventoDetectado: string;
  nivel: NivelRespuestaOperativa;
  accionSistema: string;
  accionReal: string;
  responsable: string;
  estado: string;
  observacion: string;
}
