import type { EventoOperacionalCatalogo } from '../models/demo.models';

/** Catálogo: evento detectado → respuesta del sistema y acción operativa en terreno. */
export const CATALOGO_RESPUESTAS_OPERATIVAS: EventoOperacionalCatalogo[] = [
  {
    id: 'evt-01',
    eventoDetectado: 'Patente no registrada',
    nivel: 'advertencia',
    accionSistema:
      'Almacenar temporalmente el evento con evidencia, tiempo de permanencia y cámara asociada; estado «Pendiente de validación». No generar infracción ni notificación automática hasta confirmación manual de operaciones.',
    accionReal:
      'Operaciones revisa la evidencia y la permanencia, confirma o descarta el vehículo y actualiza la base de datos si corresponde.',
    responsable: 'Analista Funcional / Operaciones',
    estado: 'Pendiente de validación',
    observacion:
      'El registro queda en cola hasta validación; no se envían avisos al apoderado hasta confirmar la patente y el contexto del evento.',
  },
  {
    id: 'evt-02',
    eventoDetectado: 'Vehículo supera 4 minutos',
    nivel: 'advertencia',
    accionSistema:
      'Registrar infracción, asociar evidencia disponible (imágenes / registro de permanencia) y generar notificación según política.',
    accionReal:
      'Administración revisa el registro y confirma envío de aviso al apoderado.',
    responsable: 'Analista Funcional / Operaciones',
    estado: 'Notificado',
    observacion:
      'El umbral de tiempo (p. ej. 4 minutos) es configurable; al superarse se dispara el flujo de infracción y notificación.',
  },
  {
    id: 'evt-03',
    eventoDetectado: 'Lluvia intensa',
    nivel: 'advertencia',
    accionSistema:
      'Mostrar advertencia de baja visibilidad y marcar lecturas como parciales.',
    accionReal:
      'Revisar precisión del sistema y solicitar mantención si la condición afecta la detección.',
    responsable: 'Coordinador Técnico',
    estado: 'En monitoreo',
    observacion:
      'Se degrada la confianza de lectura automática; conviene reforzar supervisión humana del canal.',
  },
  {
    id: 'evt-04',
    eventoDetectado: 'Niebla / baja visibilidad',
    nivel: 'advertencia',
    accionSistema:
      'Mostrar advertencia y evitar infracción automática si la patente no se reconoce.',
    accionReal: 'Revisar manualmente los eventos sin evidencia suficiente.',
    responsable: 'Analista Funcional / Operaciones',
    estado: 'Revisión manual',
    observacion:
      'Las lecturas marcadas como no reconocidas requieren verificación antes de cualquier sanción automática.',
  },
  {
    id: 'evt-05',
    eventoDetectado: 'Modo nocturno',
    nivel: 'informacion',
    accionSistema:
      'Activar compensación visual nocturna y advertencia de baja iluminación en el puesto de monitoreo.',
    accionReal: 'Ajustar sensibilidad de cámara y revisar precisión.',
    responsable: 'Coordinador Técnico',
    estado: 'En monitoreo',
    observacion:
      'El monitoreo continúa; se recomienda revisión periódica de umbrales en condiciones de poca luz.',
  },
  {
    id: 'evt-06',
    eventoDetectado: 'Cámara movida o desalineada',
    nivel: 'critico',
    accionSistema:
      'Suspender detección automática de esa cámara y mostrar error.',
    accionReal:
      'Recalibrar cámara y contactar proveedor si requiere ajuste físico.',
    responsable: 'Coordinador Técnico / Proveedor Externo',
    estado: 'Escalado a soporte',
    observacion:
      'Tratar como incidente de campo: no usar lecturas de ese canal para decisiones hasta recalibración.',
  },
  {
    id: 'evt-07',
    eventoDetectado: 'Cámara desconectada',
    nivel: 'advertencia',
    accionSistema:
      'Marcar cámara como offline y continuar con cámara disponible.',
    accionReal:
      'Revisar energía, red y conexión física; escalar a proveedor si no se resuelve.',
    responsable: 'Coordinador Técnico',
    estado: 'Incidente técnico',
    observacion:
      'Se pierde cobertura en un sector del Drop Off; coordinar presencia en terreno si hay un solo canal activo.',
  },
  {
    id: 'evt-08',
    eventoDetectado: 'Caída de red',
    nivel: 'critico',
    accionSistema:
      'Pausar envío de notificaciones automáticas y mostrar estado sin conexión.',
    accionReal:
      'Revisar conectividad del colegio y sincronizar eventos cuando vuelva la red.',
    responsable: 'Coordinador Técnico',
    estado: 'En contingencia',
    observacion:
      'Los eventos locales deben conservarse para reprocesar notificaciones y validaciones al restablecer enlace.',
  },
  {
    id: 'evt-09',
    eventoDetectado: 'Base de datos no disponible',
    nivel: 'critico',
    accionSistema:
      'Registrar eventos sin validación de patente y mostrar advertencia.',
    accionReal: 'Recuperar servicio y sincronizar registros pendientes.',
    responsable: 'Desarrollador Full Stack / Coordinador Técnico',
    estado: 'En contingencia',
    observacion:
      'Operar en modo degradado: no confirmar identidades hasta que el servicio de datos vuelva a estar estable.',
  },
  {
    id: 'evt-10',
    eventoDetectado: 'Alto flujo vehicular',
    nivel: 'advertencia',
    accionSistema:
      'Mostrar alerta de congestión y resaltar vehículos cercanos a 4 minutos.',
    accionReal:
      'Administración debe apoyar presencialmente el flujo del drop off.',
    responsable: 'Analista Funcional / Operaciones',
    estado: 'En monitoreo',
    observacion:
      'Priorizar descongestión y comunicación con apoderados en el lugar para reducir excesos de permanencia.',
  },
  {
    id: 'evt-11',
    eventoDetectado: 'Fallo de notificación',
    nivel: 'advertencia',
    accionSistema: 'Marcar notificación como pendiente y reintentar envío.',
    accionReal:
      'Administración revisa notificaciones no enviadas y contacta manualmente si corresponde.',
    responsable: 'Soporte y Capacitación / Operaciones',
    estado: 'Pendiente',
    observacion:
      'Registrar causa del fallo (correo, SMS, proveedor) para evitar duplicar avisos al apoderado.',
  },
  {
    id: 'evt-12',
    eventoDetectado: 'Acceso no autorizado',
    nivel: 'critico',
    accionSistema: 'Bloquear intento de acceso y registrar evento de seguridad.',
    accionReal: 'Revisar credenciales, permisos y bitácora de accesos.',
    responsable: 'Encargado de Seguridad',
    estado: 'Bloqueado',
    observacion:
      'Conservar trazabilidad (usuario, hora, IP o terminal) para auditoría y eventual escalamiento.',
  },
];
