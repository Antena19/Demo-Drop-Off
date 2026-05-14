import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ApoderadoRegistro } from '../../core/models/demo.models';
import { DemoStateService } from '../../core/services/demo-state.service';

@Component({
  selector: 'app-apoderados',
  imports: [FormsModule],
  templateUrl: './apoderados.component.html',
})
export class ApoderadosComponent {
  readonly demo = inject(DemoStateService);

  readonly editingId = signal<string | null>(null);

  form: Omit<ApoderadoRegistro, 'id'> = this.emptyForm();

  private emptyForm(): Omit<ApoderadoRegistro, 'id'> {
    return {
      nombre: '',
      rut: '',
      estudiante: '',
      curso: '',
      correo: '',
      patente: '',
    };
  }

  agregar(): void {
    if (!this.form.nombre.trim()) return;
    this.demo.agregarApoderado({ ...this.form });
    this.form = this.emptyForm();
  }

  editar(row: ApoderadoRegistro): void {
    this.editingId.set(row.id);
    this.form = { ...row };
  }

  guardarEdicion(): void {
    const id = this.editingId();
    if (!id) return;
    this.demo.editarApoderado({ ...this.form, id });
    this.cancelar();
  }

  cancelar(): void {
    this.editingId.set(null);
    this.form = this.emptyForm();
  }

  eliminar(row: ApoderadoRegistro): void {
    this.demo.eliminarApoderado(row.id);
    if (this.editingId() === row.id) this.cancelar();
  }
}
