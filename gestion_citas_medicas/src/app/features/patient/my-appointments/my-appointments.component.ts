import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Auth, user, User } from '@angular/fire/auth';
import { Firestore, collection, getDocs, query, where, doc, getDoc } from '@angular/fire/firestore';   
import { Subscription } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Cita } from '../../../models/cita.model';
interface CitaDisplay extends Cita {
  displayStatus: string;
  statusClass: string;
}
import { Paciente } from '../../../models/paciente.model';



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
  
  patientAppointments: CitaDisplay[] = [];
  doctorAppointments: CitaDisplay[] = [];

  currentUserId: string | null = null;
  currentUserRole: string | null = null;
  private authSubscription: Subscription | undefined;

  constructor(private firestore: Firestore, private auth: Auth, private apiService: ApiService) {}

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
    this.isLoading = true;
    this.errorMessage = null;
    this.patientAppointments = [];
    this.doctorAppointments = [];

    // Verifica que el usuario esté autenticado y tenga un id válido
    if (!this.currentUserId) {
      this.errorMessage = 'No se pudo cargar el ID del usuario.';
      this.isLoading = false;
      return;
    }

    // El id del paciente debe ser number
    const pacienteId = Number(this.currentUserId);
    this.patientAppointments = [];
    this.doctorAppointments = [];

    try {
      // Cargar citas como paciente
      this.apiService.getAppointmentsPorPaciente(3).subscribe({
        next: (citas: Cita[]) => {
          this.patientAppointments = citas.map(cita => ({
            ...cita,
            displayStatus: cita.estado === 'p' ? 'Pendiente' : (cita.estado === 'x' ? 'Cancelada' : (cita.estado === 'c' ? 'Confirmada' : cita.estado)),
            statusClass: cita.estado === 'p' ? 'status-pending' : (cita.estado === 'x' ? 'status-cancelled' : (cita.estado === 'c' ? 'status-confirmed' : ''))
          })) as CitaDisplay[];
        },
        error: (error) => {
          this.errorMessage = 'No se pudieron cargar tus citas como paciente.';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
      // Si el usuario es doctor, cargar doctorAppointments con displayStatus y statusClass
      if (this.currentUserRole === 'a') {
        this.apiService.getAppointmentsPorMedico(Number(this.currentUserId)).subscribe({
          next: (citas: Cita[]) => {
            this.doctorAppointments = citas.map(cita => ({
              ...cita,
              displayStatus: cita.estado === 'p' ? 'Pendiente' : (cita.estado === 'x' ? 'Cancelada' : (cita.estado === 'c' ? 'Confirmada' : cita.estado)),
              statusClass: cita.estado === 'p' ? 'status-pending' : (cita.estado === 'x' ? 'status-cancelled' : (cita.estado === 'c' ? 'status-confirmed' : ''))
            })) as CitaDisplay[];
          },
          error: (error) => {
            this.errorMessage = 'No se pudieron cargar tus citas como doctor.';
          }
        });
      }
    } catch (error) {
      this.errorMessage = 'Hubo un error al cargar tus citas. Por favor, inténtalo de nuevo.';
      this.isLoading = false;
    }
  }

}
