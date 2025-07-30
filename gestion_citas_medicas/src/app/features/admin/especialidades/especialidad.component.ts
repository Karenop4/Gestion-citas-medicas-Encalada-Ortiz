// src/app/features/admin/especialidades/especialidad.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Especialidad } from '../../../models/especialidad.model';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-especialidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './especialidad.component.html',
  styleUrls: ['./especialidad.component.css']
})
export class EspecialidadComponent implements OnInit {
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  modalMessage: string = '';
  modalType: 'success' | 'error' | '' = '';

  specialties: Especialidad[] = [];
  newSpecialtyName: string = '';

  editingSpecialty: Especialidad | null = null;
  editingSpecialtyName: string = '';

  private destroy$ = new Subject<void>();
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadSpecialties();
  }

 /**
   * Carga todas las especialidades desde el backend REST.
   */
  async loadSpecialties(): Promise<void> {
  this.isLoading = true;
  try {
    this.specialties = await firstValueFrom(this.apiService.loadSpecialties().pipe(takeUntil(this.destroy$))); // Si el findAll ya trae solo activas

    // Si el findAll trae todas y se necesita filtrar en el frontend:
    // Actualmente el backend ya filtra las especialidades activas, por lo que no es necesario este paso.
    // this.specialties = (await firstValueFrom(this.apiService.getEspecialidades().pipe(takeUntil(this.destroy$))))
    //                      .filter(s => s.activa);

    if (this.specialties.length === 0) {
      this.openModal('No se encontraron especialidades activas en el sistema.', 'success');
    }
  } catch (error) {
    // ...
  } finally {
    this.isLoading = false;
  }
}

  /**
   * Agrega una nueva especialidad al backend REST.
   */
  async addSpecialty(): Promise<void> {
    if (!this.newSpecialtyName.trim()) {
      this.openModal('El nombre de la especialidad no puede estar vacío.', 'error');
      return;
    }

    this.isLoading = true;
    try {
      const existingSpecialty = this.specialties.some(
        // Cambiado s.name a s.nombre
        s => s.nombre.toLowerCase() === this.newSpecialtyName.trim().toLowerCase()
      );

      if (existingSpecialty) {
        this.openModal('La especialidad ya existe.', 'error');
        this.isLoading = false;
        return;
      }

      // Construir el objeto para enviar al backend (solo nombre y activa)
      const newSpecialtyData: { nombre: string, activa: boolean } = {
        nombre: this.newSpecialtyName.trim(),
        activa: true 
      };

      await firstValueFrom(this.apiService.createEspecialidad(newSpecialtyData).pipe(takeUntil(this.destroy$)));
      this.openModal('Especialidad creada con éxito.', 'success');
      this.newSpecialtyName = '';
      await this.loadSpecialties(); 
    } catch (error: any) {
      console.error('Error al crear la especialidad:', error);
      const errorMessage = error.error || 'Error al crear la especialidad. Por favor, intenta de nuevo.';
      this.openModal(errorMessage, 'error');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Prepara el formulario para editar una especialidad existente.
   * @param specialty La especialidad a editar.
   */
  editSpecialty(specialty: Especialidad): void { // Cambiado a Especialidad
    this.editingSpecialty = { ...specialty }; // Copia la especialidad para edición
    this.editingSpecialtyName = specialty.nombre; // Cambiado specialty.name a specialty.nombre
    this.modalMessage = '';
    this.modalType = '';
  }

  /**
   * Actualiza una especialidad existente en el backend REST.
   */
  async updateSpecialty(): Promise<void> {
    if (!this.editingSpecialty || !this.editingSpecialtyName.trim()) {
      this.openModal('No hay especialidad seleccionada para editar o el nombre está vacío.', 'error');
      return;
    }

    this.isLoading = true;
    try {
      const existingSpecialty = this.specialties.some(
        // Cambiado s.name a s.nombre
        s => s.id !== this.editingSpecialty?.id && s.nombre.toLowerCase() === this.editingSpecialtyName.trim().toLowerCase()
      );

      if (existingSpecialty) {
        this.openModal('Ya existe otra especialidad con ese nombre.', 'error');
        this.isLoading = false;
        return;
      }

      // Construir el objeto para enviar al backend (solo nombre y activa)
      const updatedSpecialtyData: { nombre: string, activa: boolean } = {
        nombre: this.editingSpecialtyName.trim(),
        // Usar el valor 'activa' existente del objeto original, si existe
        activa: this.editingSpecialty.activa !== undefined ? this.editingSpecialty.activa : true 
      };

      if (this.editingSpecialty.id === undefined) {
          // Esto no debería pasar si editingSpecialty se carga de una especialidad existente
          // Pero es una buena práctica añadir una verificación.
          this.openModal('Error: ID de especialidad no definido para actualizar.', 'error');
          this.isLoading = false;
          return;
      }

      await firstValueFrom(this.apiService.updateEspecialidad(this.editingSpecialty.id, updatedSpecialtyData).pipe(takeUntil(this.destroy$)));
      this.openModal('Especialidad actualizada con éxito.', 'success');
      this.cancelEdit(); // Limpiar el formulario de edición
      await this.loadSpecialties(); // Recargar la lista
    } catch (error: any) {
      console.error('Error al actualizar especialidad:', error);
      const errorMessage = error.error || 'Error al actualizar la especialidad. Por favor, intenta de nuevo.';
      this.openModal(errorMessage, 'error');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Cancela la operación de edición y limpia el formulario de edición.
   */
  cancelEdit(): void {
    this.editingSpecialty = null;
    this.editingSpecialtyName = '';
  }

  /**
   * Elimina una especialidad del backend REST.
   * @param specialtyId El ID de la especialidad a eliminar.
   */
  async deleteSpecialty(specialtyId: number): Promise<void> {
    if (!confirm('¿Estás seguro de que quieres desactivar esta especialidad?')) { 
      return;
    }
    this.isLoading = true;
    try {
      await firstValueFrom(this.apiService.deactivateEspecialidad(specialtyId).pipe(takeUntil(this.destroy$)));
      this.openModal('Especialidad desactivada con éxito.', 'success'); 
      await this.loadSpecialties();
    } catch (error: any) {
      const errorMessage = error.error || 'Error al desactivar la especialidad. Por favor, intenta de nuevo.';
      this.openModal(errorMessage, 'error');
    } finally {
      this.isLoading = false;
    }
}

  /**
   * Abre el modal de mensajes.
   * @param message El mensaje a mostrar.
   * @param type El tipo de mensaje ('success' o 'error').
   */
  openModal(message: string, type: 'success' | 'error'): void {
    this.modalMessage = message;
    this.modalType = type;
    this.isModalOpen = true;
  }

  /**
   * Cierra el modal de mensajes y reinicia el estado del formulario.
   */
  closeModal(): void {
    this.isModalOpen = false;
    this.modalMessage = '';
    this.modalType = '';
    this.cancelEdit();
    this.newSpecialtyName = '';
  }
}
