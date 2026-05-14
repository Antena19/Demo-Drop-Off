import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'monitoreo',
        loadComponent: () =>
          import('./pages/monitoreo/monitoreo.component').then((m) => m.MonitoreoComponent),
      },
      {
        path: 'apoderados',
        loadComponent: () =>
          import('./pages/apoderados/apoderados.component').then((m) => m.ApoderadosComponent),
      },
      {
        path: 'infracciones',
        loadComponent: () =>
          import('./pages/infracciones/infracciones.component').then((m) => m.InfraccionesComponent),
      },
      {
        path: 'simulacion-operacional',
        loadComponent: () =>
          import('./pages/simulacion-operacional/simulacion-operacional.component').then(
            (m) => m.SimulacionOperacionalComponent,
          ),
      },
      { path: 'riesgos', redirectTo: 'simulacion-operacional', pathMatch: 'full' },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./pages/configuracion/configuracion.component').then(
            (m) => m.ConfiguracionComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
