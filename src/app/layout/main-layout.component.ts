import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { NgClass, DatePipe } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { DemoStateService } from '../core/services/demo-state.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass, DatePipe],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly demo = inject(DemoStateService);
  private readonly router = inject(Router);
  readonly clock = signal(new Date());

  ngOnInit(): void {
    setInterval(() => this.clock.set(new Date()), 1000);
  }

  cerrarSesion(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  nav = [
    { label: 'Dashboard', path: '/dashboard', icon: 'grid' },
    { label: 'Monitoreo', path: '/monitoreo', icon: 'cam' },
    { label: 'Apoderados', path: '/apoderados', icon: 'users' },
    { label: 'Infracciones', path: '/infracciones', icon: 'alert' },
    { label: 'Eventos', path: '/simulacion-operacional', icon: 'sim' },
    { label: 'Configuración', path: '/configuracion', icon: 'gear' },
  ];
}
