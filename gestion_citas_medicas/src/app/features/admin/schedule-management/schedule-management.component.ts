import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, query, where, getDocs, doc, getDoc, setDoc } from '@angular/fire/firestore';

interface Doctor {
  id: string;
  nombre: string;
  especialidad: string;
  esMedico: boolean;
}

interface Schedule {
  dias: string; 
  horas: string; 
}

// Para conversion  de numeros de dia a nombre
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
  availableDoctors: Doctor[] = [];
  selectedDoctorId: string | null = null;
  selectedDoctorName: string | null = null;
  doctorSchedule: Schedule | null = null; 

  selectedDays: number[] = [];
  selectedStartHour: number | null = null;
  selectedEndHour: number | null = null;

  daysOfWeekOptions = DAYS_OF_WEEK;
  availableHoursOptions = AVAILABLE_HOURS;

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  /**
   * Carga todos los usuarios marcados como médicos desde Firestore.
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

      this.isLoading = false;
    } catch (error) {
      this.openModal('No se pudieron cargar los médicos. Por favor, intenta de nuevo.', 'error');
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

    if (this.selectedDoctorId) {
      const selectedDoctor = this.availableDoctors.find(d => d.id === this.selectedDoctorId);
      this.selectedDoctorName = selectedDoctor ? selectedDoctor.nombre : null;
      await this.loadDoctorSchedule(this.selectedDoctorId);
    } else {
      this.selectedDoctorName = null;
    }
  }

  /**
   * Carga el documento de horario para el médico seleccionado.
   * @param doctorId El ID del médico.
   */
  async loadDoctorSchedule(doctorId: string): Promise<void> {
    this.isLoading = true;
    try {
      const scheduleDocRef = doc(this.firestore, `usuarios/${doctorId}/horario/horario_doc`);
      const scheduleDocSnap = await getDoc(scheduleDocRef);

      if (scheduleDocSnap.exists()) {
        const scheduleData = scheduleDocSnap.data();
        if (scheduleData && typeof scheduleData['dias'] === 'string' && typeof scheduleData['horas'] === 'string') {
          this.doctorSchedule = scheduleData as Schedule;

          this.selectedDays = this.parseDaysForEdit(this.doctorSchedule.dias);
          const parsedHours = this.parseHoursForEdit(this.doctorSchedule.horas);

          if (parsedHours.start !== null && parsedHours.end !== null && parsedHours.start < parsedHours.end) {
            this.selectedStartHour = parsedHours.start;
            this.selectedEndHour = parsedHours.end;
          } else {
            this.openModal('El horario cargado es inválido: la hora de inicio no es menor que la hora de fin. Por favor, corrige el horario.', 'error');
            this.doctorSchedule = null;
            this.selectedStartHour = null;
            this.selectedEndHour = null; 
          }
        } else {
          this.openModal('El horario del médico está incompleto o es incorrecto.', 'error'); 
          this.doctorSchedule = null;
          this.selectedStartHour = null; 
          this.selectedEndHour = null;
        }
      } else {
        this.doctorSchedule = null;
        this.selectedStartHour = null;
        this.selectedEndHour = null; 
      }
      this.isLoading = false;
    } catch (error) {
      this.openModal('Error al cargar el horario. Intenta de nuevo.', 'error'); 
      this.isLoading = false;
    }
  }

  /**
   * Guarda el horario editado en Firestore para el médico seleccionado.
   */
  async saveSchedule(): Promise<void> {
    if (!this.selectedDoctorId || this.selectedDays.length === 0 || this.selectedStartHour === null || this.selectedEndHour === null) {
      this.openModal('Por favor, selecciona un médico y completa todos los campos del horario.', 'error'); 
      return;
    }

    // Validar que la hora de fin sea posterior a la hora de inicio
    if (+this.selectedStartHour >= +this.selectedEndHour) { 
      this.openModal('Error al guardar: la hora de fin debe ser posterior a la hora de inicio.', 'error'); 
      return;
    }

    this.isLoading = true;
    try {
      const firestoreDays = this.formatDaysForFirestore(this.selectedDays);
      const firestoreHours = this.formatHoursForFirestore(this.selectedStartHour, this.selectedEndHour);

      const scheduleDocRef = doc(this.firestore, `usuarios/${this.selectedDoctorId}/horario/horario_doc`);
      await setDoc(scheduleDocRef, {
        dias: firestoreDays,
        horas: firestoreHours
      });
      this.openModal('Horario guardado con éxito!', 'success'); 
      this.doctorSchedule = { dias: firestoreDays, horas: firestoreHours };
    } catch (error) {
      this.openModal('Error al guardar el horario. Intenta de nuevo.', 'error'); 
    } finally {
      this.isLoading = false;
    }
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
   * @param diasString La cadena de días de Firestore.
   * @returns Un array de IDs de días.
   */
  parseDaysForEdit(diasString: string): number[] {
    if (!diasString) return [];
    if (diasString.includes('-')) {
      const [start, end] = diasString.split('-').map(Number);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    } else if (diasString.includes(',')) {
      return diasString.split(',').map(Number);
    }
    return [Number(diasString)].filter(n => !isNaN(n)); 
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
   * Convierte una cadena de horas de Firestore ("9-17") a un objeto con hora de inicio y fin.
   * @param horasString La cadena de horas de Firestore.
   * @returns Un objeto con 'start' y 'end' de tipo number.
   */
  parseHoursForEdit(horasString: string): { start: number | null, end: number | null } {
    if (!horasString || !horasString.includes('-')) return { start: null, end: null };
    const [start, end] = horasString.split('-').map(Number);
    return { start: isNaN(start) ? null : start, end: isNaN(end) ? null : end };
  }

  /**
   * Convierte una hora de inicio y fin a una cadena para Firestore ("9-17").
   * @param startHour Hora de inicio.
   * @param endHour Hora de fin.
   * @returns La cadena formateada para Firestore.
   */
  formatHoursForFirestore(startHour: number, endHour: number): string {
    return `${startHour}-${endHour}`;
  }

  /**
   * Formatea un array de IDs de días para mostrarlo con sus nombres.
   * @param diasString La cadena de días de Firestore (ej. "1-5" o "1,2,3").
   * @returns Una cadena legible.
   */
  formatDaysForDisplay(diasString: string): string {
    const days = this.parseDaysForEdit(diasString);
    if (days.length === 0) return 'No definido';

    if (days.length > 1 && days[days.length - 1] - days[0] + 1 === days.length) {
      const startDayName = DAYS_OF_WEEK.find(d => d.id === days[0])?.name;
      const endDayName = DAYS_OF_WEEK.find(d => d.id === days[days.length - 1])?.name;
      if (startDayName && endDayName) {
        if (startDayName === endDayName) return startDayName;
        return `${startDayName} a ${endDayName}`;
      }
    }

    return days.map(id => DAYS_OF_WEEK.find(d => d.id === id)?.name || `Día ${id}`).join(', ');
  }

  /**
   * Formatea una cadena de horas de Firestore ("9-17") para mostrarla de forma adecuada.
   * @param horasString La cadena de horas de Firestore.
   * @returns Una cadena legible.
   */
  formatHoursForDisplay(horasString: string): string {
    const parsed = this.parseHoursForEdit(horasString);
    if (parsed.start === null || parsed.end === null) return 'No definido';

    const formatHour = (hour: number) => `${hour < 10 ? '0' + hour : hour}:00`;
    return `De ${formatHour(parsed.start)} a ${formatHour(parsed.end)}`;
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
