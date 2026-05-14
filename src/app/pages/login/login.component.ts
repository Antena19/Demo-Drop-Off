import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  usuario = '';
  clave = '';

  ngOnInit(): void {
    if (this.auth.loggedIn()) {
      void this.router.navigate(['/dashboard']);
    }
  }

  ingresar(): void {
    this.auth.login(this.usuario);
    void this.router.navigate(['/dashboard']);
  }
}
