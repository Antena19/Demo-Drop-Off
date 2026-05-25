import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { BandaEstadoSistema, EscenarioOperativo, VehiculoEnDropOff } from '../../core/models/demo.models';
import { DemoStateService } from '../../core/services/demo-state.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-monitoreo',
  imports: [DatePipe, NgClass, FormsModule, RouterLink],
  templateUrl: './monitoreo.component.html',
  styleUrl: './monitoreo.component.scss',
})
export class MonitoreoComponent {
  readonly demo = inject(DemoStateService);
  readonly config = inject(ConfigService);

  readonly videoNorteSrc = 'videos/camaras/camaraNorte.mp4';
  readonly videoSurSrc = 'videos/camaras/camaraSur.mp4';

  readonly errorVideoNorte = signal(false);
  readonly errorVideoSur = signal(false);

  readonly hayInfraccion = computed(() =>
    this.demo.vehiculosLive().some((v) => v.estado === 'infraccion'),
  );

  readonly vehiculosPendientesIdentificar = computed(() =>
    this.demo.vehiculosLive().filter((v) => v.requiereValidacionPatente),
  );

  /** Selección por fila para vincular patente pendiente con apoderado */
  elegidoApoderadoPorVehiculo: Record<string, string> = {};
  guardarPatentePorVehiculo: Record<string, boolean> = {};

  escenarios: { id: EscenarioOperativo | 'reset'; label: string }[] = [
    { id: 'normal', label: '1. Operación normal' },
    { id: 'unknownPlate', label: '2. Patente sin registrar' },
    { id: 'rain', label: '3. Lluvia intensa' },
    { id: 'fog', label: '4. Niebla / baja visibilidad' },
    { id: 'night', label: '5. Modo nocturno' },
    { id: 'networkDown', label: '6. Caída de red' },
    { id: 'cameraOffline', label: '7. Cámara desconectada' },
    { id: 'traffic', label: '8. Congestión vehicular' },
    { id: 'reset', label: '9. Restablecer sistema' },
  ];

  escenarioSeleccionado: EscenarioOperativo | 'reset' = 'normal';

  wrapperVideo(lado: 'norte' | 'sur'): string {
    const base = this.demo.clasesVideoGlobal().trim();
    const online =
      lado === 'norte'
        ? this.config.camaraNorteActiva() && !this.errorVideoNorte()
        : this.config.camaraSurActiva() && !this.errorVideoSur();
    const parts = [base, online ? '' : 'offline-mode'].filter(Boolean);
    return parts.join(' ');
  }

  bandaClase(b: BandaEstadoSistema): string {
    switch (b) {
      case 'error':
        return 'border-rose-300 bg-rose-600 text-white';
      case 'advertencia':
        return 'border-amber-300 bg-amber-100 text-amber-950';
      case 'monitoreo':
        return 'border-sky-300 bg-sky-600 text-white';
      default:
        return 'border-emerald-300 bg-emerald-100 text-emerald-950';
    }
  }

  aplicarEscenarioSeleccionado(): void {
    this.demo.aplicarEscenario(this.escenarioSeleccionado);
  }

  onErrorVideoNorte(): void {
    this.errorVideoNorte.set(true);
  }

  onErrorVideoSur(): void {
    this.errorVideoSur.set(true);
  }

  mantenerVideoNorte(ev: Event): void {
    const v = ev.target as HTMLVideoElement | null;
    if (!v) return;
    v.muted = true;
    v.loop = true;
    if (v.ended) v.currentTime = 0;
    void v.play().catch(() => {});
  }

  mantenerVideoSur(ev: Event): void {
    const v = ev.target as HTMLVideoElement | null;
    if (!v) return;
    v.muted = true;
    v.loop = true;
    if (v.ended) v.currentTime = 0;
    void v.play().catch(() => {});
  }

  guardarPatenteAlVincular(vehiculoId: string): boolean {
    return this.guardarPatentePorVehiculo[vehiculoId] !== false;
  }

  onGuardarPatenteVinculo(vehiculoId: string, ev: Event): void {
    const t = ev.target as HTMLInputElement | null;
    if (!t) return;
    this.guardarPatentePorVehiculo[vehiculoId] = t.checked;
  }

  onElegidoVehiculoChange(vehiculoId: string, ev: Event): void {
    const el = ev.target as HTMLSelectElement | null;
    if (!el) return;
    this.elegidoApoderadoPorVehiculo[vehiculoId] = el.value;
  }

  irAFilaVehiculo(vehiculoId: string): void {
    document
      .getElementById(`fila-vehiculo-${vehiculoId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  confirmarVinculo(vehiculoId: string): void {
    const apId = this.elegidoApoderadoPorVehiculo[vehiculoId] ?? '';
    const guardar = this.guardarPatenteAlVincular(vehiculoId);
    if (!this.demo.vincularApoderadoVehiculoPendiente(vehiculoId, apId, guardar)) {
      return;
    }
    delete this.elegidoApoderadoPorVehiculo[vehiculoId];
    delete this.guardarPatentePorVehiculo[vehiculoId];
  }

  filaPendienteClases(v: VehiculoEnDropOff): Record<string, boolean> {
    const p = !!v.requiereValidacionPatente;
    return {
      'bg-amber-50': p,
      'ring-2': p,
      'ring-inset': p,
      'ring-brand-400': p,
    };
  }

  formatTiempo(seg: number): string {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  badgeClass(estado: string): string {
    switch (estado) {
      case 'infraccion':
        return 'bg-rose-100 text-rose-800 ring-rose-200';
      case 'alerta':
        return 'bg-amber-100 text-amber-900 ring-amber-200';
      case 'pendiente-validacion':
        return 'bg-amber-50 text-amber-900 ring-amber-300';
      case 'lectura-parcial':
        return 'bg-sky-50 text-sky-900 ring-sky-200';
      case 'no-reconocida':
        return 'bg-slate-100 text-slate-800 ring-slate-300';
      default:
        return 'bg-emerald-100 text-emerald-800 ring-emerald-200';
    }
  }

  etiquetaEstado(estado: string): string {
    const map: Record<string, string> = {
      normal: 'Normal',
      alerta: 'Alerta',
      infraccion: 'Infracción',
      'pendiente-validacion': 'Pendiente de validación',
      'lectura-parcial': 'Lectura parcial',
      'no-reconocida': 'No reconocida',
    };
    return map[estado] ?? estado;
  }
}
