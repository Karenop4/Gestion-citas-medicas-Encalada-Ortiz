// src/app/features/admin/especialidades/especialidad.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';

// Interfaz para la estructura de una especialidad en Firestore
interface Specialty {
  id: string; // El ID del documento de Firestore
  name: string; // El nombre de la especialidad
}

@Component({
  selector: 'app-especialidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './especialidad.component.html',
  styleUrls: ['./especialidad.component.css']
})
export class EspecialidadComponent implements OnInit {
  isLoading: boolean = false;
  
  // Propiedades para el modal de mensajes
  isModalOpen: boolean = false;
  modalMessage: string = '';
  modalType: 'success' | 'error' | '' = '';

  specialties: Specialty[] = [];
  newSpecialtyName: string = ''; // Para el input de crear nueva especialidad
  
  editingSpecialty: Specialty | null = null; // La especialidad que se está editando
  editingSpecialtyName: string = ''; // Para el input de editar especialidad

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    this.loadSpecialties();
  }

  /**
   * Carga todas las especialidades desde la colección 'especialidades' en Firestore.
   */
  async loadSpecialties(): Promise<void> {
    this.isLoading = true;
    try {
      const q = collection(this.firestore, 'especialidades');
      const querySnapshot = await getDocs(q);
      this.specialties = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data()['name']
      } as Specialty));

      if (this.specialties.length === 0) {
        this.openModal('No se encontraron especialidades en el sistema.', 'success'); // Informativo
      }
    } catch (error) {
      console.error('Error al cargar especialidades:', error);
      this.openModal('No se pudieron cargar las especialidades. Por favor, intenta de nuevo.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Agrega una nueva especialidad a Firestore.
   */
  async addSpecialty(): Promise<void> {
    if (!this.newSpecialtyName.trim()) {
      this.openModal('El nombre de la especialidad no puede estar vacío.', 'error');
      return;
    }

    this.isLoading = true;
    try {
      // Verificar si la especialidad ya existe (case-insensitive)
      const existingSpecialty = this.specialties.some(
        s => s.name.toLowerCase() === this.newSpecialtyName.trim().toLowerCase()
      );

      if (existingSpecialty) {
        this.openModal('La especialidad ya existe.', 'error');
        this.isLoading = false;
        return;
      }

      const docRef = await addDoc(collection(this.firestore, 'especialidades'), {
        name: this.newSpecialtyName.trim()
      });
      this.openModal('Especialidad creada con éxito.', 'success');
      // this.newSpecialtyName = ''; // Se limpiará en closeModal
      await this.loadSpecialties(); // Recargar la lista
    } catch (error) {
      console.error('Error al crear especialidad:', error);
      this.openModal('Error al crear la especialidad. Por favor, intenta de nuevo.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Prepara el formulario para editar una especialidad existente.
   * @param specialty La especialidad a editar.
   */
  editSpecialty(specialty: Specialty): void {
    this.editingSpecialty = { ...specialty }; // Crear una copia para evitar mutar el original directamente
    this.editingSpecialtyName = specialty.name;
    this.modalMessage = ''; // Limpiar mensajes de modal anteriores
    this.modalType = '';
  }

  /**
   * Actualiza una especialidad existente en Firestore.
   */
  async updateSpecialty(): Promise<void> {
    if (!this.editingSpecialty || !this.editingSpecialtyName.trim()) {
      this.openModal('No hay especialidad seleccionada para editar o el nombre está vacío.', 'error');
      return;
    }

    this.isLoading = true;
    try {
      // Verificar si el nuevo nombre ya existe (case-insensitive), excluyendo la especialidad actual
      const existingSpecialty = this.specialties.some(
        s => s.id !== this.editingSpecialty?.id && s.name.toLowerCase() === this.editingSpecialtyName.trim().toLowerCase()
      );

      if (existingSpecialty) {
        this.openModal('Ya existe otra especialidad con ese nombre.', 'error');
        this.isLoading = false;
        return;
      }

      const specialtyDocRef = doc(this.firestore, 'especialidades', this.editingSpecialty.id);
      await updateDoc(specialtyDocRef, {
        name: this.editingSpecialtyName.trim()
      });
      this.openModal('Especialidad actualizada con éxito.', 'success');
      // this.cancelEdit(); // <--- ELIMINADO: Se llamará en closeModal()
      await this.loadSpecialties(); // Recargar la lista
    } catch (error) {
      console.error('Error al actualizar especialidad:', error);
      this.openModal('Error al actualizar la especialidad. Por favor, intenta de nuevo.', 'error');
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
    // this.modalMessage = ''; // <--- ELIMINADO: Se limpia en closeModal
    // this.modalType = ''; // <--- ELIMINADO: Se limpia en closeModal
  }

  /**
   * Elimina una especialidad de Firestore.
   * @param specialtyId El ID de la especialidad a eliminar.
   */
  async deleteSpecialty(specialtyId: string): Promise<void> {
    // Implementar una confirmación antes de eliminar (usando un modal de confirmación si es necesario)
    if (!confirm('¿Estás seguro de que quieres eliminar esta especialidad?')) {
      return;
    }

    this.isLoading = true;
    try {
      const specialtyDocRef = doc(this.firestore, 'especialidades', specialtyId);
      await deleteDoc(specialtyDocRef);
      this.openModal('Especialidad eliminada con éxito.', 'success');
      await this.loadSpecialties(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar especialidad:', error);
      this.openModal('Error al eliminar la especialidad. Por favor, intenta de nuevo.', 'error');
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
    // <--- NUEVO: Reiniciar el formulario de edición y el campo de nueva especialidad al cerrar el modal
    this.cancelEdit(); // Reinicia editingSpecialty y editingSpecialtyName
    this.newSpecialtyName = ''; // Limpia el campo de nueva especialidad
  }
}
