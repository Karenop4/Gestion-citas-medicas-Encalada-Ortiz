import { Especialidad } from './especialidad.model';
import { Horario } from './horario.model';
export interface Usuario {// Define la interfaz Usuario
  // Esta interfaz representa un usuario del sistema, ya sea paciente o administrativo
  personalID?: number; // ID del usuario, opcional
  uid?: string;
  nombre: string;
  fechaNac: string;
  genero: string;
  telefono: string;
  correo: string;
  direccion: string;
  nacionalidad: string;
  estadoC: string;
  cedula: string;
  contactoC: string;
  rol: 'p' | 'a'; // paciente o administrativo
  esMedico?: boolean;
  datos?: boolean;

  especialidad?: Especialidad; 
  horario?: Horario;           
  tipoSangre?: string;         
  especialidadNombre?: string;
}
