import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../../core/services/api.service';
import { Especialidad } from '../../../models/especialidad.model';
import { Medico } from '../../../models/medico.model';
import { Horario } from '../../../models/horario.model';
import { Cita } from '../../../models/cita.model';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';
import 'moment/locale/es';
import { Paciente } from '../../../models/paciente.model';

@Component({
  selector: 'app-appointment-request',
  templateUrl: './appointment-request.component.html',
  styleUrls: ['./appointment-request.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe]
})
export class AppointmentRequestComponent implements OnInit, OnDestroy {
  currentStep: number = 1;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  selectedSpecialty: Especialidad | null = null;
  availableSpecialties: Especialidad[] = [];

  selectedDoctorId: number = 0; // ¡Ahora sí, number!
  availableDoctors: Medico[] = [];
  selectedDoctorObject: Medico | null = null; // Guardará el objeto completo del médico

  selectedDate: string | null = null;
  minDate: string = '';
  maxDate: string = '';

  availableTimeSlots: string[] = [];
  selectedTime: string | null = null;

  // Ya no necesitamos 'private doctorSchedule: Horario | null;' separado,
  // porque el horario viene dentro del objeto 'Medico'
  // private doctorAppointments: string[] = []; // Ya no se usa directamente aquí, se procesa en generateAvailableTimeSlots
  // private parsedDoctorDays: number[] = []; // Se procesa directamente en generateAvailableTimeSlots

  // currentUserId: string | null = null; // ¡Recordatorio: Esto vendrá de tu Auth REST!

  private destroy$ = new Subject<void>();

  constructor(private apiService: ApiService) {
    // Las fechas min/max se inicializarán en ngOnInit con moment
  }
  loggedInPatient: Paciente | null = null; // Aquí deberías obtener el paciente logueado, por ejemplo desde AuthService
  ngOnInit(): void {
    moment.locale('es');
    this.setMinMaxDates();
    this.loadSpecialties();
    // Aquí es donde deberías obtener el ID del usuario logueado
    // Por ejemplo, si usas un servicio de autenticación con JWT:
    // this.authService.getLoggedInUserId().subscribe(id => this.currentUserId = id);
    const storedPatient = localStorage.getItem('paciente'); // o la clave que uses
    if (storedPatient) {
      try {
        const pacienteObj = JSON.parse(storedPatient);
        // Por ejemplo, si el paciente tiene un campo 'nombre'
        this.loggedInPatient = pacienteObj;
      } catch (error) {
        console.error('Error al parsear paciente del localStorage:', error);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Establece las fechas mínima y máxima para el input de fecha.
   */
  setMinMaxDates(): void {
    const today = moment();
    this.minDate = today.format('YYYY-MM-DD');
    this.maxDate = today.add(2, 'months').format('YYYY-MM-DD'); // Citas hasta 2 meses en el futuro
  }

  /**
   * Carga las especialidades desde el servidor REST usando ApiService.
   */
  async loadSpecialties(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    try {
      this.availableSpecialties = await firstValueFrom(this.apiService.getEspecialidades().pipe(takeUntil(this.destroy$))) || [];
      if (this.availableSpecialties.length === 0) {
        this.errorMessage = 'No se encontraron especialidades disponibles.';
      }
      console.log('Especialidades cargadas:', this.availableSpecialties);
    } catch (error) {
      console.error('Error al cargar especialidades:', error);
      this.errorMessage = 'Error al cargar especialidades. Por favor, intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Avanza al siguiente paso del formulario.
   */
  async nextStep(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;

    switch (this.currentStep) {
      case 1: // Especialidad seleccionada
        if (!this.selectedSpecialty) {
          this.errorMessage = 'Por favor, selecciona una especialidad.';
          return;
        }
        await this.loadDoctorsBySpecialty(this.selectedSpecialty.nombre);
        if (this.errorMessage) { // Si loadDoctorsBySpecialty setea un error (ej. no hay médicos)
          return; // No avanzar
        }
        this.currentStep++;
        break;
      case 2: // Médico seleccionado
        if (this.selectedDoctorId === null) {
          this.errorMessage = 'Por favor, selecciona un médico.';
          return;
        }
        // Buscar el objeto completo del médico seleccionado
        this.selectedDoctorObject = this.availableDoctors.find(d => d.personalID === this.selectedDoctorId) || null;
        if (!this.selectedDoctorObject) {
          this.errorMessage = 'Médico seleccionado no encontrado. Por favor, selecciona de nuevo.';
          return;
        }
        console.log('Médico seleccionado:', this.selectedDoctorObject);
         // Aseguramos que el ID esté actualizado
        // No verifiques el horario aquí, lo obtendrás en el paso 3
        this.currentStep++;
        break;

      case 3: // Fecha seleccionada
    console.log('Obteniendo horario del médico:', this.selectedDoctorObject);
    if (!this.selectedDoctorObject) {
        this.errorMessage = 'Por favor, selecciona un médico antes de elegir una fecha.';
        return;
    }
    if (!this.selectedDate) {
        this.errorMessage = 'Por favor, selecciona una fecha.';
        return;
    }

    console.log('ID del médico seleccionado:', this.selectedDoctorObject.personalID);

    // Obtener el horario actualizado del médico antes de generar los slots
    try {
        const doctorHorario = await firstValueFrom(this.apiService.getDoctorGeneralHorario(this.selectedDoctorObject.personalID));
        
        // Actualizar el horario solo si el objeto todavía existe
        if (this.selectedDoctorObject) {
            this.selectedDoctorObject.horario = doctorHorario;
        } else {
            this.errorMessage = 'El médico seleccionado ya no está disponible.';
            return;
        }

        await this.generateAvailableTimeSlots();
        if (this.errorMessage) {
            return;
        }
        this.currentStep++;
    } catch (error) {
        this.errorMessage = 'Error al obtener el horario del médico.';
        console.error('Error fetching doctor schedule:', error);
    }
    break;
      case 4: // Hora seleccionada
        if (!this.selectedTime) {
          this.errorMessage = 'Por favor, selecciona una hora.';
          return;
        }
        this.currentStep++;
        break;
      case 5: // Confirmar cita (no hay 'siguiente' aquí)
        break;
    }
  }

  /**
   * Retrocede al paso anterior.
   */
  prevStep(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.currentStep--;
    if (this.currentStep === 1) {
      this.selectedDoctorId = 0;
      this.selectedDoctorObject = null;
      this.availableDoctors = [];
      this.selectedDate = null;
      this.availableTimeSlots = [];
      this.selectedTime = null;
    } else if (this.currentStep === 2) {
      this.selectedDate = null;
      this.availableTimeSlots = [];
      this.selectedTime = null;
    } else if (this.currentStep === 3) {
      this.availableTimeSlots = [];
      this.selectedTime = null;
    }
  }

  /**
   * Carga los médicos disponibles para la especialidad seleccionada.
   * @param specialtyName El nombre de la especialidad.
   */
  async loadDoctorsBySpecialty(specialtyName: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    this.availableDoctors = []; // ¡Limpiar SIEMPRE antes de cargar nuevos!
    this.selectedDoctorId = 0; // Limpiar la selección de médico
    this.selectedDoctorObject = null; // Limpiar el objeto médico
    try {
      const doctors = await firstValueFrom(this.apiService.getMedicosByEspecialidad(specialtyName).pipe(takeUntil(this.destroy$)));
      this.availableDoctors = doctors || [];
      if (this.availableDoctors.length === 0) {
        this.errorMessage = 'No hay médicos disponibles para esta especialidad.';
      }
    } catch (error) {
      console.error('Error al cargar médicos por especialidad:', error);
      this.errorMessage = 'Error al cargar médicos para esta especialidad. Por favor, intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Maneja el cambio de fecha en el input.
   * @param event El evento de cambio.
   */
  onDateChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.selectedDate = inputElement.value;
    this.errorMessage = null;
    this.availableTimeSlots = [];
    this.selectedTime = null;
  }

  /**
   * Genera los bloques de tiempo disponibles para la fecha seleccionada
   * basándose en el horario del médico y las citas confirmadas.
   */
  async generateAvailableTimeSlots(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    this.availableTimeSlots = [];
    if (!this.selectedDoctorId || !this.selectedDate || !this.selectedDoctorObject?.horario) {
      this.errorMessage = 'Información incompleta para generar slots de tiempo (médico, fecha o horario).';
      this.isLoading = false;
      return;
    }

    try {
      const selectedMomentDate = moment(this.selectedDate);
      const dayOfWeek = selectedMomentDate.isoWeekday(); // 1 (Lunes) - 7 (Domingo)
      const doctorHorario = this.selectedDoctorObject.horario; // Acceder directamente al horario del médico

      // Verificar si el médico trabaja este día
      const diasHabiles = doctorHorario.dias.split(',').map(Number);
      if (!diasHabiles.includes(dayOfWeek)) {
        this.errorMessage = 'El médico seleccionado no trabaja en esta fecha.';
        this.isLoading = false;
        return;
      }

      // Obtener las citas ya agendadas/confirmadas para este médico en esta fecha
      const citasAgendadas = await firstValueFrom(
        this.apiService.getDisponibilidadPorFecha(this.selectedDoctorObject.personalID, this.selectedDate)
          .pipe(takeUntil(this.destroy$))
      );
      const occupiedTimes = new Set(citasAgendadas.map(cita => cita));

      // Generar todos los slots posibles basados en el horario del médico
      const startHour = moment(doctorHorario.horaInicio, 'HH:mm:ss');
      const endHour = moment(doctorHorario.horaFin, 'HH:mm:ss');

      let currentHour = moment(startHour);
      while (currentHour.isBefore(endHour)) {
        const slot = currentHour.format('HH:mm:ss'); // Formato para comparación con backend
        const displaySlot = currentHour.format('HH:mm'); // Formato para mostrar en UI

        // Verificar descanso si aplica
        let isDuringBreak = false;
        if (doctorHorario.descanso && doctorHorario.horaDescanso) {
          const descansoStart = moment(doctorHorario.horaDescanso, 'HH:mm:ss');
          const descansoEnd = moment(descansoStart).add(1, 'hour'); // Asumiendo 1 hora de descanso

          if (currentHour.isBetween(descansoStart, descansoEnd, null, '[)')) {
            isDuringBreak = true;
          }
        }

        if (!occupiedTimes.has(slot) && !isDuringBreak) {
          this.availableTimeSlots.push(displaySlot);
        }
        currentHour.add(1, 'hour'); // Asumiendo citas de 1 hora
      }

      if (this.availableTimeSlots.length === 0) {
        this.errorMessage = 'No hay horas disponibles para este día o el médico está completamente ocupado.';
      }

    } catch (error) {
      console.error('Error al generar slots de tiempo:', error);
      this.errorMessage = 'Error al generar los horarios disponibles. Por favor, intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Registra la cita en el backend REST.
   */
  async registerAppointment(): Promise<void> {
  this.isLoading = true;
  this.errorMessage = null;
  this.successMessage = null;

  if (!this.selectedSpecialty || !this.selectedDoctorObject || !this.selectedDate || !this.selectedTime) {
    this.errorMessage = 'Por favor, completa todos los pasos antes de confirmar la cita.';
    this.isLoading = false;
    return;
  }

  if (!this.loggedInPatient || typeof this.loggedInPatient.id !== 'number') {
    this.errorMessage = 'Paciente no válido o no logueado correctamente.';
    this.isLoading = false;
    return;
  }

  try {
    const appointmentDTOToSend: Cita = {
      fecha: this.selectedDate,
      hora: this.selectedTime + ':00',
      estado: 'p',
      especialidad: this.selectedSpecialty,
      medico: this.selectedDoctorObject,
      paciente: { id: this.loggedInPatient.id, nombre: this.loggedInPatient.nombre }
    };

    await firstValueFrom(this.apiService.registerAppointment(appointmentDTOToSend).pipe(takeUntil(this.destroy$)));

    this.successMessage = 'Cita solicitada con éxito. Espera la confirmación.';
    this.resetForm();
  } catch (error: any) {
    console.error('Error al registrar la cita:', error);
    const backendErrorMessage = error.error?.message || error.error || 'Error desconocido al registrar la cita.';
    this.errorMessage = `Error al registrar la cita: ${backendErrorMessage}`;
  } finally {
    this.isLoading = false;
  }
}


  /**
   * Reinicia el formulario a su estado inicial.
   */
  resetForm(): void {
    this.currentStep = 1;
    this.selectedSpecialty = null;
    this.selectedDoctorId = 0;
    this.selectedDoctorObject = null;
    this.selectedDate = null;
    this.selectedTime = null;
    this.availableDoctors = [];
    this.availableTimeSlots = [];
    this.errorMessage = null;
    this.successMessage = null;
    this.isLoading = false;
    this.loadSpecialties(); // Recargar especialidades para empezar de nuevo
  }
}