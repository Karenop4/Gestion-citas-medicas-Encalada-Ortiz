import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medico } from '../../models/medico.model';
import { Cita } from '../../models/cita.model';
import { Especialidad } from '../../models/especialidad.model';
import { Horario } from '../../models/horario.model';


@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) { }

  loadSpecialties(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/especialidades`);
  }

  loadSpecialtiesReporte(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.baseUrl}/especialidades`);
  }

  loadDoctorsBySpecialty(nombreEspecialidad: string): Observable<Medico[]> {
    return this.http.get<Medico[]>(`${this.baseUrl}/medicos/porEspecialidad?nombreEspecialidad=${encodeURIComponent(nombreEspecialidad)}`);
  }
  getDoctorAvailableDays(doctorId: number): Observable<string> {
    return this.http.get(`/api/medicos/${doctorId}/diasDisponibles`, { responseType: 'text' });
  }
  loadDoctorAvailability(doctorId: number, fecha: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/medicos/${doctorId}/disponibilidad?fecha=${fecha}`);
  }
  getMedicos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(`${this.baseUrl}/medicos`); 
  }
  getDoctorGeneralHorario(medicoId: number): Observable<Horario> {
    return this.http.get<Horario>(`${this.baseUrl}/medicos/${medicoId}/horarioGeneral`);
  }
  getDoctorHorarioById(medicoId: number): Observable<Horario> {
    return this.http.get<Horario>(`${this.baseUrl}/medicos/${medicoId}/horarioGeneral`);
  }
  saveHorario(horario: Horario, medicoId: number): Observable<Horario> {
    return this.http.post<Horario>(`${this.baseUrl}/horarios/medico/${medicoId}`, horario);
  }

  registerAppointment(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(`${this.baseUrl}/citas`, cita);
  }
  getAppointmentsPorMedico(medicoID: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`/api/citas/porMedico/${medicoID}`);
  }
  getAppointmentsPorPaciente(pacienteID: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`/api/citas/porPaciente/${pacienteID}`);
  }
  getAppointmentsPorEspecialidad(especialidadId: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.baseUrl}/citas/porEspecialidad/${especialidadId}`);
  }
  cancelAppointment(cita: Cita): Observable<Cita> {
    return this.http.put<Cita>(`${this.baseUrl}/citas/${cita.id}`, { estado: 'x' });
  }
  confirmarAppointment(cita: Cita): Observable<Cita> {
    return this.http.put<Cita>(`${this.baseUrl}/citas/${cita.id}`, { estado: 'c' });
  }
  getCitasConfirmadasMedicoEnRango(medicoId: number, fechaInicio: string, fechaFin: string): Observable<Cita[]> {
    // Nota: Los parámetros de fecha deben estar en formato YYYY-MM-DD
    return this.http.get<Cita[]>(`${this.baseUrl}/citas/porMedico/confirmadas-rango/${medicoId}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
  }



  /**
   * Llama al backend para descargar el reporte PDF de citas pendientes de un médico.
   * @param medicoId El ID del médico.
   * @returns Un Observable de tipo Blob que contiene el archivo PDF.
   */
  downloadPdfReport(medicoId: number): Observable<Blob> {
    const url = `${this.baseUrl}/medicos/${medicoId}/citas-pendientes/pdf`;
    return this.http.get(url, { responseType: 'blob' });
  }

  // *** AÑADE UN MÉTODO PARA DESCARGAR PDF POR ESPECIALIDAD (lo dejaremos sin implementar por ahora en el backend) ***
  downloadPdfReportPorEspecialidad(especialidadId: number): Observable<Blob> {
    // Por ahora, solo un placeholder. La URL y lógica del backend se definirá después.
    // Usaremos un endpoint similar a: `/api/especialidades/{especialidadId}/citas-confirmadas/pdf`
    const url = `${this.baseUrl}/especialidades/${especialidadId}/citas-confirmadas/pdf`;
    console.warn('Llamada a downloadPdfReportPorEspecialidad. Este endpoint aún no está implementado en el backend.');
    return this.http.get(url, { responseType: 'blob' }); // Mantener el tipo de retorno para consistencia
  }


  downloadConfirmedPdfReportByMedico(medicoId: number): Observable<Blob> {
    const url = `${this.baseUrl}/medicos/${medicoId}/citas-confirmadas/pdf`;
    return this.http.get(url, { responseType: 'blob' });
  }
  downloadConfirmedPdfReportByEspecialidad(especialidadId: number): Observable<Blob> {
    const url = `${this.baseUrl}/medicos/especialidad/${especialidadId}/citas-confirmadas/pdf`; // Ojo con la URL del backend
    return this.http.get(url, { responseType: 'blob' });
  }
}
