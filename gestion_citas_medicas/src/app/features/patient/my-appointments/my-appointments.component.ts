import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ¡Importa FormsModule para ngModel!
import { Subscription } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { UserService } from '../../../core/services/user.service';
import { Cita } from '../../../models/cita.model';
import { Usuario } from '../../../models/user.model';
import { Especialidad } from '../../../models/especialidad.model'; // Importa Especialidad

interface CitaDisplay extends Cita {
  displayStatus: string;
  statusClass: string;
}

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule], // ¡Añade FormsModule aquí!
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.css']
})
export class MyAppointmentsComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  errorMessage: string | null = null;

  patientAppointments: CitaDisplay[] = [];
  doctorAppointments: CitaDisplay[] = [];

  currentUserId: number | null = null;
  currentUserRole: string | null = null;
  private userSubscription: Subscription | undefined;

  // --- Propiedades para los filtros ---
  filterFechaDesde: string = '';
  filterFechaHasta: string = '';
  filterEspecialidadId: number | null = null;
  filterEstado: string | null = null;

  availableEspecialidades: Especialidad[] = [];
  appointmentStates = [
    { value: 'p', label: 'Pendiente' },
    { value: 'c', label: 'Confirmada' },
    { value: 'x', label: 'Cancelada' }
  ];

  constructor(
    private apiService: ApiService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Cargar especialidades al iniciar el componente
    this.loadEspecialidades();

    this.userSubscription = this.userService.usuario$.subscribe(async (usuario: Usuario | null) => {
      if (usuario && usuario.id && usuario.rol) {
        this.currentUserId = usuario.id;
        this.currentUserRole = usuario.rol;
        // Establecer fechas por defecto para el filtro (ej. hoy a dentro de 3 meses)
        const today = new Date();
        this.filterFechaDesde = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(today.getMonth() + 3);
        this.filterFechaHasta = threeMonthsLater.toISOString().split('T')[0];

        await this.loadMyAppointments(); // Cargar citas iniciales con filtros por defecto
      } else {
        this.currentUserId = null;
        this.currentUserRole = null;
        this.patientAppointments = [];
        this.doctorAppointments = [];
        this.isLoading = false;
        this.errorMessage = 'No hay usuario autenticado o su perfil no está completo. Por favor, inicia sesión para ver tus citas.';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  /**
   * Carga las especialidades disponibles desde el backend.
   */
  loadEspecialidades(): void {
    this.apiService.getEspecialidades().subscribe({
      next: (especialidades) => {
        this.availableEspecialidades = especialidades;
      },
      error: (err) => {
        console.error('Error al cargar especialidades:', err);
        // Opcional: mostrar un mensaje al usuario
      }
    });
  }

  /**
   * Carga las citas del usuario actual (paciente o médico) desde el backend REST,
   * aplicando los filtros seleccionados.
   */
  async loadMyAppointments(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    this.patientAppointments = [];
    this.doctorAppointments = [];

    // ... (validaciones y comprobaciones de currentUserId, currentUserRole, fechas) ...

    try {
      if (this.currentUserRole === 'p') {
        this.apiService.getFilteredAppointments(
          this.filterFechaDesde,
          this.filterFechaHasta,
          this.filterEspecialidadId,
          this.filterEstado,
          this.currentUserId,
          null
        ).subscribe({
          next: (citas: Cita[] | null) => { // <-- ¡IMPORTANTE! Ahora el tipo es Cita[] | null
            // Asegúrate de que 'citas' sea un array antes de intentar mapear
            this.patientAppointments = (citas || []).map(cita => this.mapCitaToDisplay(cita));
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error al cargar citas de paciente filtradas:', error);
            this.errorMessage = 'No se pudieron cargar tus citas como paciente. Por favor, inténtalo de nuevo.';
            this.isLoading = false;
          }
        });
      } else if (this.currentUserRole === 'a') {
        this.apiService.getFilteredAppointments(
          this.filterFechaDesde,
          this.filterFechaHasta,
          this.filterEspecialidadId,
          this.filterEstado,
          null,
          this.currentUserId
        ).subscribe({
          next: (citas: Cita[] | null) => { // <-- ¡IMPORTANTE! Ahora el tipo es Cita[] | null
            // Asegúrate de que 'citas' sea un array antes de intentar mapear
            this.doctorAppointments = (citas || []).map(cita => this.mapCitaToDisplay(cita));
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error al cargar citas de médico filtradas:', error);
            this.errorMessage = 'No se pudieron cargar tus citas como doctor. Por favor, inténtalo de nuevo.';
            this.isLoading = false;
          }
        });
      } else {
        this.errorMessage = 'Rol de usuario no reconocido. No se pueden cargar las citas.';
        this.isLoading = false;
      }
    } catch (error) {
      console.error('Hubo un error inesperado al cargar citas filtradas:', error);
      this.errorMessage = 'Hubo un error inesperado al cargar tus citas. Por favor, inténtalo de nuevo.';
      this.isLoading = false;
    }
  }

  // Se mantiene igual
  private mapCitaToDisplay(cita: Cita): CitaDisplay {
    let displayStatus: string;
    let statusClass: string;

    switch (cita.estado) {
      case 'p':
        displayStatus = 'Pendiente';
        statusClass = 'status-pending';
        break;
      case 'x':
        displayStatus = 'Cancelada';
        statusClass = 'status-cancelled';
        break;
      case 'c':
        displayStatus = 'Confirmada';
        statusClass = 'status-confirmed';
        break;
      default:
        displayStatus = 'Desconocido';
        statusClass = '';
        break;
    }

    return {
      ...cita,
      displayStatus,
      statusClass
    };
  }
}