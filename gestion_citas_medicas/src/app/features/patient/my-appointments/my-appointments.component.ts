import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Auth, user, User } from '@angular/fire/auth';
import { Firestore, collection, getDocs, query, where, doc, getDoc } from '@angular/fire/firestore';   
import { Subscription } from 'rxjs';

interface Appointment {
  id?: string; 
  date: string; 
  hour: string; 
  doctorId: string; 
  doctorName: string; 
  specialty: string; 
  userId: string;
  userName?: string; 
  confirmada: boolean;
  cancelada?: boolean; 
  displayStatus?: string; 
  isForDoctorDisplay?: boolean; 
}

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, DatePipe], 
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.css']
})
export class MyAppointmentsComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  patientAppointments: Appointment[] = [];
  doctorAppointments: Appointment[] = [];

  currentUserId: string | null = null;
  currentUserRole: string | null = null;
  private authSubscription: Subscription | undefined;

  constructor(private firestore: Firestore, private auth: Auth) {}

  //Se obtienen las citas del usuario actualmente en sesión al cargar la página
  ngOnInit(): void {
    this.authSubscription = user(this.auth).subscribe(async (aUser: User | null) => {
      if (aUser) {
        this.currentUserId = aUser.uid;
        const userDocRef = doc(this.firestore, `usuarios/${this.currentUserId}`);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          this.currentUserRole = userDocSnap.data()['rol'] || null;
        } else {
          this.currentUserRole = null; 
        }
        await this.loadMyAppointments();
      } else {
        this.currentUserId = null;
        this.currentUserRole = null;
        this.patientAppointments = []; 
        this.doctorAppointments = []; 
        this.isLoading = false;
        this.errorMessage = 'No hay usuario autenticado. Por favor, inicia sesión para ver tus citas.';
      }
    });
  }

  ngOnDestroy(): void {
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
    this.patientAppointments = []; 
    this.doctorAppointments = [];

    try {
      const allFetchedAppointments: Appointment[] = [];
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

          if (appointment.cancelada) {
            appointment.displayStatus = 'Cancelada';
          } else if (appointment.confirmada) {
            appointment.displayStatus = 'Confirmada';
          } else {
            appointment.displayStatus = 'Pendiente';
          }
          allFetchedAppointments.push(appointment);
        });
      }

      // 2. Cargar citas donde el usuario actual es el DOCTOR (si su rol es 'a')
      if (this.currentUserRole === 'a') {
        const doctorAppointmentsCollectionRef = collection(this.firestore, `usuarios/${this.currentUserId}/citas`);
        const doctorAppointmentsQuery = query(
          doctorAppointmentsCollectionRef,
          where('confirmada', '==', true), 
          where('cancelada', '!=', true)
        );
        const doctorAppointmentsSnapshot = await getDocs(doctorAppointmentsQuery);

        for (const appointmentDoc of doctorAppointmentsSnapshot.docs) {
          const appointmentData = appointmentDoc.data();
          const appointment = {
            id: appointmentDoc.id,
            ...appointmentData,
            isForDoctorDisplay: true 
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
          appointment.displayStatus = undefined; 
          allFetchedAppointments.push(appointment); 
        }
      }

      allFetchedAppointments.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.hour}`);
        const dateTimeB = new Date(`${b.date}T${b.hour}`);
        return dateTimeA.getTime() - dateTimeB.getTime();
      });

      this.patientAppointments = allFetchedAppointments.filter(app => !app.isForDoctorDisplay);
      this.doctorAppointments = allFetchedAppointments.filter(app => app.isForDoctorDisplay);

      if (this.patientAppointments.length === 0 && this.doctorAppointments.length === 0) {
        this.errorMessage = 'No tienes citas agendadas.';
      }

    } catch (error) {
      this.errorMessage = 'Hubo un error al cargar tus citas. Por favor, inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }
}
