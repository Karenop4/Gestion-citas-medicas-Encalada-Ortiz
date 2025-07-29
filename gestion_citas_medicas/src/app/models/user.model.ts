import { Especialidad } from './especialidad.model';
export interface Usuario {// Define la interfaz Usuario
  // Esta interfaz representa un usuario del sistema, ya sea paciente o administrativo
  uid?: string;
  nombre: string;
  fechaNacimiento: string;
  genero: string;
  telefono: string;
  correo: string;
  direccion: string;
  nacionalidad: string;
  estadoCivil: string;
  cedula: string;
  contactoEmergencia: string;
  rol: 'p' | 'a'; // paciente o administrativo
  esMedico?: boolean;
  especialidad: Especialidad | string; // Puede ser un objeto Especialidad o un string
  datosCompletos?: boolean;
}
