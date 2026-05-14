import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DemoStateService } from '../../core/services/demo-state.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, NgClass, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  readonly demo = inject(DemoStateService);
  readonly config = inject(ConfigService);
  readonly clock = signal(new Date());

  readonly horasGrafico = ['08', '09', '10', '11', '12', '13', '14', '15'];

  ngOnInit(): void {
    setInterval(() => this.clock.set(new Date()), 1000);
  }

  estadoLabel(): string {
    return this.demo.tituloBandaEstado();
  }

  estadoClase(): string {
    const b = this.demo.bandaEstado();
    if (b === 'error') return 'border-rose-400 bg-rose-100 text-rose-950';
    if (b === 'advertencia') return 'border-amber-300 bg-amber-50 text-amber-950';
    if (b === 'monitoreo') return 'border-sky-300 bg-sky-50 text-sky-950';
    return 'border-emerald-300 bg-emerald-50 text-emerald-950';
  }

  barHeight(i: number): number {
    const v = this.demo.infraccionesPorHora()[i] ?? 0;
    return 28 + v * 20;
  }
}
