import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'dropoff_demo_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly loggedIn = signal(this.readStorage());
  readonly nombreUsuario = signal(this.readName());

  login(usuario: string): void {
    const name = usuario?.trim() || 'Operador';
    sessionStorage.setItem(STORAGE_KEY, '1');
    sessionStorage.setItem('dropoff_demo_user', name);
    this.loggedIn.set(true);
    this.nombreUsuario.set(name);
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('dropoff_demo_user');
    this.loggedIn.set(false);
    this.nombreUsuario.set('');
  }

  private readStorage(): boolean {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  }

  private readName(): string {
    return sessionStorage.getItem('dropoff_demo_user') ?? '';
  }
}
