// src/app/features/admin/appointment-management/appointment-management.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // Asegúrate de que HttpClientModule esté en tu AppModule
import { ApiService } from '../../../core/services/api.service';
import { Cita } from '../../../models/cita.model'; // Usar Cita. Si tu backend devuelve CitaDTO, considera renombrar esta interfaz a CitaDTO para claridad.
import { Medico } from '../../../models/medico.model'; // Asegúrate que esta interfaz ya tiene 'horario: Horario'
import { Especialidad } from '../../../models/especialidad.model'; // Asegúrate que esta interfaz exista
import { Horario } from '../../../models/horario.model'; // Asegúrate de importar la interfaz Horario
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import moment from 'moment'; // Importación por defecto para Moment.js
import 'moment/locale/es'; // Para localización en español

@Component({
  selector: 'app-appointment-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './appointment-management.component.html',
  styleUrls: ['./appointment-management.component.css']
})
export class AppointmentManagementComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  isModalOpen: boolean = false; // Para mensajes generales (éxito/error)
  modalMessage: string = '';
  modalType: 'success' | 'error' | '' = '';

  // Data para el modo médico
  availableDoctors: Medico[] = [];
  selectedDoctorId: number | null = null;
  selectedDoctorName: string | null = null;
  pendingAppointments: Cita[] = [];

  // Data para el modo especialidad
  availableSpecialties: Especialidad[] = [];
  selectedSpecialtyId: number | null = null;
  selectedSpecialtyName: string | null = null;
  confirmedAppointmentsBySpecialty: Cita[] = [];

  filterMode: 'medico' | 'especialidad' = 'medico';

  // **Nuevas variables para la barra de ocupación**
  occupancyBarColor: string = 'gray'; // 'green', 'yellow', 'red'
  occupancyMessage: string = 'Selecciona un médico para ver su ocupación.';
  private selectedMedicoHorario: Horario | null = null; // Tipo explícito Horario

  // Variables para el modal de confirmación/cancelación de cita
  isConfirmCancelModalOpen: boolean = false;
  citaToConfirmCancel: Cita | null = null;
  confirmCancelModalAction: 'confirm' | 'cancel' | '' = '';

  // Para desuscribirse de Observables
  private destroy$ = new Subject<void>();

  // HttpClient no es necesario si todas las llamadas pasan por ApiService
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    moment.locale('es'); // Asegura que Moment.js use la localización en español
    this.loadInitialData(); // Cargar doctores y especialidades al inicio
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Emitir para desuscribir todos los observables
    this.destroy$.complete(); // Completar el Subject
  }

  /**
   * Carga datos iniciales (médicos y especialidades).
   */
  async loadInitialData(): Promise<void> {
    this.isLoading = true;
    try {
      // Asumimos que getMedicos() de ApiService ya devuelve el horario del médico.
      this.availableDoctors = await firstValueFrom(this.apiService.getMedicos().pipe(takeUntil(this.destroy$))) || [];
      // Asumimos que loadSpecialtiesReporte() de ApiService devuelve Especialidad[]
      this.availableSpecialties = await firstValueFrom(this.apiService.loadSpecialtiesReporte().pipe(takeUntil(this.destroy$))) || [];

      if (this.availableDoctors.length === 0) {
        this.openModal('No se encontraron médicos en el sistema.', 'error');
      }
      if (this.availableSpecialties.length === 0) {
        this.openModal('No se encontraron especialidades en el sistema.', 'error');
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      this.openModal('Error al cargar datos iniciales. Por favor, intenta de nuevo.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Cambia el modo de filtrado (médico o especialidad).
   * Limpia las selecciones y los datos del modo anterior.
   */
  setFilterMode(mode: 'medico' | 'especialidad'): void {
    this.filterMode = mode;
    this.isLoading = false;
    this.closeModal(); 
    this.closeConfirmCancelModal(); 

    // Limpiar selecciones y datos del modo opuesto
    if (this.filterMode === 'medico') {
      this.selectedSpecialtyId = null;
      this.selectedSpecialtyName = null;
      this.confirmedAppointmentsBySpecialty = [];
      this.resetOccupancyBar();
    } else {
      this.selectedDoctorId = null;
      this.selectedDoctorName = null;
      this.pendingAppointments = [];
      this.resetOccupancyBar();
    }
  }

  /**
   * Carga las citas pendientes y calcula la ocupación cuando se selecciona un doctor.
   */
 async onDoctorSelected(): Promise<void> {
    this.pendingAppointments = [];
    this.closeModal(); 
    this.closeConfirmCancelModal(); 
    this.resetOccupancyBar(); 

    if (this.selectedDoctorId) {
      const selectedDoctor = this.availableDoctors.find(d => d.id === this.selectedDoctorId);
      this.selectedDoctorName = selectedDoctor ? selectedDoctor.nombre : null;

      this.isLoading = true;
      this.occupancyMessage = "Cargando horario y citas del médico..."; 

      try {
        const horario = await firstValueFrom(this.apiService.getDoctorHorarioById(this.selectedDoctorId).pipe(takeUntil(this.destroy$)));
        this.selectedMedicoHorario = horario;
        console.log('Horario del médico cargado (llamada separada):', this.selectedMedicoHorario); 
        const citas = await firstValueFrom(this.apiService.getAppointmentsPorMedico(this.selectedDoctorId).pipe(takeUntil(this.destroy$)));
        this.pendingAppointments = citas.filter(cita => cita.estado === 'p');
        console.log('Citas pendientes cargadas:', this.pendingAppointments);

        if (this.pendingAppointments.length === 0) {
          this.openModal('No hay citas pendientes para este médico.', 'success');
        }

        if (this.selectedMedicoHorario) {
          await this.calculateAndDisplayOccupancy(this.selectedDoctorId);
        } else {
          this.occupancyBarColor = 'gray';
          this.occupancyMessage = 'Horario del médico no disponible para cálculo de ocupación.';
          console.warn('Horario del médico es NULL o UNDEFINED. No se puede calcular la ocupación.');
        }

      } catch (error) {
        console.error('Error al cargar horario o citas del médico:', error);
        this.openModal('Error al cargar el horario o las citas del médico. Por favor, intenta de nuevo.', 'error');
        this.resetOccupancyBar(); 
      } finally {
        this.isLoading = false;
      }
    } else {
      this.selectedDoctorName = null;
      this.pendingAppointments = [];
      this.resetOccupancyBar();
    }
  }

  /**
   * Carga las citas confirmadas cuando se selecciona una especialidad.
   */
  async onSpecialtySelected(): Promise<void> {
    this.confirmedAppointmentsBySpecialty = [];
    this.closeModal(); 
    this.closeConfirmCancelModal(); 
    this.resetOccupancyBar(); 

    if (this.selectedSpecialtyId) {
      const selectedSpecialty = this.availableSpecialties.find(s => s.id === this.selectedSpecialtyId);
      this.selectedSpecialtyName = selectedSpecialty ? selectedSpecialty.nombre : null;

      this.isLoading = true;
      try {
        const citas = await firstValueFrom(this.apiService.getAppointmentsPorEspecialidad(this.selectedSpecialtyId).pipe(takeUntil(this.destroy$)));
        this.confirmedAppointmentsBySpecialty = citas.filter(cita => cita.estado === 'c');

        if (this.confirmedAppointmentsBySpecialty.length === 0) {
          this.openModal('No hay citas confirmadas para esta especialidad.', 'success');
        }
      } catch (error) {
        console.error('Error al cargar citas por especialidad:', error);
        this.openModal('Error al cargar las citas confirmadas para la especialidad. Por favor, intenta de nuevo.', 'error');
      } finally {
        this.isLoading = false;
      }
    } else {
      this.selectedSpecialtyName = null;
    }
  }

  /**
   * Confirma una cita, cambia el valor del estado a 'c'.
   */
  async confirmAppointment(): Promise<void> {
    if (!this.citaToConfirmCancel) return;

    this.isLoading = true;
    this.isConfirmCancelModalOpen = false; // Cerrar el modal de confirmación/cancelación
    try {
      // Asumimos que confirmarAppointment espera un objeto Cita
      await firstValueFrom(this.apiService.confirmarAppointment(this.citaToConfirmCancel).pipe(takeUntil(this.destroy$)));
      this.openModal('Cita confirmada correctamente.', 'success');
      // Recargar citas y ocupación
      if (this.filterMode === 'medico' && this.selectedDoctorId) {
        await this.onDoctorSelected(); // Llama a onDoctorSelected para recargar y recalcular
      } else if (this.filterMode === 'especialidad' && this.selectedSpecialtyId) {
        await this.onSpecialtySelected(); // Recarga las citas confirmadas por especialidad
      }
    } catch (error) {
      console.error('Error al confirmar la cita:', error);
      this.openModal('Error al confirmar la cita. Por favor, intenta de nuevo.', 'error');
    } finally {
      this.isLoading = false;
      this.citaToConfirmCancel = null; // Limpiar la cita de confirmación
      this.confirmCancelModalAction = '';
    }
  }

  /**
   * Cancela una cita cambiando el valor del estado a 'x'.
   */
  async cancelAppointment(): Promise<void> {
    if (!this.citaToConfirmCancel) return;

    this.isLoading = true;
    this.isConfirmCancelModalOpen = false; // Cerrar el modal de confirmación/cancelación
    try {
      // Asumimos que cancelAppointment espera un objeto Cita
      await firstValueFrom(this.apiService.cancelAppointment(this.citaToConfirmCancel).pipe(takeUntil(this.destroy$)));
      this.openModal('Cita cancelada correctamente.', 'success');
      // Recargar citas y ocupación
      if (this.filterMode === 'medico' && this.selectedDoctorId) {
        await this.onDoctorSelected(); // Llama a onDoctorSelected para recargar y recalcular
      } else if (this.filterMode === 'especialidad' && this.selectedSpecialtyId) {
        await this.onSpecialtySelected(); // Recarga las citas confirmadas por especialidad
      }
    } catch (error) {
      console.error('Error al cancelar la cita:', error);
      this.openModal('Error al cancelar la cita. Por favor, intenta de nuevo.', 'error');
    } finally {
      this.isLoading = false;
      this.citaToConfirmCancel = null; // Limpiar la cita de confirmación
      this.confirmCancelModalAction = '';
    }
  }

  /**
   * Lógica para calcular y mostrar la barra de ocupación.
   * Se basa en las horas laborables del médico en los próximos 30 días
   * y el número de citas confirmadas para ese período.
   */
  private async calculateAndDisplayOccupancy(medicoId: number): Promise<void> {
    // Esta verificación es crucial para evitar errores si el horario no está disponible.
    if (!this.selectedMedicoHorario || !this.selectedMedicoHorario.horaInicio || !this.selectedMedicoHorario.horaFin || !this.selectedMedicoHorario.dias) {
      this.resetOccupancyBar();
      console.warn('Datos de horario incompletos o no disponibles para cálculo de ocupación.');
      return;
    }

    const totalDays = 30; // Horizonte de 30 días para el cálculo
    const today = moment();
    const endDate = moment().add(totalDays - 1, 'days'); // Restar 1 para incluir el día actual en los 30 días

    // 1. Calcular Horas Laborales Totales
    let totalAvailableHours = 0;
    // Asegúrate de que 'dias' es una cadena como "1,2,3"
    const diasHabiles = this.selectedMedicoHorario.dias.split(',').map(Number).filter(day => !isNaN(day)); // Filtrar NaN

    for (let i = 0; i < totalDays; i++) {
      const currentDay = moment(today).add(i, 'days');
      const dayOfWeek = currentDay.isoWeekday(); // 1 para Lunes, 7 para Domingo

      if (diasHabiles.includes(dayOfWeek)) {
        const startMoment = moment(this.selectedMedicoHorario.horaInicio, 'HH:mm:ss'); // Usar HH:mm:ss para precisión si el backend lo envía así
        const endMoment = moment(this.selectedMedicoHorario.horaFin, 'HH:mm:ss');
        let dailyWorkingMinutes = endMoment.diff(startMoment, 'minutes');

        // Restar horas de descanso si aplica
        if (this.selectedMedicoHorario.descanso && this.selectedMedicoHorario.horaDescanso) {
          const descansoStartMoment = moment(this.selectedMedicoHorario.horaDescanso, 'HH:mm:ss');
          // Asumiendo que el descanso es de 1 hora (60 minutos) a partir de horaDescanso
          // O si horaDescanso es un rango como "HH:MM-HH:MM", necesitarías parsearlo.
          // Si es solo el inicio del descanso y dura 1 hora:
          const descansoEndMoment = moment(this.selectedMedicoHorario.horaDescanso, 'HH:mm:ss').add(1, 'hour');

          // Solo restar si el descanso cae dentro del horario laboral
          if (descansoStartMoment.isBetween(startMoment, endMoment, null, '[]') && descansoEndMoment.isBetween(startMoment, endMoment, null, '[]')) {
            dailyWorkingMinutes -= 60; // Restar 60 minutos por el descanso
          }
        }
        totalAvailableHours += (dailyWorkingMinutes / 60); // Convertir minutos a horas
      }
    }

    // Asegurarse de que totalAvailableHours no sea negativo o cero si no hay horas reales
    totalAvailableHours = Math.max(0, totalAvailableHours);

    // 2. Obtener Horas Ocupadas por Citas Confirmadas
    const fechaInicioStr = today.format('YYYY-MM-DD');
    const fechaFinStr = endDate.format('YYYY-MM-DD');

    let citasConfirmadasEnRango: Cita[] = [];
    try {
      // Usar el nuevo endpoint que filtra por rango de fechas
      citasConfirmadasEnRango = await firstValueFrom(this.apiService.getCitasConfirmadasMedicoEnRango(medicoId, fechaInicioStr, fechaFinStr)
                                       .pipe(takeUntil(this.destroy$)));
    } catch (error) {
      console.error('Error al obtener citas confirmadas para el rango:', error);
      this.resetOccupancyBar();
      return;
    }

    const occupiedHours = citasConfirmadasEnRango.length; // Cada cita ocupa 1 hora

    // 3. Determinar el Porcentaje de Ocupación y el Color
    if (totalAvailableHours <= 0) { // Si no hay horas disponibles, la barra es gris
      this.occupancyBarColor = 'gray';
      this.occupancyMessage = 'No hay horas laborales definidas para este médico en los próximos 30 días.';
      return;
    }

    const occupancyPercentage = (occupiedHours / totalAvailableHours) * 100;

    if (occupancyPercentage < 20) {
      this.occupancyBarColor = 'green';
      this.occupancyMessage = `Agenda totalmente libre: ${occupiedHours} de ${totalAvailableHours.toFixed(1)} horas ocupadas.`;
    } else if (occupancyPercentage >= 20 && occupancyPercentage < 75) {
      this.occupancyBarColor = 'yellow';
      this.occupancyMessage = `Agenda disponible: ${occupiedHours} de ${totalAvailableHours.toFixed(1)} horas ocupadas.`;
    } else {
      this.occupancyBarColor = 'red';
      this.occupancyMessage = `Agenda llena: ${occupiedHours} de ${totalAvailableHours.toFixed(1)} horas ocupadas.`;
    }
  }

  /**
   * Método para resetear la barra de ocupación.
   */
  private resetOccupancyBar(): void {
    this.occupancyBarColor = 'gray';
    this.occupancyMessage = 'Selecciona un médico para ver su ocupación.';
    this.selectedMedicoHorario = null;
  }

  /**
   * Descarga el reporte PDF de citas confirmadas para el médico seleccionado.
   */
  downloadPdfReport(): void {
    if (!this.selectedDoctorId) {
      this.openModal('Selecciona un médico para descargar el reporte.', 'error');
      return;
    }

    this.isLoading = true;
    const doctorNameForFilename = this.selectedDoctorName ? this.selectedDoctorName.replace(/ /g, '_') : this.selectedDoctorId;
    this.apiService.downloadConfirmedPdfReportByMedico(this.selectedDoctorId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: Blob) => {
        const fileURL = URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = `reporte_citas_confirmadas_Dr_${doctorNameForFilename}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(fileURL);
        this.openModal('Reporte PDF por médico descargado correctamente.', 'success');
      },
      error: (error) => {
        console.error('Error al descargar el PDF por médico:', error);
        this.openModal('Error al descargar el reporte PDF por médico. Por favor, intenta de nuevo.', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Descarga el reporte PDF de citas confirmadas para la especialidad seleccionada.
   */
  downloadPdfReportBySpecialty(): void {
    if (!this.selectedSpecialtyId) {
      this.openModal('Selecciona una especialidad para descargar el reporte.', 'error');
      return;
    }

    this.isLoading = true;
    const specialtyNameForFilename = this.selectedSpecialtyName ? this.selectedSpecialtyName.replace(/ /g, '_') : this.selectedSpecialtyId;
    this.apiService.downloadConfirmedPdfReportByEspecialidad(this.selectedSpecialtyId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: Blob) => {
        const fileURL = URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = `reporte_citas_confirmadas_Especialidad_${specialtyNameForFilename}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(fileURL);
        this.openModal('Reporte PDF por especialidad descargado correctamente.', 'success');
      },
      error: (error) => {
        console.error('Error al descargar el PDF por especialidad:', error);
        this.openModal('Error al descargar el reporte PDF por especialidad. Por favor, intenta de nuevo.', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Abre el modal de mensajes generales.
   * @param message Mensaje a mostrar.
   * @param type Tipo de mensaje ('success' o 'error').
   */
  openModal(message: string, type: 'success' | 'error'): void {
    this.modalMessage = message;
    this.modalType = type;
    this.isModalOpen = true;
  }

  /**
   * Cierra el modal de mensajes generales.
   */
  closeModal(): void {
    this.isModalOpen = false;
    this.modalMessage = '';
    this.modalType = '';
  }

  /**
   * Abre el modal de confirmación/cancelación de cita.
   * @param action Acción a realizar ('confirm' o 'cancel').
   * @param cita Cita sobre la que se actuará.
   */
  openConfirmCancelModal(action: 'confirm' | 'cancel', cita: Cita): void {
    this.confirmCancelModalAction = action;
    this.citaToConfirmCancel = cita;
    this.isConfirmCancelModalOpen = true; // Abrir el modal específico
  }

  /**
   * Cierra el modal de confirmación/cancelación de cita.
   */
  closeConfirmCancelModal(): void {
    this.isConfirmCancelModalOpen = false;
    this.citaToConfirmCancel = null;
    this.confirmCancelModalAction = '';
  }
}