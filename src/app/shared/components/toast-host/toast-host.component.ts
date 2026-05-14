import { Component, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toast-host',
  imports: [NgClass],
  template: `
    <div
      class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
    >
      @for (t of visibles; track t.id) {
        <div
          class="pointer-events-auto animate-fade-in rounded-xl border px-4 py-3 text-sm shadow-card backdrop-blur-sm"
          [ngClass]="{
            'border-emerald-200 bg-emerald-50 text-emerald-900': t.tipo === 'ok',
            'border-amber-200 bg-amber-50 text-amber-900': t.tipo === 'warn',
            'border-rose-200 bg-rose-50 text-rose-900': t.tipo === 'danger',
            'border-slate-200 bg-white text-slate-800': t.tipo === 'info',
          }"
        >
          {{ t.texto }}
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent implements OnDestroy {
  private readonly toast = inject(ToastService);
  private sub?: Subscription;
  visibles: ToastMessage[] = [];

  constructor() {
    this.sub = this.toast.mensajes$.subscribe((m) => {
      this.visibles = [...this.visibles, m].slice(-4);
      setTimeout(() => {
        this.visibles = this.visibles.filter((x) => x.id !== m.id);
      }, 4200);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
