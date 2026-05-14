import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { EventoOperacional, EventoOperacionalCatalogo, NivelRespuestaOperativa } from '../../core/models/demo.models';
import { DemoStateService } from '../../core/services/demo-state.service';
import { CATALOGO_RESPUESTAS_OPERATIVAS } from '../../core/data/catalogo-respuestas-operativas';

@Component({
  selector: 'app-simulacion-operacional',
  imports: [DatePipe, NgClass, RouterLink],
  templateUrl: './simulacion-operacional.component.html',
})
export class SimulacionOperacionalComponent {
  readonly demo = inject(DemoStateService);

  readonly catalogo = CATALOGO_RESPUESTAS_OPERATIVAS;

  readonly seleccionId = signal<string>(CATALOGO_RESPUESTAS_OPERATIVAS[0]?.id ?? 'evt-01');

  readonly seleccion = computed(() => {
    const id = this.seleccionId();
    return this.catalogo.find((c) => c.id === id) ?? this.catalogo[0];
  });

  seleccionar(id: string): void {
    this.seleccionId.set(id);
  }

  seleccionarDesdeHistorial(ev: EventoOperacional): void {
    const c = this.buscarCatalogoPorTipo(ev.tipoEvento);
    if (c) this.seleccionId.set(c.id);
  }

  private buscarCatalogoPorTipo(tipo: string): EventoOperacionalCatalogo | undefined {
    const t = tipo.toLowerCase();
    if (t.includes('patente no registr')) return this.byId('evt-01');
    if (t.includes('infracción') || t.includes('infraccion')) return this.byId('evt-02');
    if (t.includes('lluvia')) return this.byId('evt-03');
    if (t.includes('niebla') || t.includes('visibilidad')) return this.byId('evt-04');
    if (t.includes('nocturn')) return this.byId('evt-05');
    if (t.includes('desalinead') || t.includes('movida')) return this.byId('evt-06');
    if (t.includes('cámara') && t.includes('desconect')) return this.byId('evt-07');
    if (t.includes('caida') || t.includes('caída') || t.includes('red')) return this.byId('evt-08');
    if (t.includes('base de datos')) return this.byId('evt-09');
    if (t.includes('congest')) return this.byId('evt-10');
    if (t.includes('notific') && (t.includes('fall') || t.includes('pendient')))
      return this.byId('evt-11');
    if (t.includes('acceso') || t.includes('autoriz') || t.includes('seguridad'))
      return this.byId('evt-12');
    return undefined;
  }

  private byId(id: string): EventoOperacionalCatalogo | undefined {
    return this.catalogo.find((c) => c.id === id);
  }

  bordeNivel(n: NivelRespuestaOperativa): string {
    switch (n) {
      case 'normal':
        return 'border-l-4 border-emerald-500';
      case 'informacion':
        return 'border-l-4 border-sky-500';
      case 'advertencia':
        return 'border-l-4 border-amber-500';
      default:
        return 'border-l-4 border-rose-600';
    }
  }

  chipNivel(n: NivelRespuestaOperativa): string {
    switch (n) {
      case 'normal':
        return 'bg-emerald-100 text-emerald-900 ring-emerald-200';
      case 'informacion':
        return 'bg-sky-100 text-sky-900 ring-sky-200';
      case 'advertencia':
        return 'bg-amber-100 text-amber-950 ring-amber-300';
      default:
        return 'bg-rose-100 text-rose-900 ring-rose-300';
    }
  }

  etiquetaNivel(n: NivelRespuestaOperativa): string {
    switch (n) {
      case 'normal':
        return 'Normal';
      case 'informacion':
        return 'Información';
      case 'advertencia':
        return 'Advertencia';
      default:
        return 'Error crítico';
    }
  }
}
