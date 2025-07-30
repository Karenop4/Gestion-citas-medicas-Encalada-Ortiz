import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Medico } from '../../../models/medico.model';
import { Horario } from '../../../models/horario.model';
import moment from 'moment'; 

const DAYS_OF_WEEK = [
  { id: 1, name: 'Lunes', short: 'Lun' },
  { id: 2, name: 'Martes', short: 'Mar' },
  { id: 3, name: 'Miércoles', short: 'Mié' },
  { id: 4, name: 'Jueves', short: 'Jue' },
  { id: 5, name: 'Viernes', short: 'Vie' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
  { id: 7, name: 'Domingo', short: 'Dom' },
];
const AVAILABLE_HOURS = Array.from({ length: 24 }, (_, i) => i);

@Component({
  selector: 'app-schedule-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-management.component.html',
  styleUrls: ['./schedule-management.component.css']
})
export class ScheduleManagementComponent implements OnInit {
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  modalMessage: string = '';
  modalType: 'success' | 'error' | '' = '';
  availableDoctors: Medico[] = [];
  selectedDoctorId: number | null = null;
  selectedDoctorName: string | null = null;
  doctorSchedule: Horario | null = null; 
  private destroy$ = new Subject<void>();

  selectedDays: number[] = [];
  selectedStartHour: number | null = null;
  selectedEndHour: number | null = null;

  daysOfWeekOptions = DAYS_OF_WEEK;
  availableHoursOptions = AVAILABLE_HOURS;
  selectedDescansoHour: number | null = null; // Cambiado a number para coincidir con el select
  tieneDescanso: boolean = false; // Inicializa a false

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  /**
   * Carga todos los usuarios marcados como médicos desde Firestore.
   */
  async loadDoctors(): Promise<void> {
    try{
    this.isLoading = true;
    this.availableDoctors = await firstValueFrom(this.apiService.getMedicos().pipe(takeUntil(this.destroy$))) || [];
    }
    catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      this.openModal('Error al cargar datos iniciales. Por favor, intenta de nuevo.', 'error');
    } finally {
      this.isLoading = false;
    }
  
  }

  /**
   * Se ejecuta cuando se selecciona un médico del menú desplegabl.
   * Carga el horario de ese médico y lo prepara para edición.
   */
  async onDoctorSelected(): Promise<void> {
    this.doctorSchedule = null;
    this.selectedDays = [];
    this.selectedStartHour = null;
    this.selectedEndHour = null;
    this.selectedDescansoHour = null;
    this.tieneDescanso = false;

    if (this.selectedDoctorId) {
       const doctorIdNum = Number(this.selectedDoctorId);
      const selectedDoctor = this.availableDoctors.find(d => d.id === doctorIdNum);
      this.selectedDoctorName = selectedDoctor ? selectedDoctor.nombre : null;
      await this.loadDoctorSchedule(doctorIdNum);
    } else {
      this.selectedDoctorName = null;
      console.log('Ningún médico seleccionado, nombre reseteado a null.');
    }
  }

  /**
   * Carga el horario para el médico seleccionado.
   * @param doctorId El ID del médico.
   */
  async loadDoctorSchedule(doctorId: number): Promise<void> {
    this.isLoading = true;
    this.doctorSchedule = null; // Resetear antes de cargar
    this.selectedDays = [];
    this.selectedStartHour = null;
    this.selectedEndHour = null;
    this.selectedDescansoHour = null;
    this.tieneDescanso = false;

    try {
      // Lógica REST: obtener horario del médico desde el backend
      const horario = await firstValueFrom(this.apiService.getDoctorHorarioById(doctorId).pipe(takeUntil(this.destroy$)));
      this.doctorSchedule = horario; // Asigna el horario completo

      // Rellenar el formulario con los datos del horario cargado
      this.selectedDays = this.parseDaysForEdit(horario.dias);

      // Parsear horas de string "HH:MM:SS" a number (solo la hora)
      const startHourNum = parseInt(horario.horaInicio.split(':')[0], 10);
      const endHourNum = parseInt(horario.horaFin.split(':')[0], 10);

      if (!isNaN(startHourNum) && !isNaN(endHourNum) && startHourNum < endHourNum) {
        this.selectedStartHour = startHourNum;
        this.selectedEndHour = endHourNum;
      } else {
        this.openModal('El horario cargado es inválido: la hora de inicio no es menor que la hora de fin. Por favor, corrige el horario.', 'error');
        this.doctorSchedule = null; // Invalida el horario si es inconsistente
        this.selectedStartHour = null;
        this.selectedEndHour = null;
      }

      this.tieneDescanso = horario.descanso;
      if (horario.descanso && horario.horaDescanso) {
        const descansoHourNum = parseInt(horario.horaDescanso.split(':')[0], 10);
        if (!isNaN(descansoHourNum)) {
          this.selectedDescansoHour = descansoHourNum;
        }
      }

    } catch (error: any) { // Captura el error para verificar si es 404
      if (error.status === 404) {
        this.openModal('Este médico no tiene un horario registrado. Puedes crear uno.', 'success'); // Es un "éxito" que no haya horario para crear uno nuevo
        this.doctorSchedule = null; // Asegurarse de que no haya horario cargado
      } else {
        console.error('Error al cargar el horario:', error);
        this.openModal('Error al cargar el horario. Intenta de nuevo.', 'error');
      }
      this.selectedStartHour = null;
      this.selectedEndHour = null;
      this.selectedDescansoHour = null;
      this.tieneDescanso = false;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Guarda el horario editado/creado en el backend.
   */
  async saveSchedule(): Promise<void> {
    if (!this.selectedDoctorId || this.selectedDays.length === 0 || this.selectedStartHour === null || this.selectedEndHour === null) {
      this.openModal('Por favor, selecciona un médico y completa todos los campos del horario.', 'error');
      return;
    }
    if (this.selectedStartHour >= this.selectedEndHour) {
      this.openModal('Error al guardar: la hora de fin debe ser posterior a la hora de inicio.', 'error');
      return;
    }
    if (this.tieneDescanso && this.selectedDescansoHour === null) {
      this.openModal('Si tiene descanso, por favor selecciona la hora de descanso.', 'error');
      return;
    }

    this.isLoading = true;

    // Construir el objeto Horario para enviar al backend
    const horarioData: Horario = {
      // Si doctorSchedule existe y tiene ID, lo usamos para actualizar
      id: this.doctorSchedule ? this.doctorSchedule.id : undefined, // undefined para que no se envíe si es nuevo
      descanso: this.tieneDescanso,
      dias: this.formatDaysForFirestore(this.selectedDays),
      // Formatear las horas a "HH:MM:SS"
      horaInicio: this.formatHourToHHMMSS(this.selectedStartHour),
      horaFin: this.formatHourToHHMMSS(this.selectedEndHour),
      horaDescanso: this.tieneDescanso && this.selectedDescansoHour !== null
                    ? this.formatHourToHHMMSS(this.selectedDescansoHour)
                    : null,
    };

    try {
      const savedHorario = await firstValueFrom(this.apiService.saveHorario(horarioData, this.selectedDoctorId).pipe(takeUntil(this.destroy$)));
      this.doctorSchedule = savedHorario; // Actualiza el horario mostrado con la respuesta del backend
      this.openModal('Horario guardado con éxito!', 'success');
    } catch (error) {
      console.error('Error al guardar el horario:', error);
      this.openModal('Error al guardar el horario. Intenta de nuevo.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  private formatHourToHHMMSS(hour: number): string {
    const h = hour < 10 ? '0' + hour : hour;
    return `${h}:00:00`;
  }

  /**
   * Maneja el cambio de estado de los checkboxes de días.
   * @param event El evento de cambio del checkbox.
   */
  onDayCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const dayId = parseInt(checkbox.value, 10);
    if (checkbox.checked) {
      if (!this.selectedDays.includes(dayId)) {
        this.selectedDays.push(dayId);
      }
    } else {
      this.selectedDays = this.selectedDays.filter(id => id !== dayId);
    }
    this.selectedDays.sort((a, b) => a - b);
  }

  /**
   * Convierte una cadena de días de Firestore ("1,2,3" o "1-5") a un array de números.
   * Ajustado para manejar el formato "2,3,4" que ahora usas.
   * @param diasString La cadena de días de Firestore.
   * @returns Un array de IDs de días.
   */
  parseDaysForEdit(diasString: string): number[] {
    if (!diasString) return [];
    // Si tu backend ahora siempre devuelve "1,2,3", esta simplificación es suficiente.
    // Si aún puede devolver "1-5", necesitarías la lógica de rango.
    return diasString.split(',').map(Number).filter(n => !isNaN(n));
  }

  /**
   * Convierte un array de IDs de días a una cadena para Firestore ("1,2,3").
   * @param daysArray El array de IDs de días.
   * @returns La cadena formateada para Firestore.
   */
  formatDaysForFirestore(daysArray: number[]): string {
    return daysArray.sort((a, b) => a - b).join(',');
  }

  /**
   * Formatea un array de IDs de días para mostrarlo con sus nombres.
   * @param diasString La cadena de días de Firestore (ej. "1,2,3").
   * @returns Una cadena legible.
   */
  formatDaysForDisplay(diasString: string): string {
    const days = this.parseDaysForEdit(diasString);
    if (days.length === 0) return 'No definido';

    // Lógica para agrupar días consecutivos (ej. Lunes a Viernes) si lo deseas
    // Esta lógica es útil si tu backend puede guardar rangos como "1-5"
    // Pero si siempre es "1,2,3,4,5", puedes simplificarla.
    // Mantengo la lógica de rango por si acaso la necesitas en el futuro.
    const sortedDays = [...days].sort((a, b) => a - b);
    let formattedParts: string[] = [];
    let currentRange: number[] = [];

    for (let i = 0; i < sortedDays.length; i++) {
        currentRange.push(sortedDays[i]);
        if (i + 1 < sortedDays.length && sortedDays[i+1] === sortedDays[i] + 1) {
            // Continúa el rango
        } else {
            // Fin del rango o día individual
            if (currentRange.length >= 3 && currentRange[currentRange.length - 1] - currentRange[0] + 1 === currentRange.length) {
                // Es un rango de 3 o más días consecutivos
                const startDayName = DAYS_OF_WEEK.find(d => d.id === currentRange[0])?.short;
                const endDayName = DAYS_OF_WEEK.find(d => d.id === currentRange[currentRange.length - 1])?.short;
                if (startDayName && endDayName) {
                    formattedParts.push(`${startDayName}-${endDayName}`);
                } else {
                    formattedParts.push(currentRange.map(id => DAYS_OF_WEEK.find(d => d.id === id)?.short || `D${id}`).join(', '));
                }
            } else {
                // Días individuales o rangos pequeños
                formattedParts.push(currentRange.map(id => DAYS_OF_WEEK.find(d => d.id === id)?.name || `Día ${id}`).join(', '));
            }
            currentRange = []; // Reiniciar para el próximo rango
        }
    }
    return formattedParts.join(', ');
  }

  /**
   * Formatea una cadena de horas de Firestore ("09:00:00-17:00:00") para mostrarla de forma adecuada.
   * @param horasString La cadena de horas de Firestore.
   * @returns Una cadena legible.
   */
  formatHoursForDisplay(horasString: string): string {
    if (!horasString || !horasString.includes('-')) return 'No definido';
    const [startStr, endStr] = horasString.split('-');
    // Asumiendo que startStr y endStr son "HH:MM:SS"
    const startMoment = moment(startStr, 'HH:mm:ss');
    const endMoment = moment(endStr, 'HH:mm:ss');

    if (!startMoment.isValid() || !endMoment.isValid()) return 'Formato de hora inválido';

    return `De ${startMoment.format('HH:mm')} a ${endMoment.format('HH:mm')}`;
  }
  /**
   * Formatea una única cadena de hora de Firestore ("HH:MM:SS") para mostrarla de forma adecuada.
   * @param hourString La cadena de hora de Firestore (ej. "13:00:00").
   * @returns Una cadena legible (ej. "13:00").
   */
  formatSingleHourForDisplay(hourString: string): string {
    if (!hourString) return 'No definido';
    const hourMoment = moment(hourString, 'HH:mm:ss');
    if (!hourMoment.isValid()) return 'Formato de hora inválido';
    return hourMoment.format('HH:mm');
  }

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