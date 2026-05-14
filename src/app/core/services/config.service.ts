import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  /** Tiempo máximo permitido en zona (minutos) — demo fijo 4 */
  readonly tiempoMaxMinutos = signal(4);

  readonly camaraNorteActiva = signal(true);
  readonly camaraSurActiva = signal(true);

  /** 0–100 según ajuste del puesto */
  readonly sensibilidadIa = signal(72);

  readonly notificacionesActivas = signal(true);

  setSensibilidad(v: number): void {
    this.sensibilidadIa.set(Math.min(100, Math.max(0, Math.round(v))));
  }
}
