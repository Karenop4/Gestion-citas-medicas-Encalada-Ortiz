import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Auth, user, User } from '@angular/fire/auth';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore'; 
import { Subscription } from 'rxjs';

// Interfaz para la estructura de una cita tal como se guarda en Firestore
interface Appointment {
  date: string; // Formato 'YYYY-MM-DD'
  hour: string; // Formato 'HH:00'
  doctorId: string;
  doctorName: string;
  specialty: string;
  userId: string;
  confirmada: boolean;
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
  myAppointments: Appointment[] = [];
  currentUserId: string | null = null;
  private authSubscription: Subscription | undefined;

  constructor(private firestore: Firestore, private auth: Auth) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación para obtener el ID del usuario actual
    this.authSubscription = user(this.auth).subscribe(async (aUser: User | null) => {
      if (aUser) {
        this.currentUserId = aUser.uid;
        console.log('Usuario actual para citas:', this.currentUserId);
        await this.loadMyAppointments();
      } else {
        this.currentUserId = null;
        this.myAppointments = []; // Limpiar citas si no hay usuario
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
   * Recorre todos los médicos para encontrar las citas asociadas a este userId.
   */
  async loadMyAppointments(): Promise<void> {
    if (!this.currentUserId) {
      this.errorMessage = 'No se pudo cargar el ID del usuario.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.myAppointments = []; // Limpiar citas anteriores

    try {
      // Paso 1: Obtener todos los médicos (usuarios con esMedico: true)
      const doctorsCollectionRef = collection(this.firestore, 'usuarios');
      const doctorsQuery = query(doctorsCollectionRef, where('esMedico', '==', true));
      const doctorsSnapshot = await getDocs(doctorsQuery);

      const allUserAppointments: Appointment[] = [];

      // Paso 2: Para cada médico, buscar citas donde userId coincida
      for (const doctorDoc of doctorsSnapshot.docs) {
        const doctorId = doctorDoc.id;
        const appointmentsSubcollectionRef = collection(this.firestore, `usuarios/${doctorId}/citas`);
        const userAppointmentsQuery = query(
          appointmentsSubcollectionRef,
          where('userId', '==', this.currentUserId)
        );
        const appointmentsSnapshot = await getDocs(userAppointmentsQuery);

        appointmentsSnapshot.forEach(appointmentDoc => {
          const appointmentData = appointmentDoc.data() as Appointment;
          allUserAppointments.push(appointmentData);
        });
      }

      // Ordenar las citas por fecha y hora
      this.myAppointments = allUserAppointments.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.hour}`);
        const dateTimeB = new Date(`${b.date}T${b.hour}`);
        return dateTimeA.getTime() - dateTimeB.getTime();
      });

      if (this.myAppointments.length === 0) {
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
