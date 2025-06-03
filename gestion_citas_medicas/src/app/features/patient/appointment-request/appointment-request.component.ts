// appointment-request/appointment-request.component.ts
import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs, query, where, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Auth, user, User } from '@angular/fire/auth'; // Importar Auth y User

interface Doctor {
  id: string; // El ID del documento de Firestore
  nombre: string;
  especialidad: string;
  esMedico: boolean;
}

interface Schedule {
  dias: string; // Ej: "1-5" o "1,2,3,5"
  horas: string; // Ej: "9-17"
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

  // Paso 1: Especialidad
  selectedSpecialty: string | null = null;
  availableSpecialties: string[] = [];

  // Paso 2: Médico
  selectedDoctorId: string | null = null;
  availableDoctors: Doctor[] = [];

  // Paso 3: Fecha
  selectedDate: string | null = null;
  minDate: string = new Date().toISOString().split('T')[0];
  maxDate: string;

  // Paso 4: Hora
  availableTimeSlots: string[] = [];
  selectedTime: string | null = null;

  // Datos del médico seleccionado para disponibilidad
  private doctorSchedule: Schedule | null = null;
  private doctorAppointments: string[] = [];
  private parsedDoctorDays: number[] = []; // <--- NUEVO: Para almacenar los días parseados del horario

  // ID del usuario autenticado
  currentUserId: string | null = null;

  constructor(private firestore: Firestore, private auth: Auth) {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    this.maxDate = futureDate.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadSpecialties();
    user(this.auth).subscribe((aUser: User | null) => {
      if (aUser) {
        this.currentUserId = aUser.uid;
        console.log('Usuario en sesión (UID):', this.currentUserId);
      } else {
        this.currentUserId = null;
        console.log('No hay usuario en sesión.');
      }
    });
  }

  /**
   * Carga las especialidades desde la colección 'especialidades' en Firestore.
   */
  async loadSpecialties(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    try {
      const q = collection(this.firestore, 'especialidades');
      const querySnapshot = await getDocs(q);
      const specialties = new Set<string>();

      querySnapshot.forEach((doc) => {
        const specialtyData = doc.data();
        if (specialtyData && specialtyData['name']) {
          specialties.add(specialtyData['name']);
        }
      });
      this.availableSpecialties = Array.from(specialties);

      this.isLoading = false;
    } catch (error) {
      console.error('Error al cargar especialidades desde Firestore:', error);
      this.errorMessage = 'No se pudieron cargar las especialidades. Por favor, intenta de nuevo.';
      this.isLoading = false;
    }
  }

  /**
   * Avanza al siguiente paso.
   */
  async nextStep(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;

    switch (this.currentStep) {
      case 1: // De especialidad a médico
        if (!this.selectedSpecialty) {
          this.errorMessage = 'Por favor, selecciona una especialidad.';
          return;
        }
        this.loadDoctorsBySpecialty(this.selectedSpecialty);
        this.currentStep++;
        break;
      case 2: // De médico a fecha
        if (!this.selectedDoctorId) {
          this.errorMessage = 'Por favor, selecciona un médico.';
          return;
        }
        console.log('ID del médico seleccionado:', this.selectedDoctorId);
        await this.loadDoctorAvailability(this.selectedDoctorId);
        // Solo avanza si el horario se cargó correctamente (no hay error)
        if (!this.errorMessage) {
          this.currentStep++;
        }
        break;
      case 3: // De fecha a hora
        if (!this.selectedDateAsDate) {
          this.errorMessage = 'Por favor, selecciona una fecha.';
          return;
        }
        this.generateAvailableTimeSlots();
        this.currentStep++;
        break;
      case 4: // De hora a confirmación
        if (!this.selectedTime) {
          this.errorMessage = 'Por favor, selecciona una hora.';
          return;
        }
        this.currentStep++;
        break;
      case 5: // Confirmación (aquí se registraría la cita)
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
  async loadDoctorsBySpecialty(specialty: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    try {
      const q = query(
        collection(this.firestore, 'usuarios'),
        where('esMedico', '==', true),
        where('especialidad', '==', specialty)
      );
      const querySnapshot = await getDocs(q);
      this.availableDoctors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data()['nombre'],
        especialidad: doc.data()['especialidad'],
        esMedico: doc.data()['esMedico']
      } as Doctor));
      this.isLoading = false;
    } catch (error) {
      console.error('Error al cargar médicos por especialidad:', error);
      this.errorMessage = 'No se pudieron cargar los médicos. Inténtalo de nuevo.';
      this.isLoading = false;
    }
  }

  /**
   * Carga el horario y las citas existentes del médico seleccionado.
   * Ahora también parsea los días de trabajo.
   * @param doctorId El ID del médico.
   */
  async loadDoctorAvailability(doctorId: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    this.doctorSchedule = null; // Resetear antes de cargar
    this.doctorAppointments = []; // Resetear antes de cargar
    this.parsedDoctorDays = []; // <--- NUEVO: Resetear los días parseados

    try {
      const scheduleDocRef = doc(this.firestore, `usuarios/${doctorId}/horario/horario_doc`);
      const scheduleDocSnap = await getDoc(scheduleDocRef);

      if (scheduleDocSnap.exists()) {
        const scheduleData = scheduleDocSnap.data();
        if (scheduleData && typeof scheduleData['dias'] === 'string' && typeof scheduleData['horas'] === 'string') {
          this.doctorSchedule = scheduleData as Schedule;
          this.parsedDoctorDays = this.parseDaysFromFirestore(this.doctorSchedule.dias); // <--- NUEVO: Parsear los días
        } else {
          this.errorMessage = 'El horario del médico está incompleto o malformado (faltan "dias" o "horas").';
          this.doctorSchedule = null;
        }
      } else {
        this.errorMessage = 'No se encontró el horario para este médico.';
        this.doctorSchedule = null;
      }

      const appointmentsCollectionRef = collection(this.firestore, `usuarios/${doctorId}/citas`);
      const qAppointments = query(appointmentsCollectionRef, where('confirmada', '==', true));
      const appointmentsQuerySnapshot = await getDocs(qAppointments);
      
      this.doctorAppointments = appointmentsQuerySnapshot.docs.map(doc => doc.id);

      this.isLoading = false;
    } catch (error) {
      console.error('Error al cargar disponibilidad del médico:', error);
      this.errorMessage = 'No se pudo cargar la disponibilidad del médico. Inténtalo de nuevo.';
      this.isLoading = false;
    }
  }

  /**
   * Genera los bloques de tiempo disponibles para la fecha seleccionada
   * basándose en el horario del médico y las citas ya agendadas.
   * Ahora usa `parsedDoctorDays` para verificar la disponibilidad del día.
   */
  generateAvailableTimeSlots(): void {
    this.availableTimeSlots = [];
    if (!this.selectedDateAsDate || !this.doctorSchedule || this.parsedDoctorDays.length === 0) { // <--- MODIFICADO: Verificar parsedDoctorDays
      this.errorMessage = 'Fecha o horario del médico no disponible.';
      return;
    }

    const dayOfWeek = this.selectedDateAsDate.getDay();
    const firestoreDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Domingo es 0 en JS, 7 en Firestore (según tu convención)

    // <--- MODIFICADO: Usar parsedDoctorDays para verificar si el día es laborable
    if (!this.parsedDoctorDays.includes(firestoreDayOfWeek)) {
      this.errorMessage = 'El médico no trabaja en el día seleccionado.';
      return;
    }

    if (!this.doctorSchedule.horas) {
        this.errorMessage = 'Horario del médico malformado. Faltan datos de horas.';
        return;
    }

    const [startHour, endHour] = this.doctorSchedule.horas.split('-').map(Number);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateNormalized = new Date(this.selectedDateAsDate);
    selectedDateNormalized.setHours(0, 0, 0, 0);

    for (let hour = startHour; hour < endHour; hour++) {
      const slotDate = new Date(this.selectedDateAsDate);
      slotDate.setHours(hour, 0, 0, 0);

      if (selectedDateNormalized.getTime() === today.getTime() && slotDate.getTime() < new Date().getTime()) {
        continue;
      }

      const slotString = this.formatDateToFirestoreString(slotDate);
      if (!this.doctorAppointments.includes(slotString)) {
        this.availableTimeSlots.push(`${hour < 10 ? '0' + hour : hour}:00`);
      }
    }

    if (this.availableTimeSlots.length === 0) {
      this.errorMessage = 'No hay horas disponibles para la fecha seleccionada.';
    }
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

      // Referencia al documento de la cita del doctor
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
      console.error('Error al registrar la cita:', error);
      this.errorMessage = 'Hubo un error al registrar la cita. Inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Convierte una cadena de días de Firestore ("1,2,3" o "1-5") a un array de números.
   * Esta función es crucial para interpretar el nuevo formato de días.
   * @param diasString La cadena de días de Firestore.
   * @returns Un array de IDs de días.
   */
  private parseDaysFromFirestore(diasString: string): number[] {
    if (!diasString) return [];
    if (diasString.includes('-')) {
      // Manejar el formato antiguo "1-5"
      const [start, end] = diasString.split('-').map(Number);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    } else if (diasString.includes(',')) {
      // Manejar el nuevo formato "1,2,3,5"
      return diasString.split(',').map(Number);
    }
    // Manejar el caso de un solo día "1"
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
    this.parsedDoctorDays = []; // <--- NUEVO: Resetear también los días parseados
    this.loadSpecialties();
  }
}
