// src/app/features/admin/appointment-management/appointment-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from '@angular/fire/firestore';

// Interfaz para el médico (reutilizada de otros componentes)
interface Doctor {
  id: string;
  nombre: string;
  especialidad: string;
  esMedico: boolean;
}

// Interfaz para la estructura de una cita en Firestore
interface Appointment {
  id: string; // El ID del documento de Firestore (ej. YYYY-MM-DD-HH)
  date: string; // Formato YYYY-MM-DD
  hour: string; // Formato HH:00
  userId: string; // ID del usuario que agendó la cita
  userName?: string; // Nuevo campo para el nombre del usuario
  doctorId: string; // ID del médico
  doctorName: string;
  specialty: string;
  confirmada: boolean;
  cancelada?: boolean; // Opcional, para indicar si la cita fue cancelada
}

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

  availableDoctors: Doctor[] = [];
  selectedDoctorId: string | null = null;
  selectedDoctorName: string | null = null;
  pendingAppointments: Appointment[] = [];

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  /**
   * Loads all users marked as doctors from Firestore.
   */
  async loadDoctors(): Promise<void> {
    this.isLoading = true;
    try {
      const q = query(
        collection(this.firestore, 'usuarios'),
        where('esMedico', '==', true)
      );
      const querySnapshot = await getDocs(q);
      this.availableDoctors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data()['nombre'],
        especialidad: doc.data()['especialidad'],
        esMedico: doc.data()['esMedico']
      } as Doctor));

      if (this.availableDoctors.length === 0) {
        this.openModal('No se encontraron médicos en el sistema.', 'error');
      }
    } catch (error) {
      console.error('Error al cargar médicos:', error);
      this.openModal('No se pudieron cargar los médicos. Por favor, intenta de nuevo.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Executes when a doctor is selected from the dropdown.
   * Loads the pending appointments for that doctor.
   */
  async onDoctorSelected(): Promise<void> {
    this.pendingAppointments = []; // Reset pending appointments
    this.modalMessage = ''; // Clear modal message
    this.modalType = ''; // Clear modal type

    if (this.selectedDoctorId) {
      const selectedDoctor = this.availableDoctors.find(d => d.id === this.selectedDoctorId);
      this.selectedDoctorName = selectedDoctor ? selectedDoctor.nombre : null;
      await this.loadPendingAppointments(this.selectedDoctorId);
    } else {
      this.selectedDoctorName = null;
    }
  }

  /**
   * Loads pending appointments for the selected doctor.
   * A pending appointment is one where 'confirmada' is false and 'cancelado' is not true.
   * @param doctorId The ID of the doctor.
   */
  async loadPendingAppointments(doctorId: string): Promise<void> {
    this.isLoading = true;
    this.pendingAppointments = []; // Clear previous appointments
    try {
      const appointmentsCollectionRef = collection(this.firestore, `usuarios/${doctorId}/citas`);
      
      // Query for appointments that are NOT confirmed and NOT cancelled
      const q = query(
        appointmentsCollectionRef,
        where('confirmada', '==', false),
        where('cancelada', '!=', true) // Excluye citas con cancelado: true
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedAppointments: Appointment[] = [];

      for (const docSnapshot of querySnapshot.docs) {
        const appointmentData = docSnapshot.data();
        const appointment = {
          id: docSnapshot.id,
          ...appointmentData
        } as Appointment;

        // Fetch user's name
        if (appointment.userId) {
          const userDocRef = doc(this.firestore, `usuarios/${appointment.userId}`);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            appointment.userName = userDocSnap.data()['nombre'];
          } else {
            appointment.userName = 'Usuario Desconocido'; // Fallback if user not found
          }
        } else {
          appointment.userName = 'Usuario Desconocido';
        }
        fetchedAppointments.push(appointment);
      }

      this.pendingAppointments = fetchedAppointments;

      if (this.pendingAppointments.length === 0) {
        this.openModal('No hay citas pendientes para este médico.', 'success'); // Considerar si esto es un error o solo informativo
      }
    } catch (error) {
      console.error('Error al cargar citas pendientes:', error);
      this.openModal('Error al cargar las citas pendientes. Por favor, intenta de nuevo.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Confirms an appointment by setting 'confirmada' to true.
   * @param appointment The appointment to confirm.
   */
  async confirmAppointment(appointment: Appointment): Promise<void> {
    this.isLoading = true;
    try {
      const appointmentDocRef = doc(this.firestore, `usuarios/${appointment.doctorId}/citas/${appointment.id}`);
      await updateDoc(appointmentDocRef, {
        confirmada: true
      });
      this.openModal('Cita confirmada con éxito.', 'success');
      // Reload appointments to reflect the change
      if (this.selectedDoctorId) {
        await this.loadPendingAppointments(this.selectedDoctorId);
      }
    } catch (error) {
      console.error('Error al confirmar la cita:', error);
      this.openModal('Error al confirmar la cita. Por favor, intenta de nuevo.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Cancels an appointment by setting 'cancelado' to true.
   * @param appointment The appointment to cancel.
   */
  async cancelAppointment(appointment: Appointment): Promise<void> {
    this.isLoading = true;
    try {
      const appointmentDocRef = doc(this.firestore, `usuarios/${appointment.doctorId}/citas/${appointment.id}`);
      await updateDoc(appointmentDocRef, {
        cancelada: true // Add the 'cancelado' field and set to true
      });
      this.openModal('Cita cancelada con éxito.', 'success');
      // Reload appointments to reflect the change
      if (this.selectedDoctorId) {
        await this.loadPendingAppointments(this.selectedDoctorId);
      }
    } catch (error) {
      console.error('Error al cancelar la cita:', error);
      this.openModal('Error al cancelar la cita. Por favor, intenta de nuevo.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Opens the modal with a specific message and type.
   * @param message The message to display in the modal.
   * @param type The type of message ('success' or 'error').
   */
  openModal(message: string, type: 'success' | 'error'): void {
    this.modalMessage = message;
    this.modalType = type;
    this.isModalOpen = true;
  }

  /**
   * Closes the modal and clears its message/type.
   */
  closeModal(): void {
    this.isModalOpen = false;
    this.modalMessage = '';
    this.modalType = '';
  }
}
