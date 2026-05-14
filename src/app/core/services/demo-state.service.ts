import { Injectable, computed, inject, signal } from '@angular/core';
import type {
  ApoderadoRegistro,
  BandaEstadoSistema,
  EscenarioOperativo,
  EstadoVehiculo,
  EventoOperacional,
  InfraccionHistorial,
  NotificacionItem,
  VehiculoEnDropOff,
} from '../models/demo.models';
import {
  MOCK_APODERADOS,
  MOCK_EVENTOS_OPERACIONALES,
  MOCK_INFRACCIONES,
  MOCK_INFRACCIONES_POR_HORA,
  MOCK_NOTIFICACIONES,
} from '../data/mock-seed';
import { ConfigService } from './config.service';
import { ToastService } from './toast.service';

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function patentesConocidas(apoderados: ApoderadoRegistro[]): Set<string> {
  return new Set(apoderados.map((a) => a.patente.toUpperCase()));
}

function generarPatenteAleatoria(): string {
  const letras = 'BCDFGHJKLMNPQRSTVWXYZ';
  const nums = '0123456789';
  let p = '';
  for (let i = 0; i < 4; i++) p += letras[Math.floor(Math.random() * letras.length)];
  for (let i = 0; i < 2; i++) p += nums[Math.floor(Math.random() * nums.length)];
  return p;
}

function patenteNoRegistrada(known: Set<string>): string {
  for (let i = 0; i < 40; i++) {
    const p = generarPatenteAleatoria();
    if (!known.has(p)) return p;
  }
  return 'XX99ZZ';
}

/** Referencia de evidencia en cola temporal hasta validación de operaciones. */
function nuevaReferenciaEvidencia(): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = (d.getMonth() + 1).toString().padStart(2, '0');
  const da = d.getDate().toString().padStart(2, '0');
  const h = d.getHours().toString().padStart(2, '0');
  const mi = d.getMinutes().toString().padStart(2, '0');
  const s = d.getSeconds().toString().padStart(2, '0');
  const suf = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `EVD-${y}${mo}${da}-${h}${mi}${s}-${suf}`;
}

@Injectable({ providedIn: 'root' })
export class DemoStateService {
  private readonly config = inject(ConfigService);
  private readonly toast = inject(ToastService);

  readonly apoderados = signal<ApoderadoRegistro[]>([...MOCK_APODERADOS]);
  readonly historialInfracciones = signal<InfraccionHistorial[]>([...MOCK_INFRACCIONES]);
  readonly notificaciones = signal<NotificacionItem[]>([...MOCK_NOTIFICACIONES]);
  readonly eventosOperacionales = signal<EventoOperacional[]>([...MOCK_EVENTOS_OPERACIONALES]);

  readonly vehiculosLive = signal<VehiculoEnDropOff[]>([]);

  readonly vehiculosMonitoreadosHoy = signal(148);
  readonly notificacionesEnviadas = signal(36);
  readonly conexionEstable = signal(true);

  /** Escenario de simulación activo (solo UI / lógica demo) */
  readonly escenario = signal<EscenarioOperativo>('normal');

  /** Mensajes contextuales del escenario (alertas amarillas, etc.) */
  readonly alertasEscenario = signal<string[]>([]);

  private cameraOfflineLado: 'norte' | 'sur' = 'norte';
  private tickCount = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    const ap = MOCK_APODERADOS[0];
    this.vehiculosLive.set([
      {
        id: uid('v_seed'),
        patente: ap.patente,
        apoderado: ap.nombre,
        horaIngreso: new Date(Date.now() - 3 * 60 * 1000),
        segundosDetenido: 185,
        estado: 'alerta',
        camara: 'Cámara Norte',
      },
    ]);
    this.startClock();
  }

  private startClock(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  private tick(): void {
    if (this.escenario() === 'networkDown') return;

    this.tickCount++;
    const maxSeg = this.config.tiempoMaxMinutos() * 60;
    const alertaDesde = Math.max(60, maxSeg - 60);
    const sc = this.escenario();

    this.vehiculosLive.update((lista) =>
      lista.map((v) => {
        let seg = v.segundosDetenido + 1;
        if (sc === 'traffic' && Math.random() < 0.1) {
          seg += 5;
        }

        // Patente no registrada: solo acumula permanencia y evidencia temporal;
        // no pasa a alerta/infracción ni dispara notificaciones hasta validación manual.
        if (v.estado === 'pendiente-validacion') {
          return { ...v, segundosDetenido: seg, estado: 'pendiente-validacion' as EstadoVehiculo };
        }

        let estado: EstadoVehiculo;
        if (seg >= maxSeg) estado = 'infraccion';
        else if (seg >= alertaDesde) estado = 'alerta';
        else {
          estado =
            v.estado === 'lectura-parcial'
              ? 'lectura-parcial'
              : v.estado === 'no-reconocida'
                ? 'no-reconocida'
                : 'normal';
          if (sc === 'rain' && this.tickCount % 11 === 0 && Math.random() < 0.08 && estado === 'normal') {
            estado = 'lectura-parcial';
          }
          if (
            sc === 'fog' &&
            this.tickCount % 9 === 0 &&
            Math.random() < 0.12 &&
            (estado === 'normal' || estado === 'lectura-parcial')
          ) {
            estado = 'no-reconocida';
          }
        }

        let apoderado = v.apoderado;
        if (estado === 'no-reconocida') apoderado = '—';

        const next: VehiculoEnDropOff = { ...v, segundosDetenido: seg, estado, apoderado };

        if (estado === 'infraccion' && v.estado !== 'infraccion') {
          this.registrarInfraccionPorTiempo(next, maxSeg);
        }

        return next;
      }),
    );
  }

  private registrarInfraccionPorTiempo(v: VehiculoEnDropOff, maxSeg: number): void {
    if (v.requiereValidacionPatente) return;
    const exceso = Math.max(0, v.segundosDetenido - maxSeg);
    const inf: InfraccionHistorial = {
      id: uid('inf'),
      fecha: new Date(),
      patente: v.patente,
      apoderado: v.apoderado,
      tiempoExcedidoSeg: exceso || 1,
      estadoNotificacion: this.config.notificacionesActivas() ? 'Enviada' : 'Pendiente',
      camara: v.camara,
    };
    this.historialInfracciones.update((h) => [inf, ...h]);
    this.registrarEventoOperacional({
      tipoEvento: 'Infracción',
      camara: v.camara,
      patente: v.patente,
      estado: 'Registrado',
      observacion: `Tiempo máximo de permanencia excedido (${Math.round(exceso)} s sobre el umbral).`,
    });

    if (this.config.notificacionesActivas()) {
      this.notificacionesEnviadas.update((n) => n + 1);
      const n1: NotificacionItem = {
        id: uid('n'),
        fecha: new Date(),
        tipo: 'correo',
        titulo: 'Correo enviado',
        descripcion: `Infracción por tiempo excedido (${v.patente}) — notificación automática.`,
      };
      const n2: NotificacionItem = {
        id: uid('n'),
        fecha: new Date(),
        tipo: 'sms',
        titulo: 'SMS enviado',
        descripcion: `Alerta SMS al apoderado asociado a ${v.patente}.`,
      };
      this.notificaciones.update((list) => [n2, n1, ...list]);
      this.toast.show(`Infracción: ${v.patente} superó el tiempo permitido`, 'danger');
    } else {
      this.toast.show(`Infracción detectada (${v.patente}) — notificaciones desactivadas`, 'warn');
    }
  }

  private registrarEventoOperacional(p: Omit<EventoOperacional, 'id' | 'fecha'>): void {
    const row: EventoOperacional = {
      id: uid('ev'),
      fecha: new Date(),
      ...p,
    };
    this.eventosOperacionales.update((e) => [row, ...e].slice(0, 200));
  }

  /** Vehículo con patente no cargada en el colegio; queda en cola hasta identificar en puesto. */
  private agregarVehiculoPatentePendienteValidacion(mostrarToast: boolean): void {
    const known = patentesConocidas(this.apoderados());
    const pat = patenteNoRegistrada(known);
    const camara: VehiculoEnDropOff['camara'] =
      Math.random() > 0.5 ? 'Cámara Norte' : 'Cámara Sur';
    const evidenciaId = nuevaReferenciaEvidencia();
    const v: VehiculoEnDropOff = {
      id: uid('v'),
      patente: pat,
      apoderado: 'No registrado',
      horaIngreso: new Date(),
      segundosDetenido: 0,
      estado: 'pendiente-validacion',
      camara,
      evidenciaId,
      requiereValidacionPatente: true,
    };
    this.vehiculosLive.update((l) => [...l, v]);
    this.vehiculosMonitoreadosHoy.update((n) => n + 1);
    this.registrarEventoOperacional({
      tipoEvento: 'Patente no registrada',
      camara,
      patente: pat,
      estado: 'Pendiente de validación',
      observacion: `Captura ${evidenciaId}. A la espera de identificación en puesto.`,
    });
    if (mostrarToast) {
      this.toast.show(`Patente ${pat}: pendiente de identificación`, 'warn');
    }
  }

  /** Indicador de precisión IA (0–100) según condiciones operativas */
  readonly precisionIa = computed(() => {
    switch (this.escenario()) {
      case 'rain':
        return 62;
      case 'fog':
        return 48;
      case 'night':
        return 74;
      case 'traffic':
        return 68;
      case 'networkDown':
        return 0;
      case 'cameraOffline':
        return 71;
      case 'unknownPlate':
        return 81;
      default:
        return 92;
    }
  });

  readonly bandaEstado = computed<BandaEstadoSistema>(() => {
    if (this.escenario() === 'networkDown') return 'error';
    if (this.vehiculosLive().some((v) => v.estado === 'infraccion')) return 'advertencia';
    const sc = this.escenario();
    if (sc !== 'normal') return 'advertencia';
    if (this.vehiculosLive().length > 0) return 'monitoreo';
    return 'operativo';
  });

  readonly tituloBandaEstado = computed(() => {
    if (this.escenario() === 'networkDown') {
      return 'Falla de conexión';
    }
    if (this.vehiculosLive().some((v) => v.estado === 'infraccion')) {
      return 'Infracción en zona';
    }
    const sc = this.escenario();
    if (sc === 'rain') return 'Advertencia: lluvia';
    if (sc === 'fog') return 'Advertencia: baja visibilidad';
    if (sc === 'night') return 'Modo nocturno activo';
    if (sc === 'traffic') return 'Alto flujo vehicular';
    if (sc === 'unknownPlate') return 'Patente sin registrar en el colegio';
    if (sc === 'cameraOffline') {
      return this.cameraOfflineLado === 'norte'
        ? 'Cámara Norte desconectada'
        : 'Cámara Sur desconectada';
    }
    if (this.vehiculosLive().length > 0) return 'Monitoreando área Drop Off';
    return 'Sistema operativo';
  });

  readonly subtituloBandaEstado = computed(() => {
    if (this.escenario() === 'networkDown') {
      return 'Sin conexión con el servidor. Intentando reconectar…';
    }
    if (this.escenario() === 'rain') {
      return 'Condiciones meteorológicas adversas: menor confianza en lecturas automáticas.';
    }
    if (this.escenario() === 'fog') {
      return 'Baja visibilidad: cámaras operativas con advertencia; revisar lecturas dudosas.';
    }
    if (this.escenario() === 'night') {
      return 'Iluminación reducida: monitoreo activo con compensación nocturna.';
    }
    if (this.escenario() === 'traffic') {
      return 'Congestión en zona: varios vehículos cercanos al tiempo máximo permitido.';
    }
    if (this.escenario() === 'unknownPlate') {
      return 'Indique en la tabla quién es el apoderado; no enviamos avisos hasta que confirme.';
    }
    return '';
  });

  readonly estadoCamaraNorteEtiqueta = computed(() => {
    if (!this.config.camaraNorteActiva()) return 'Offline';
    if (this.escenario() === 'fog') return 'Operativa con advertencia';
    if (this.escenario() === 'networkDown') return 'Sin enlace';
    return 'En línea';
  });

  readonly estadoCamaraSurEtiqueta = computed(() => {
    if (!this.config.camaraSurActiva()) return 'Offline';
    if (this.escenario() === 'fog') return 'Operativa con advertencia';
    if (this.escenario() === 'networkDown') return 'Sin enlace';
    return 'En línea';
  });

  readonly camarasActivasCount = computed(() => {
    let n = 0;
    if (this.config.camaraNorteActiva()) n++;
    if (this.config.camaraSurActiva()) n++;
    return n;
  });

  readonly infraccionesDetectadas = computed(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return this.historialInfracciones().filter((i) => i.fecha >= hoy).length;
  });

  readonly infraccionesPorHora = signal<number[]>([...MOCK_INFRACCIONES_POR_HORA]);

  /** Aplica escenario desde el panel de Monitoreo */
  aplicarEscenario(e: EscenarioOperativo | 'reset'): void {
    if (e === 'reset') {
      this.restablecerSistemaOperacional();
      return;
    }

    this.escenario.set(e);
    this.alertasEscenario.set([]);

    if (e !== 'cameraOffline') {
      this.config.camaraNorteActiva.set(true);
      this.config.camaraSurActiva.set(true);
    }
    if (e !== 'networkDown') {
      this.conexionEstable.set(true);
    }

    switch (e) {
      case 'normal': {
        this.toast.show('Operación normal', 'ok');
        break;
      }
      case 'unknownPlate': {
        this.alertasEscenario.set([]);
        this.agregarVehiculoPatentePendienteValidacion(true);
        break;
      }
      case 'rain': {
        this.alertasEscenario.set([
          'Visibilidad reducida por lluvia.',
          'El sistema muestra advertencia y puede marcar lecturas como parciales; conviene reforzar supervisión del canal.',
        ]);
        this.registrarEventoOperacional({
          tipoEvento: 'Lluvia intensa',
          camara: 'Ambas',
          patente: '—',
          estado: 'Advertencia activa',
          observacion: 'Baja visibilidad; revisar precisión de detección según protocolo.',
        });
        this.toast.show('Advertencia: lluvia intensa', 'info');
        break;
      }
      case 'fog': {
        this.alertasEscenario.set([
          'Baja visibilidad detectada.',
          'El sistema evita infracción automática si la patente no se reconoce con suficiente confianza; operaciones debe revisar eventos dudosos.',
        ]);
        this.registrarEventoOperacional({
          tipoEvento: 'Baja visibilidad',
          camara: 'Ambas',
          patente: '—',
          estado: 'Advertencia activa',
          observacion: 'Condiciones de niebla o bruma; priorizar revisión manual de lecturas.',
        });
        this.toast.show('Advertencia: niebla / baja visibilidad', 'info');
        break;
      }
      case 'night': {
        this.alertasEscenario.set([
          'Modo nocturno activo.',
          'El sistema aplica compensación visual y advierte por baja iluminación; el monitoreo sigue activo.',
        ]);
        this.toast.show('Modo nocturno activado', 'info');
        break;
      }
      case 'networkDown': {
        this.conexionEstable.set(false);
        this.alertasEscenario.set([
          'Sin conexión con el servidor. Intentando reconectar…',
          'No se generan nuevas notificaciones mientras dure el evento.',
        ]);
        this.registrarEventoOperacional({
          tipoEvento: 'Caída de red',
          camara: 'Sistema',
          patente: '—',
          estado: 'Contingencia',
          observacion: 'Pausa de notificaciones automáticas; sincronizar al restablecer conectividad.',
        });
        this.toast.show('Alerta: caída de red', 'danger');
        break;
      }
      case 'cameraOffline': {
        this.cameraOfflineLado = Math.random() > 0.5 ? 'norte' : 'sur';
        if (this.cameraOfflineLado === 'norte') {
          this.config.camaraNorteActiva.set(false);
          this.config.camaraSurActiva.set(true);
        } else {
          this.config.camaraNorteActiva.set(true);
          this.config.camaraSurActiva.set(false);
        }
        const nombreCam = this.cameraOfflineLado === 'norte' ? 'Cámara Norte' : 'Cámara Sur';
        this.alertasEscenario.set([
          `${nombreCam}: señal no disponible.`,
          'El sistema marca el canal como offline y continúa con la cámara restante. Verificar energía, cableado y red en el punto de instalación; escalar a soporte técnico si persiste.',
        ]);
        this.registrarEventoOperacional({
          tipoEvento: 'Cámara desconectada',
          camara: nombreCam,
          patente: '—',
          estado: 'Canal offline',
          observacion: 'Pérdida de cobertura en un sector del Drop Off hasta recuperar la señal.',
        });
        this.toast.show(`Alerta: ${nombreCam} sin señal`, 'warn');
        break;
      }
      case 'traffic': {
        this.alertasEscenario.set([
          'Alto flujo vehicular en zona Drop Off.',
          'El sistema resalta vehículos cercanos al tiempo máximo; operaciones debe reforzar orden y descongestión en terreno.',
        ]);
        this.agregarCongestionSimulada();
        this.registrarEventoOperacional({
          tipoEvento: 'Congestión vehicular',
          camara: 'Ambas',
          patente: 'Varias',
          estado: 'Advertencia activa',
          observacion: 'Incremento de permanencias; priorizar apoyo presencial.',
        });
        this.toast.show('Advertencia: alto flujo vehicular', 'warn');
        break;
      }
    }
  }

  private agregarCongestionSimulada(): void {
    const aps = this.apoderados();
    if (!aps.length) return;
    const maxSeg = this.config.tiempoMaxMinutos() * 60;
    const nuevos: VehiculoEnDropOff[] = [];
    for (let i = 0; i < 5; i++) {
      const ap = aps[i % aps.length];
      const camara: VehiculoEnDropOff['camara'] = i % 2 === 0 ? 'Cámara Norte' : 'Cámara Sur';
      const base = maxSeg - 75 + i * 12;
      nuevos.push({
        id: uid('v_cong'),
        patente: `${ap.patente.slice(0, 4)}${i}${Math.floor(Math.random() * 9)}`,
        apoderado: ap.nombre,
        horaIngreso: new Date(Date.now() - (maxSeg - base) * 1000),
        segundosDetenido: Math.max(120, base),
        estado: base >= maxSeg - 60 ? 'alerta' : 'normal',
        camara,
      });
    }
    this.vehiculosLive.update((l) => [...l, ...nuevos]);
    this.vehiculosMonitoreadosHoy.update((n) => n + nuevos.length);
  }

  restablecerSistemaOperacional(): void {
    this.escenario.set('normal');
    this.alertasEscenario.set([]);
    this.config.camaraNorteActiva.set(true);
    this.config.camaraSurActiva.set(true);
    this.conexionEstable.set(true);
    const ap = MOCK_APODERADOS[0];
    this.vehiculosLive.set([
      {
        id: uid('v_seed'),
        patente: ap.patente,
        apoderado: ap.nombre,
        horaIngreso: new Date(Date.now() - 2 * 60 * 1000),
        segundosDetenido: 120,
        estado: 'normal',
        camara: 'Cámara Norte',
      },
    ]);
    this.registrarEventoOperacional({
      tipoEvento: 'Restablecimiento',
      camara: 'Sistema',
      patente: '—',
      estado: 'Operativo',
      observacion: 'Parámetros y canales restablecidos a operación estándar.',
    });
    this.toast.show('Sistema restablecido', 'ok');
  }

  simularIngresoVehiculo(): void {
    const known = patentesConocidas(this.apoderados());
    const sc = this.escenario();

    if (sc === 'unknownPlate') {
      this.alertasEscenario.set([]);
      this.agregarVehiculoPatentePendienteValidacion(true);
      return;
    }

    const ap = this.apoderados()[Math.floor(Math.random() * this.apoderados().length)];
    if (!ap) return;
    const camara: VehiculoEnDropOff['camara'] =
      Math.random() > 0.5 ? 'Cámara Norte' : 'Cámara Sur';
    const v: VehiculoEnDropOff = {
      id: uid('v'),
      patente: ap.patente,
      apoderado: ap.nombre,
      horaIngreso: new Date(),
      segundosDetenido: 0,
      estado: 'normal',
      camara,
    };
    this.vehiculosLive.update((l) => [...l, v]);
    this.vehiculosMonitoreadosHoy.update((n) => n + 1);
    this.toast.show(`Ingreso registrado: ${ap.patente} (${camara})`, 'ok');
  }

  simularSalidaVehiculo(): void {
    const lista = this.vehiculosLive();
    if (!lista.length) {
      this.toast.show('No hay vehículos en zona para retirar', 'info');
      return;
    }
    const out = lista[lista.length - 1];
    this.vehiculosLive.update((l) => l.filter((x) => x.id !== out.id));
    this.toast.show(`Salida registrada: ${out.patente}`, 'info');
  }

  simularInfraccionManual(): void {
    if (this.escenario() === 'networkDown') {
      this.toast.show('Sin conexión: no se registra infracción manual', 'warn');
      return;
    }
    const ap = this.apoderados()[Math.floor(Math.random() * this.apoderados().length)];
    if (!ap) return;
    const maxSeg = this.config.tiempoMaxMinutos() * 60;
    const inf: InfraccionHistorial = {
      id: uid('inf'),
      fecha: new Date(),
      patente: ap.patente,
      apoderado: ap.nombre,
      tiempoExcedidoSeg: 120,
      estadoNotificacion: 'Enviada',
      camara: 'Cámara Sur',
    };
    this.historialInfracciones.update((h) => [inf, ...h]);
    this.infraccionesPorHora.update((arr) => {
      const copy = [...arr];
      const i = Math.min(copy.length - 1, Math.floor(Math.random() * copy.length));
      copy[i] = (copy[i] ?? 0) + 1;
      return copy;
    });
    this.registrarEventoOperacional({
      tipoEvento: 'Infracción',
      camara: 'Cámara Sur',
      patente: ap.patente,
      estado: 'Registro manual',
      observacion: 'Ingreso forzado desde puesto de monitoreo para prueba o auditoría.',
    });
    this.toast.show(`Infracción registrada manualmente (${ap.patente})`, 'danger');

    const n: NotificacionItem = {
      id: uid('n'),
      fecha: new Date(),
      tipo: 'admin',
      titulo: 'Alerta administrativa',
      descripcion: `Infracción registrada manualmente — ${ap.patente}. Revisar y confirmar aviso al apoderado.`,
    };
    this.notificaciones.update((list) => [n, ...list]);
    this.notificacionesEnviadas.update((x) => x + 1);

    this.vehiculosLive.update((lista) =>
      lista.map((v) =>
        v.patente === ap.patente
          ? { ...v, segundosDetenido: maxSeg + 30, estado: 'infraccion' as EstadoVehiculo }
          : v,
      ),
    );
  }

  reiniciarSimulacion(): void {
    this.restablecerSistemaOperacional();
  }

  /**
   * Asocia un vehículo en «pendiente de validación» con un apoderado.
   * Opcionalmente actualiza la patente en la ficha del apoderado para próximos ingresos.
   */
  vincularApoderadoVehiculoPendiente(
    vehiculoId: string,
    apoderadoId: string,
    guardarPatenteEnFicha: boolean,
  ): boolean {
    const lista = this.vehiculosLive();
    const v = lista.find((x) => x.id === vehiculoId);
    if (!v?.requiereValidacionPatente) {
      this.toast.show('Ese vehículo ya fue identificado o no requiere confirmación', 'info');
      return false;
    }
    const ap = this.apoderados().find((a) => a.id === apoderadoId);
    if (!ap) {
      this.toast.show('Seleccione un apoderado de la lista', 'warn');
      return false;
    }

    const patNorm = v.patente.toUpperCase();
    if (guardarPatenteEnFicha) {
      this.apoderados.update((aps) =>
        aps.map((a) => (a.id === apoderadoId ? { ...a, patente: patNorm } : a)),
      );
    }

    const maxSeg = this.config.tiempoMaxMinutos() * 60;
    const alertaDesde = Math.max(60, maxSeg - 60);
    let nuevoEstado: EstadoVehiculo = 'normal';
    if (v.segundosDetenido >= maxSeg) nuevoEstado = 'infraccion';
    else if (v.segundosDetenido >= alertaDesde) nuevoEstado = 'alerta';

    this.vehiculosLive.update((lst) =>
      lst.map((x) =>
        x.id === vehiculoId
          ? {
              ...x,
              apoderado: ap.nombre,
              patente: patNorm,
              requiereValidacionPatente: false,
              estado: nuevoEstado,
            }
          : x,
      ),
    );

    if (nuevoEstado === 'infraccion') {
      const actualizado = this.vehiculosLive().find((x) => x.id === vehiculoId);
      if (actualizado) this.registrarInfraccionPorTiempo(actualizado, maxSeg);
    } else {
      this.toast.show(`Listo: ${patNorm} quedó a nombre de ${ap.nombre}`, 'ok');
    }

    this.registrarEventoOperacional({
      tipoEvento: 'Patente identificada',
      camara: v.camara,
      patente: patNorm,
      estado: 'Confirmado en puesto',
      observacion: `Asociado a ${ap.nombre}${guardarPatenteEnFicha ? '; patente guardada en la ficha.' : '; solo para este ingreso.'}`,
    });
    return true;
  }

  agregarApoderado(data: Omit<ApoderadoRegistro, 'id'>): void {
    const row: ApoderadoRegistro = { ...data, id: uid('ap') };
    this.apoderados.update((a) => [...a, row]);
    this.toast.show('Apoderado agregado', 'ok');
  }

  editarApoderado(row: ApoderadoRegistro): void {
    this.apoderados.update((a) => a.map((x) => (x.id === row.id ? { ...row } : x)));
    this.toast.show('Registro actualizado', 'ok');
  }

  eliminarApoderado(id: string): void {
    this.apoderados.update((a) => a.filter((x) => x.id !== id));
    this.toast.show('Registro eliminado', 'info');
  }

  /** Clases CSS para el contenedor de video (Monitoreo) */
  clasesVideoGlobal(): string {
    const s = this.escenario();
    const c: string[] = [];
    if (s === 'rain') c.push('rain-mode');
    if (s === 'fog') c.push('fog-mode');
    if (s === 'night') c.push('night-mode');
    return c.join(' ');
  }
}
