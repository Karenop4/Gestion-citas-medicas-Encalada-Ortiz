import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medico } from '../../models/medico.model';
import { Cita } from '../../models/cita.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  loadSpecialties(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/especialidades`);
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

  registerAppointment(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(`${this.baseUrl}/citas`, cita);
  }
}
