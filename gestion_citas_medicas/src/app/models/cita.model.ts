import {Medico} from '../models/medico.model';
import {Paciente} from '../models/paciente.model';
  export interface Cita {
    id?: number;
    fecha: string; 
    hora: string;  
    estado: string; 
    especialidad: string; 
    medico: string;
    paciente: string;
    //notificacion?: any;
  }