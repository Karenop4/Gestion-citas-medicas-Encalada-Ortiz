// src/app/features/patient/my-appointments/my-appointments.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Auth, user, User } from '@angular/fire/auth';
import { Firestore, collection, getDocs, query, where, doc, getDoc } from '@angular/fire/firestore';   
import { Subscription } from 'rxjs';

// Interfaz para la estructura de una cita tal como se guarda en Firestore
interface Appointment {
  id?: string; // ID del documento de la cita
  date: string; // Formato 'YYYY-MM-DD'
  hour: string; // Formato 'HH:00'
  doctorId: string; // ID del médico
  doctorName: string; // Nombre del médico
  specialty: string; // Especialidad de la cita
  userId: string; // ID del paciente que agendó la cita
  userName?: string; // Nombre del paciente (para vista de doctor)
  confirmada: boolean; // Si la cita está confirmada
  cancelada?: boolean; // Si la cita ha sido cancelada
  displayStatus?: string; // Para mostrar el estado legible (Confirmada, Pendiente, Cancelada)
  isForDoctorDisplay?: boolean; // Flag para indicar si la cita se muestra desde la perspectiva del doctor
}

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, DatePipe], // Importa DatePipe para formatear la fecha
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.css']
})
export class MyAppointmentsComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  // <--- CAMBIO: Ahora hay dos arrays separados para las citas
  patientAppointments: Appointment[] = []; // Citas donde el usuario actual es el paciente
  doctorAppointments: Appointment[] = []; // Citas donde el usuario actual es el doctor (con sus pacientes)
  // FIN CAMBIO

  currentUserId: string | null = null;
  currentUserRole: string | null = null; // Para almacenar el rol del usuario
  private authSubscription: Subscription | undefined;

  constructor(private firestore: Firestore, private auth: Auth) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación para obtener el ID y el rol del usuario actual
    this.authSubscription = user(this.auth).subscribe(async (aUser: User | null) => {
      if (aUser) {
        this.currentUserId = aUser.uid;
        // Obtener el rol del usuario desde su documento en Firestore
        const userDocRef = doc(this.firestore, `usuarios/${this.currentUserId}`);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          this.currentUserRole = userDocSnap.data()['rol'] || null;
        } else {
          this.currentUserRole = null; // Rol desconocido si el documento no existe
        }
        console.log('Usuario actual (UID):', this.currentUserId, 'Rol:', this.currentUserRole);
        await this.loadMyAppointments();
      } else {
        this.currentUserId = null;
        this.currentUserRole = null;
        this.patientAppointments = []; // Limpiar citas si no hay usuario
        this.doctorAppointments = []; // Limpiar citas si no hay usuario
        this.isLoading = false;
        this.errorMessage = 'No hay usuario autenticado. Por favor, inicia sesión para ver tus citas.';
        console.log('No hay usuario autenticado para cargar citas.');
      }
    });
  }

  ngOnDestroy(): void {
    // Asegurarse de desuscribirse para evitar fugas de memoria
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  /**
   * Carga las citas del usuario actual desde Firestore.
   * Diferencia entre citas de paciente y citas de doctor, y las clasifica en arrays separados.
   */
  async loadMyAppointments(): Promise<void> {
    if (!this.currentUserId) {
      this.errorMessage = 'No se pudo cargar el ID del usuario.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.patientAppointments = []; // Limpiar citas anteriores
    this.doctorAppointments = []; // Limpiar citas anteriores

    try {
      const allFetchedAppointments: Appointment[] = [];

      // 1. Cargar citas donde el usuario actual es el PACIENTE
      // Se itera a través de todos los médicos para encontrar las citas del paciente.
      const doctorsCollectionRef = collection(this.firestore, 'usuarios');
      const doctorsQuery = query(doctorsCollectionRef, where('esMedico', '==', true));
      const doctorsSnapshot = await getDocs(doctorsQuery);

      for (const doctorDoc of doctorsSnapshot.docs) {
        const doctorId = doctorDoc.id;
        const appointmentsSubcollectionRef = collection(this.firestore, `usuarios/${doctorId}/citas`);
        const patientAppointmentsQuery = query(
          appointmentsSubcollectionRef,
          where('userId', '==', this.currentUserId)
        );
        const patientAppointmentsSnapshot = await getDocs(patientAppointmentsQuery);

        patientAppointmentsSnapshot.forEach(appointmentDoc => {
          const appointmentData = appointmentDoc.data();
          const appointment = {
            id: appointmentDoc.id,
            ...appointmentData
          } as Appointment;

          // Determinar el estado de visualización para el paciente
          if (appointment.cancelada) {
            appointment.displayStatus = 'Cancelada';
          } else if (appointment.confirmada) {
            appointment.displayStatus = 'Confirmada';
          } else {
            appointment.displayStatus = 'Pendiente';
          }
          allFetchedAppointments.push(appointment); // Añadir a la lista general para ordenar
        });
      }

      // 2. Cargar citas donde el usuario actual es el DOCTOR (si su rol es 'a')
      if (this.currentUserRole === 'a') { // Asumiendo 'a' es el rol de doctor/admin
        const doctorAppointmentsCollectionRef = collection(this.firestore, `usuarios/${this.currentUserId}/citas`);
        const doctorAppointmentsQuery = query(
          doctorAppointmentsCollectionRef,
          where('confirmada', '==', true), // Solo citas confirmadas para la vista del doctor
          where('cancelada', '!=', true) // Asegurarse de que no estén canceladas
        );
        const doctorAppointmentsSnapshot = await getDocs(doctorAppointmentsQuery);

        for (const appointmentDoc of doctorAppointmentsSnapshot.docs) {
          const appointmentData = appointmentDoc.data();
          const appointment = {
            id: appointmentDoc.id,
            ...appointmentData,
            isForDoctorDisplay: true // Marcar esta cita como para la vista del doctor
          } as Appointment;

          // Obtener el nombre del paciente para la vista del doctor
          if (appointment.userId) {
            const patientDocRef = doc(this.firestore, `usuarios/${appointment.userId}`);
            const patientDocSnap = await getDoc(patientDocRef);
            if (patientDocSnap.exists()) {
              appointment.userName = patientDocSnap.data()['nombre'];
            } else {
              appointment.userName = 'Paciente Desconocido';
            }
          } else {
            appointment.userName = 'Paciente Desconocido';
          }
          appointment.displayStatus = undefined; // No mostrar el estado para la vista del doctor
          allFetchedAppointments.push(appointment); // Añadir a la lista general para ordenar
        }
      }

      // Ordenar todas las citas (de paciente y de doctor) por fecha y hora
      allFetchedAppointments.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.hour}`);
        const dateTimeB = new Date(`${b.date}T${b.hour}`);
        return dateTimeA.getTime() - dateTimeB.getTime();
      });

      // <--- CAMBIO: Clasificar en los arrays específicos después de ordenar
      this.patientAppointments = allFetchedAppointments.filter(app => !app.isForDoctorDisplay);
      this.doctorAppointments = allFetchedAppointments.filter(app => app.isForDoctorDisplay);
      // FIN CAMBIO

      if (this.patientAppointments.length === 0 && this.doctorAppointments.length === 0) {
        this.errorMessage = 'No tienes citas agendadas.';
      }

    } catch (error) {
      console.error('Error al cargar las citas del usuario:', error);
      this.errorMessage = 'Hubo un error al cargar tus citas. Por favor, inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }
}
