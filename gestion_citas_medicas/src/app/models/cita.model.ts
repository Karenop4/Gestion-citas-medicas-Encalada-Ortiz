import {Medico} from '../models/medico.model';
import {Paciente} from '../models/paciente.model';
import { Especialidad } from './especialidad.model';
  export interface Cita {
    id?: number;
    fecha: string; 
    hora: string;  
    estado: string; 
    especialidad: Especialidad; 
    medico: Medico;
    paciente: Paciente;
    //notificacion?: any;
  }