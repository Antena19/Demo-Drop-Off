import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  id: number;
  texto: string;
  tipo: 'ok' | 'warn' | 'danger' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private id = 0;
  readonly mensajes$ = new Subject<ToastMessage>();

  show(texto: string, tipo: ToastMessage['tipo'] = 'info'): void {
    this.mensajes$.next({ id: ++this.id, texto, tipo });
  }
}
