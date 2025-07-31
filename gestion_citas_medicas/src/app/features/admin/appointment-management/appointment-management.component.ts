import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { Cita } from '../../../models/cita.model'; 
import { Medico } from '../../../models/medico.model'; 
import { Especialidad } from '../../../models/especialidad.model'; 
import { Horario } from '../../../models/horario.model'; 
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';
import 'moment/locale/es'; 

@Component({
  selector: 'app-appointment-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './appointment-management.component.html',
  styleUrls: ['./appointment-management.component.css']
})
export class AppointmentManagementComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  isModalOpen: boolean = false; 
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

  occupancyBarColor: string = 'gray'; 
  occupancyMessage: string = 'Selecciona un médico para ver su ocupación.';
  private selectedMedicoHorario: Horario | null = null; 

  // Variables para el modal de confirmación/cancelación de cita
  isConfirmCancelModalOpen: boolean = false;
  citaToConfirmCancel: Cita | null = null;
  confirmCancelModalAction: 'confirm' | 'cancel' | '' = '';

  // Para desuscribirse de Observables
  private destroy$ = new Subject<void>();

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    moment.locale('es'); 
    this.loadInitialData(); 
  }

  ngOnDestroy(): void {
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }

  /**
   * Carga datos iniciales (médicos y especialidades).
   */
  async loadInitialData(): Promise<void> {
    this.isLoading = true;
    try {
      this.availableDoctors = await firstValueFrom(this.apiService.getMedicos().pipe(takeUntil(this.destroy$))) || [];
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
      this.resetOccupancyBar(); // También resetear al cambiar a especialidad
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
      this.occupancyMessage = "Calculando ocupación del médico..."; 

      try {
        const horario = await firstValueFrom(this.apiService.getDoctorGeneralHorario(this.selectedDoctorId).pipe(takeUntil(this.destroy$)));
        this.selectedMedicoHorario = horario;
        console.log('Horario del médico cargado (llamada separada):', this.selectedMedicoHorario); 

        const citas = await firstValueFrom(this.apiService.getAppointmentsPorMedico(this.selectedDoctorId).pipe(takeUntil(this.destroy$)));
        this.pendingAppointments = citas.filter(cita => cita.estado === 'p');
        console.log('Citas pendientes cargadas:', this.pendingAppointments);

        // Si tenemos un médico seleccionado, calculamos y mostramos la ocupación.
        // No es estrictamente necesario que haya horario, pero lo usas para el mensaje descriptivo.
        await this.calculateAndDisplayOccupancy(this.selectedDoctorId);

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
    this.resetOccupancyBar(); // Reiniciar también al cambiar de especialidad

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
   * Lógica para calcular y mostrar la barra de ocupación según la nueva definición.
   * Total de citas confirmadas en 30 días = 100%.
   * Porcentaje del médico = (Citas confirmadas del médico en 30 días / Total de citas confirmadas en 30 días) * 100.
   */
  private async calculateAndDisplayOccupancy(medicoId: number): Promise<void> {
    this.occupancyMessage = "Calculando ocupación...";
    this.occupancyBarColor = 'gray'; // Reset temporalmente

    const totalDays = 30;
    const today = moment();
    const endDate = moment().add(totalDays - 1, 'days'); // Rango de 30 días incluyendo hoy

    const fechaInicioStr = today.format('YYYY-MM-DD');
    const fechaFinStr = endDate.format('YYYY-MM-DD');

    let totalConfirmedAppointmentsSystem: Cita[] = [];
    let doctorConfirmedAppointments: Cita[] = [];

    try {
      // 1. Obtener todas las citas confirmadas del sistema en los próximos 30 días (el 100%)
      totalConfirmedAppointmentsSystem = await firstValueFrom(
        this.apiService.getAllConfirmedAppointmentsInDateRange(fechaInicioStr, fechaFinStr)
          .pipe(takeUntil(this.destroy$))
      );

      // 2. Obtener las citas confirmadas del médico seleccionado en los próximos 30 días
      doctorConfirmedAppointments = await firstValueFrom(
        this.apiService.getCitasConfirmadasMedicoEnRango(medicoId, fechaInicioStr, fechaFinStr)
          .pipe(takeUntil(this.destroy$))
      );

    } catch (error) {
      this.openModal('Error al obtener citas para el cálculo de ocupación. Por favor, intenta de nuevo.', 'error');
      this.resetOccupancyBar();
      return;
    }

    const totalSystemAppointmentsCount = totalConfirmedAppointmentsSystem.length;
    const doctorAppointmentsCount = doctorConfirmedAppointments.length;

    let occupancyPercentage = 0;

    if (totalSystemAppointmentsCount > 0) {
      occupancyPercentage = (doctorAppointmentsCount / totalSystemAppointmentsCount) * 100;
    }

    // Formatear el porcentaje a un número entero
    const displayPercentage = Math.round(occupancyPercentage);

    // Determinar el color y el mensaje
    if (displayPercentage < 20) {
      this.occupancyBarColor = 'green';
      this.occupancyMessage = `Ocupación: ${displayPercentage}% (Citas: ${doctorAppointmentsCount})`; // Mensaje ajustado
    } else if (displayPercentage >= 20 && displayPercentage <= 50) { 
      this.occupancyBarColor = 'yellow';
      this.occupancyMessage = `Ocupación: ${displayPercentage}% (Citas: ${doctorAppointmentsCount})`; // Mensaje ajustado
    } else { // Porcentaje > 50%
      this.occupancyBarColor = 'red';
      this.occupancyMessage = `Ocupación: ${displayPercentage}% (Citas: ${doctorAppointmentsCount})`; // Mensaje ajustado
    }
  }

  private resetOccupancyBar(): void {
    this.occupancyBarColor = 'gray';
    this.occupancyMessage = 'Selecciona un médico para ver su ocupación.';
    this.selectedMedicoHorario = null; // Reinicia el horario también
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