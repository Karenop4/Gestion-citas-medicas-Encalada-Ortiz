// src/app/shared/models/medico.model.ts (o donde tengas tus modelos)
import { Horario } from './horario.model'; // Asegúrate de la ruta correcta

export interface Medico {
  personalID: number;
  nombre: string | null;
  especialidad: string;
  horario: Horario | null; 
}