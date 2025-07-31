
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // Importa HttpParams
import { Observable } from 'rxjs';
import { Medico } from '../../models/medico.model';
import { Cita } from '../../models/cita.model';
import { Especialidad } from '../../models/especialidad.model';
import { Horario } from '../../models/horario.model';
import { Usuario } from '../../models/user.model';


@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) { }

  // **CAMBIO SUGERIDO: Renombrar para consistencia**
  getEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.baseUrl}/especialidades`);
  }
  // MÉTODOS EXISTENTES PARA ESPECIALIDADES
  createEspecialidad(especialidad: { nombre: string }): Observable<Especialidad> {
    return this.http.post<Especialidad>(`${this.baseUrl}/especialidades`, especialidad);
  }

  updateEspecialidad(id: number, especialidad: { nombre: string }): Observable<Especialidad> {
    return this.http.put<Especialidad>(`${this.baseUrl}/especialidades/${id}`, especialidad);
  }

  deactivateEspecialidad(id: number): Observable<Especialidad> {
    return this.http.patch<Especialidad>(`${this.baseUrl}/especialidades/${id}/deactivate`, {});
  }

  // Si 'loadSpecialtiesReporte' es un endpoint diferente o tiene lógica diferente, déjalo.
  // Si es lo mismo que 'getEspecialidades', considera eliminarlo o fusionarlo.
  loadSpecialtiesReporte(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.baseUrl}/especialidades`);
  }

  // **AJUSTADO: Uso de HttpParams y asumiendo que el Medico incluye el Horario**
  getMedicosByEspecialidad(nombreEspecialidad: string): Observable<Medico[]> {
    let params = new HttpParams().set('nombreEspecialidad', nombreEspecialidad);
    return this.http.get<Medico[]>(`${this.baseUrl}/medicos/porEspecialidad`, { params: params });
  }


  getMedicos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(`${this.baseUrl}/medicos`);
  }
  getDoctorGeneralHorario(medicoId: number): Observable<Horario> {
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
  getAppointmentsPorMedicoYFecha(medicoId: number, fecha: string): Observable<Cita[]> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<Cita[]>(`${this.baseUrl}/citas/medico/${medicoId}/fecha`, { params });
  }

  getDisponibilidadPorFecha(medicoId: number, fecha: string): Observable<string[]> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<string[]>(`${this.baseUrl}/medicos/${medicoId}/disponibilidad`, { params });
  }


  getCitasConfirmadasMedicoEnRango(medicoId: number, startDate: string, endDate: string): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.baseUrl}/citas/medico/${medicoId}/confirmadas/rango`, {
      params: { startDate, endDate }
    });
  }
  getAllConfirmedAppointmentsInDateRange(startDate: string, endDate: string): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.baseUrl}/citas/confirmadas/rango`, {
      params: { startDate, endDate }
    });
  }
  getUserProfileByFirebaseUid(firebaseUid: string): Observable<Usuario> {
    const params = new HttpParams().set('uid', firebaseUid);
    return this.http.get<Usuario>(`${this.baseUrl}/usuarios/porFirebaseUid`, { params });
  }

  downloadPdfReport(medicoId: number): Observable<Blob> {
    const url = `${this.baseUrl}/medicos/${medicoId}/citas-pendientes/pdf`;
    return this.http.get(url, { responseType: 'blob' });
  }

  downloadPdfReportPorEspecialidad(especialidadId: number): Observable<Blob> {
    const url = `${this.baseUrl}/especialidades/${especialidadId}/citas-confirmadas/pdf`;
    console.warn('Llamada a downloadPdfReportPorEspecialidad. Este endpoint aún no está implementado en el backend.');
    return this.http.get(url, { responseType: 'blob' });
  }

  downloadConfirmedPdfReportByMedico(medicoId: number): Observable<Blob> {
    const url = `${this.baseUrl}/medicos/${medicoId}/citas-confirmadas/pdf`;
    return this.http.get(url, { responseType: 'blob' });
  }
  downloadConfirmedPdfReportByEspecialidad(especialidadId: number): Observable<Blob> {
    const url = `${this.baseUrl}/medicos/especialidad/${especialidadId}/citas-confirmadas/pdf`;
    return this.http.get(url, { responseType: 'blob' });
  }
  getFilteredAppointments(
    fechaInicio: string, // YYYY-MM-DD
    fechaFin: string,    // YYYY-MM-DD
    especialidadId?: number | null,
    estado?: string | null,
    pacienteId?: number | null,
    medicoId?: number | null
  ): Observable<Cita[]> {
    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    if (especialidadId) {
      params = params.set('especialidadId', especialidadId.toString());
    }
    if (estado) {
      params = params.set('estado', estado);
    }
    if (pacienteId) {
      params = params.set('pacienteId', pacienteId.toString());
    }
    if (medicoId) {
      params = params.set('medicoId', medicoId.toString());
    }

    return this.http.get<Cita[]>(`${this.baseUrl}/citas/filtrar`, { params });
  }
}