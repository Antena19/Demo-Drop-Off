import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import type { FiltroHistorial, InfraccionHistorial } from '../../core/models/demo.models';
import { DemoStateService } from '../../core/services/demo-state.service';

@Component({
  selector: 'app-infracciones',
  imports: [DatePipe, DecimalPipe, NgClass],
  templateUrl: './infracciones.component.html',
})
export class InfraccionesComponent {
  readonly demo = inject(DemoStateService);
  readonly filtro = signal<FiltroHistorial>('hoy');

  readonly filtradas = computed(() => {
    const list = this.demo.historialInfracciones();
    const f = this.filtro();
    const now = new Date();
    const startHoy = new Date(now);
    startHoy.setHours(0, 0, 0, 0);
    const startSemana = new Date(now);
    startSemana.setDate(now.getDate() - 7);

    return list.filter((i) => {
      if (f === 'todas') return true;
      if (f === 'hoy') return i.fecha >= startHoy;
      return i.fecha >= startSemana;
    });
  });

  setFiltro(f: FiltroHistorial): void {
    this.filtro.set(f);
  }

  badgeNotif(estado: InfraccionHistorial['estadoNotificacion']): string {
    if (estado === 'Enviada') return 'bg-emerald-100 text-emerald-800 ring-emerald-200';
    if (estado === 'Pendiente') return 'bg-amber-100 text-amber-900 ring-amber-200';
    return 'bg-rose-100 text-rose-800 ring-rose-200';
  }
}
