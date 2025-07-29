import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, query, where, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Auth, user, User } from '@angular/fire/auth'; 
import { ApiService } from '../../../core/services/api.service';
import { Horario } from '../../../models/horario.model';
interface Doctor {
  id: string; 
  nombre: string;
  especialidad: string;
  esMedico: boolean;
}

@Component({
  selector: 'app-appointment-request',
  templateUrl: './appointment-request.component.html',
  styleUrls: ['./appointment-request.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe]
})
export class AppointmentRequestComponent implements OnInit {
  currentStep: number = 1;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  selectedSpecialty: any = null;
  availableSpecialties: any[] = [];

  selectedDoctorId: string | null = null;
  availableDoctors: Doctor[] = [];

  selectedDate: string | null = null;
  minDate: string = new Date().toISOString().split('T')[0];
  maxDate: string;

  availableTimeSlots: string[] = [];
  selectedTime: string | null = null;

  private doctorSchedule: Horario | null = null;
  private doctorAppointments: string[] = [];
  private parsedDoctorDays: number[] = []; 

  currentUserId: string | null = null;

  constructor(private firestore: Firestore, private auth: Auth, private apiService: ApiService) {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    this.maxDate = futureDate.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadSpecialties();
  }

  /**
   * Carga las especialidades desde el servidor REST usando ApiService.
   */
  loadSpecialties(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.apiService.loadSpecialties().subscribe({
      next: (specialties: any[]) => {
        this.availableSpecialties = specialties;
        this.isLoading = false;
        console.log('Especialidades cargadas:', this.availableSpecialties);
      },
      error: (error) => {
        this.errorMessage = 'No se pudieron cargar las especialidades. Inténtalo de nuevo.';
        this.isLoading = false;
        console.error('Error al cargar especialidades:', error);
      }
    });
  }

  /**
   * Avanza al siguiente paso.
   */
  async nextStep(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;

    switch (this.currentStep) {
      case 1: 
        if (!this.selectedSpecialty) {
          this.errorMessage = 'Por favor, selecciona una especialidad.';
          return;
        }
        this.loadDoctorsBySpecialty(this.selectedSpecialty);
        this.currentStep++;
        break;
      case 2:
        if (!this.selectedDoctorId) {
          this.errorMessage = 'Por favor, selecciona un médico.';
          return;
        }
        console.log('ID del médico seleccionado:', this.selectedDoctorId);
        await this.loadDoctorAvailability(this.selectedDoctorId);
        if (!this.errorMessage) {
          this.currentStep++;
        }
        break;
      case 3: 
        if (!this.selectedDateAsDate) {
          this.errorMessage = 'Por favor, selecciona una fecha.';
          return;
        }
        this.generateAvailableTimeSlots();
        this.currentStep++;
        break;
      case 4:
        if (!this.selectedTime) {
          this.errorMessage = 'Por favor, selecciona una hora.';
          return;
        }
        this.currentStep++;
        break;
      case 5: 
        break;
      default:
        break;
    }
  }

  /**
   * Retrocede al paso anterior.
   */
  prevStep(): void {
    this.errorMessage = null;
    this.successMessage = null;
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  /**
   * Carga los médicos de una especialidad específica.
   * @param specialty La especialidad seleccionada.
   */
  loadDoctorsBySpecialty(specialty: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.apiService.loadDoctorsBySpecialty(this.selectedSpecialty.nombre).subscribe({
      next: (doctors: any[]) => {
        this.availableDoctors = doctors;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'No se pudieron cargar los médicos. Inténtalo de nuevo.';
        this.isLoading = false;
        console.error('Error al cargar médicos:', error);
      }
    });
  }

  /**
   * Carga el horario y las citas existentes del médico seleccionado.
   * @param doctorId El ID del médico.
   */
  loadDoctorAvailability(doctorId: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.parsedDoctorDays = [];

    this.apiService.getDoctorAvailableDays(Number(doctorId)).subscribe({
      next: (diasString: string) => {
        this.parsedDoctorDays = this.parseDaysFromFirestore(diasString);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'No se pudo cargar los días disponibles del médico. Inténtalo de nuevo.';
        this.isLoading = false;
        console.error('Error al cargar días disponibles:', error);
      }
    });
  }

  /**
   * Genera los bloques de tiempo disponibles para la fecha seleccionada
   * basándose en el horario del médico y las citas confirmadas
   */
  generateAvailableTimeSlots(): void {
    this.availableTimeSlots = [];
    if (!this.selectedDate || !this.selectedDoctorId) {
      this.errorMessage = 'Fecha o médico no seleccionado.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    this.apiService.loadDoctorAvailability(Number(this.selectedDoctorId), this.selectedDate).subscribe({
      next: (slots: string[]) => {
        this.availableTimeSlots = slots;
        if (this.availableTimeSlots.length === 0) {
          this.errorMessage = 'No hay horas disponibles para la fecha seleccionada.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'No se pudieron cargar las horas disponibles. Inténtalo de nuevo.';
        this.isLoading = false;
        console.error('Error al cargar horas disponibles:', error);
      }
    });
  }

  /**
   * Formatea una fecha a la cadena 'YYYY-MM-DD-HH' para Firestore.
   * @param date La fecha a formatear.
   * @returns La cadena formateada.
   */
  private formatDateToFirestoreString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    return `${year}-${month}-${day}-${hour}`;
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
   * Obtiene el objeto Doctor completo basado en el selectedDoctorId.
   * Útil para mostrar el nombre del médico en la confirmación.
   */
  get selectedDoctorObject(): Doctor | null {
    if (this.selectedDoctorId && this.availableDoctors && this.availableDoctors.length > 0) {
      return this.availableDoctors.find(doctor => doctor.id === this.selectedDoctorId) || null;
    }
    return null;
  }

  /**
   * Getter para obtener selectedDate como un objeto Date.
   */
  get selectedDateAsDate(): Date | null {
    return this.selectedDate ? new Date(this.selectedDate + 'T00:00:00') : null;
  }

  /**
   * Registra la cita en Firestore.
   */
  async registerAppointment(): Promise<void> {
    if (!this.selectedDoctorId || !this.selectedDateAsDate || !this.selectedTime || !this.currentUserId) {
      this.errorMessage = 'Faltan datos para registrar la cita o no hay usuario autenticado.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const [hourStr] = this.selectedTime.split(':');
      const appointmentDate = new Date(this.selectedDateAsDate);
      appointmentDate.setHours(parseInt(hourStr, 10), 0, 0, 0);

      const appointmentId = this.formatDateToFirestoreString(appointmentDate);

      const doctorAppointmentDocRef = doc(this.firestore, `usuarios/${this.selectedDoctorId}/citas/${appointmentId}`);
      await setDoc(doctorAppointmentDocRef, {
        date: this.selectedDate,
        hour: this.selectedTime,
        doctorId: this.selectedDoctorId,
        doctorName: this.selectedDoctorObject?.nombre,
        specialty: this.selectedSpecialty,
        userId: this.currentUserId,
        confirmada: false,
        cancelada: false
      });

      this.successMessage = '¡Cita registrada con éxito!';
      await this.loadDoctorAvailability(this.selectedDoctorId);
      this.resetForm();
    } catch (error) {
      this.errorMessage = 'Hubo un error al registrar la cita. Inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Convierte una cadena de días de Firestore ("1,2,3" o "1-5") a un array de números.
   * @param diasString La cadena de días de Firestore.
   * @returns Un array de IDs de días.
   */
  private parseDaysFromFirestore(diasString: string): number[] {
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
   * Reinicia el formulario a su estado inicial.
   */
  resetForm(): void {
    this.currentStep = 1;
    this.selectedSpecialty = null;
    this.selectedDoctorId = null;
    this.selectedDate = null;
    this.selectedTime = null;
    this.availableDoctors = [];
    this.availableTimeSlots = [];
    this.doctorSchedule = null;
    this.doctorAppointments = [];
    this.parsedDoctorDays = []; 
    this.loadSpecialties();
  }
}
