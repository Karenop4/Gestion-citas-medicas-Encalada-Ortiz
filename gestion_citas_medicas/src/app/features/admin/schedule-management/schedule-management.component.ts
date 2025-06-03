// src/app/features/admin/schedule-management/schedule-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, query, where, getDocs, doc, getDoc, setDoc } from '@angular/fire/firestore';

// Interfaz para el médico (adaptada de tu AppointmentRequestComponent)
interface Doctor {
  id: string;
  nombre: string;
  especialidad: string;
  esMedico: boolean;
}

// Interfaz para la estructura del horario tal como se guarda en Firestore
interface Schedule {
  dias: string; // Ej: "1-5" o "1,2,3,5"
  horas: string; // Ej: "9-17"
}

// Constantes para la conversión y las opciones de selección
const DAYS_OF_WEEK = [
  { id: 1, name: 'Lunes', short: 'Lun' },
  { id: 2, name: 'Martes', short: 'Mar' },
  { id: 3, name: 'Miércoles', short: 'Mié' },
  { id: 4, name: 'Jueves', short: 'Jue' },
  { id: 5, name: 'Viernes', short: 'Vie' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
  { id: 7, name: 'Domingo', short: 'Dom' },
];
const AVAILABLE_HOURS = Array.from({ length: 24 }, (_, i) => i); // Horas de 0 a 23

@Component({
  selector: 'app-schedule-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-management.component.html',
  styleUrls: ['./schedule-management.component.css']
})
export class ScheduleManagementComponent implements OnInit {
  isLoading: boolean = false;
  // errorMessage: string | null = null; // Eliminado
  // successMessage: string | null = null; // Eliminado

  // <--- NUEVAS PROPIEDADES PARA EL MODAL DE MENSAJES
  isModalOpen: boolean = false;
  modalMessage: string = '';
  modalType: 'success' | 'error' | '' = '';
  // FIN NUEVAS PROPIEDADES

  availableDoctors: Doctor[] = [];
  selectedDoctorId: string | null = null;
  selectedDoctorName: string | null = null;

  doctorSchedule: Schedule | null = null; // Horario actual del médico seleccionado (Firestore format)

  // Propiedades para los inputs de edición del horario (nuevo formato)
  selectedDays: number[] = []; // Array de IDs de días seleccionados (ej. [1, 2, 3])
  selectedStartHour: number | null = null;
  selectedEndHour: number | null = null;

  // Opciones para los selectores en el HTML
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
    // this.errorMessage = null; // Eliminado
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
        // this.errorMessage = 'No se encontraron médicos en el sistema.'; // Eliminado
        this.openModal('No se encontraron médicos en el sistema.', 'error'); // <--- USANDO MODAL
      }

      this.isLoading = false;
    } catch (error) {
      console.error('Error al cargar médicos:', error);
      // this.errorMessage = 'No se pudieron cargar los médicos. Por favor, intenta de nuevo.'; // Eliminado
      this.openModal('No se pudieron cargar los médicos. Por favor, intenta de nuevo.', 'error'); // <--- USANDO MODAL
      this.isLoading = false;
    }
  }

  /**
   * Se ejecuta cuando se selecciona un médico del dropdown.
   * Carga el horario de ese médico y lo prepara para edición.
   */
  async onDoctorSelected(): Promise<void> {
    // this.errorMessage = null; // Eliminado
    // this.successMessage = null; // Eliminado
    this.doctorSchedule = null;
    this.selectedDays = []; // Resetear
    this.selectedStartHour = null; // Resetear
    this.selectedEndHour = null; // Resetear

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
   * Parsea los datos de Firestore a las propiedades de edición del componente.
   * @param doctorId El ID del médico.
   */
  async loadDoctorSchedule(doctorId: string): Promise<void> {
    this.isLoading = true;
    // this.errorMessage = null; // Eliminado
    try {
      const scheduleDocRef = doc(this.firestore, `usuarios/${doctorId}/horario/horario_doc`);
      const scheduleDocSnap = await getDoc(scheduleDocRef);

      if (scheduleDocSnap.exists()) {
        const scheduleData = scheduleDocSnap.data();
        if (scheduleData && typeof scheduleData['dias'] === 'string' && typeof scheduleData['horas'] === 'string') {
          this.doctorSchedule = scheduleData as Schedule;
          // Parsear para edición
          this.selectedDays = this.parseDaysForEdit(this.doctorSchedule.dias);
          const parsedHours = this.parseHoursForEdit(this.doctorSchedule.horas);

          // Validar horas después de parsear
          if (parsedHours.start !== null && parsedHours.end !== null && parsedHours.start < parsedHours.end) {
            this.selectedStartHour = parsedHours.start;
            this.selectedEndHour = parsedHours.end;
          } else {
            // MENSAJE DE ERROR DIFERENCIADO
            // this.errorMessage = 'El horario cargado es inválido: la hora de inicio no es menor que la hora de fin. Por favor, corrige el horario.'; // Eliminado
            this.openModal('El horario cargado es inválido: la hora de inicio no es menor que la hora de fin. Por favor, corrige el horario.', 'error'); // <--- USANDO MODAL
            this.doctorSchedule = null; // Invalida el horario actual si está mal
            this.selectedStartHour = null; // Resetear para forzar al usuario a seleccionar
            this.selectedEndHour = null; // Resetear para forzar al usuario a seleccionar
          }
        } else {
          // this.errorMessage = 'El horario del médico está incompleto o malformado.'; // Eliminado
          this.openModal('El horario del médico está incompleto o malformado.', 'error'); // <--- USANDO MODAL
          this.doctorSchedule = null;
          this.selectedStartHour = null; // Resetear
          this.selectedEndHour = null; // Resetear
        }
      } else {
        // this.errorMessage = 'No se encontró un horario para este médico. Puedes crear uno.'; // Eliminado
        this.openModal('No se encontró un horario para este médico. Puedes crear uno.', 'error'); // <--- USANDO MODAL
        this.doctorSchedule = null;
        this.selectedStartHour = null; // Resetear
        this.selectedEndHour = null; // Resetear
      }
      this.isLoading = false;
    } catch (error) {
      console.error('Error al cargar el horario del médico:', error);
      // this.errorMessage = 'Error al cargar el horario. Intenta de nuevo.'; // Eliminado
      this.openModal('Error al cargar el horario. Intenta de nuevo.', 'error'); // <--- USANDO MODAL
      this.isLoading = false;
    }
  }

  /**
   * Guarda el horario editado en Firestore para el médico seleccionado.
   * Convierte las propiedades de edición al formato de Firestore.
   */
  async saveSchedule(): Promise<void> {
    if (!this.selectedDoctorId || this.selectedDays.length === 0 || this.selectedStartHour === null || this.selectedEndHour === null) {
      // this.errorMessage = 'Por favor, selecciona un médico y completa todos los campos del horario.'; // Eliminado
      this.openModal('Por favor, selecciona un médico y completa todos los campos del horario.', 'error'); // <--- USANDO MODAL
      return;
    }

    // Validar que la hora de fin sea posterior a la hora de inicio
    if (+this.selectedStartHour >= +this.selectedEndHour) { // <--- CAMBIO AQUÍ: Conversión a número
      // MENSAJE DE ERROR DIFERENCIADO
      // this.errorMessage = 'Error al guardar: la hora de fin debe ser posterior a la hora de inicio.'; // Eliminado
      this.openModal('Error al guardar: la hora de fin debe ser posterior a la hora de inicio.', 'error'); // <--- USANDO MODAL
      return;
    }

    this.isLoading = true;
    // this.errorMessage = null; // Eliminado
    // this.successMessage = null; // Eliminado

    try {
      const firestoreDays = this.formatDaysForFirestore(this.selectedDays);
      const firestoreHours = this.formatHoursForFirestore(this.selectedStartHour, this.selectedEndHour);

      const scheduleDocRef = doc(this.firestore, `usuarios/${this.selectedDoctorId}/horario/horario_doc`);
      await setDoc(scheduleDocRef, {
        dias: firestoreDays,
        horas: firestoreHours
      });
      // this.successMessage = 'Horario guardado con éxito!'; // Eliminado
      this.openModal('Horario guardado con éxito!', 'success'); // <--- USANDO MODAL
      // Actualizar el horario mostrado después de guardar
      this.doctorSchedule = { dias: firestoreDays, horas: firestoreHours };
    } catch (error) {
      console.error('Error al guardar el horario:', error);
      // this.errorMessage = 'Error al guardar el horario. Intenta de nuevo.'; // Eliminado
      this.openModal('Error al guardar el horario. Intenta de nuevo.', 'error'); // <--- USANDO MODAL
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
    this.selectedDays.sort((a, b) => a - b); // Mantener ordenado
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
    return [Number(diasString)].filter(n => !isNaN(n)); // Para un solo día
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
   * Formatea un array de IDs de días para mostrarlo de forma legible.
   * Ej: [1,2,3] -> "Lunes, Martes, Miércoles"
   * Ej: [1,2,3,4,5] -> "Lunes a Viernes"
   * @param diasString La cadena de días de Firestore (ej. "1-5" o "1,2,3").
   * @returns Una cadena legible.
   */
  formatDaysForDisplay(diasString: string): string {
    const days = this.parseDaysForEdit(diasString);
    if (days.length === 0) return 'No definido';

    // Comprobar si es un rango consecutivo
    if (days.length > 1 && days[days.length - 1] - days[0] + 1 === days.length) {
      const startDayName = DAYS_OF_WEEK.find(d => d.id === days[0])?.name;
      const endDayName = DAYS_OF_WEEK.find(d => d.id === days[days.length - 1])?.name;
      if (startDayName && endDayName) {
        if (startDayName === endDayName) return startDayName; // Si es un solo día en un "rango"
        return `${startDayName} a ${endDayName}`;
      }
    }

    // Si no es un rango, listar los días
    return days.map(id => DAYS_OF_WEEK.find(d => d.id === id)?.name || `Día ${id}`).join(', ');
  }

  /**
   * Formatea una cadena de horas de Firestore ("9-17") para mostrarla de forma legible.
   * Ej: "9-17" -> "De 09:00 a 17:00"
   * @param horasString La cadena de horas de Firestore.
   * @returns Una cadena legible.
   */
  formatHoursForDisplay(horasString: string): string {
    const parsed = this.parseHoursForEdit(horasString);
    if (parsed.start === null || parsed.end === null) return 'No definido';

    const formatHour = (hour: number) => `${hour < 10 ? '0' + hour : hour}:00`;
    return `De ${formatHour(parsed.start)} a ${formatHour(parsed.end)}`;
  }

  // <--- NUEVOS MÉTODOS PARA EL MODAL DE MENSAJES
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
  // FIN NUEVOS MÉTODOS
}
