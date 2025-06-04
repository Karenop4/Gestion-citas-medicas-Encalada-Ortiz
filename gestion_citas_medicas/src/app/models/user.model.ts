export interface Especialidad {
  id?: string;
  nombre: string;
}



export interface Usuario {
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
