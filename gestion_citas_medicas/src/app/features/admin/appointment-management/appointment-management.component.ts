// src/app/features/admin/appointment-management/appointment-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { Cita } from '../../../models/cita.model';
import { Medico } from '../../../models/medico.model';

@Component({
  selector: 'app-appointment-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './appointment-management.component.html',
  styleUrls: ['./appointment-management.component.css']
})
export class AppointmentManagementComponent implements OnInit {
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  modalMessage: string = '';
  modalType: 'success' | 'error' | '' = '';

  availableDoctors: Medico[] = [];
  selectedDoctorId: number | null = null;
  selectedDoctorName: string | undefined | null = null;
  pendingAppointments: Cita[] = [];

  constructor(private firestore: Firestore, private http: HttpClient, private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDoctors();
    console.log('ngOnInit: selectedDoctorId', this.selectedDoctorId);
    // Si ya hay un doctor seleccionado, ejecuta onDoctorSelected
    if (this.selectedDoctorId) {
      this.onDoctorSelected();
    }
  }

  /**
   * Loads all users marked as doctors from Firestore.
   */
  async loadDoctors(): Promise<void> {
    this.isLoading = true;
    try {
      this.http.get<any[]>('http://localhost:8080/api/medicos').subscribe({
        next: (medicos) => {
          this.availableDoctors = medicos.map(medico => ({
            id: Number(medico.uid || medico.id || medico.personalID),
            nombre: medico.nombre,
            especialidad: medico.especialidad?.nombre || medico.especialidad || '',
            esMedico: true
          }));
          if (this.availableDoctors.length === 0) {
            this.openModal('No se encontraron médicos en el sistema.', 'error');
          }
        },
        error: (error) => {
          console.error('Error al cargar médicos:', error);
          this.openModal('No se pudieron cargar los médicos. Por favor, intenta de nuevo.', 'error');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } catch (error) {
      this.isLoading = false;
      this.openModal('No se pudieron cargar los médicos. Por favor, intenta de nuevo.', 'error');
    }
  }

  /**
   * Carga las citas cuando se selecciona el doctor.
   */
  async onDoctorSelected(): Promise<void> {
    this.pendingAppointments = []; 
    this.modalMessage = ''; 
    this.modalType = ''; 

    if (this.selectedDoctorId) {
      const selectedDoctor = this.availableDoctors.find(d => d.id === this.selectedDoctorId);
      if (!selectedDoctor) {
        console.warn('No se encontró el doctor con id:', this.selectedDoctorId);
      }
      this.selectedDoctorName = selectedDoctor ? selectedDoctor.nombre : null;
      await this.loadPendingAppointments(this.selectedDoctorId);
    } else {
      this.selectedDoctorName = null;
    }
  }

  /**
   * Carga solo las citas pendientes.
   * Estas son usadas en la seccion gestion de citas.
   * @param doctorId ID del doctor.
   */
  async loadPendingAppointments(doctorId: number): Promise<void> {
    this.isLoading = true;
    this.pendingAppointments = [];
    try {
      // Consumir citas pendientes del backend
      this.apiService.getAppointmentsPorMedico(doctorId).subscribe({
        next: (citas) => {
          this.pendingAppointments = citas.map(cita => ({
            id: cita.id,
            fecha: cita.fecha,
            hora: cita.hora,
            nombre: cita.nombre,
            paciente: cita.paciente || 'Usuario Desconocido',
            medico: cita.medico || '',
            estado: cita.estado 
          }));
          if (this.pendingAppointments.length === 0) {
            this.openModal('No hay citas pendientes para este médico.', 'error');
          }
        },
        error: (error) => {
          this.openModal('Error al cargar las citas pendientes. Por favor, intenta de nuevo.', 'error');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } catch (error) {
      this.openModal('Error al cargar las citas pendientes. Por favor, intenta de nuevo.', 'error');
      this.isLoading = false;
    }
  }

  /**
   * Confirma una cita, cambia el valor de confirmada a true
   * @param appointment cita a confirmar
   */
  async confirmAppointment(appointment: Cita): Promise<void> {
    this.isLoading = true;
    this.apiService.confirmarAppointment(appointment).subscribe({
      next: () => {
        this.openModal('Cita confirmada correctamente.', 'success');
        this.loadPendingAppointments(this.selectedDoctorId!); // Recargar citas pendientes
      },
      error: (error) => {
        this.openModal('Error al confirmar la cita. Por favor, intenta de nuevo.', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Cancela uns cita cambiando el valor de cancelada a true
   * @param appointment Cita a cancelar
   */
  async cancelAppointment(appointment: Cita): Promise<void> {
    this.isLoading = true;
    this.apiService.cancelAppointment(appointment).subscribe({
      next: () => {
        this.openModal('Cita cancelada correctamente.', 'success');
        this.loadPendingAppointments(this.selectedDoctorId!); // Recargar citas pendientes
      },
      error: (error) => {
        this.openModal('Error al cancelar la cita. Por favor, intenta de nuevo.', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Abre la ventana modal con dos tipos de mensajes
   * @param message el mensaje a mostrar
   * @param type el tipo (success o error)
   */
  openModal(message: string, type: 'success' | 'error'): void {
    this.modalMessage = message;
    this.modalType = type;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.modalMessage = '';
    this.modalType = '';
  }
}
