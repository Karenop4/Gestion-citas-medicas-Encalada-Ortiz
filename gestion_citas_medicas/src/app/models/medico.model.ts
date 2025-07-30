// src/app/shared/models/medico.model.ts (o donde tengas tus modelos)
import { Horario } from './horario.model'; // Asegúrate de la ruta correcta

export interface Medico {
  id: number;
  nombre: string | null;
  especialidad: string;
  horario: Horario; // ¡NUEVO CAMPO!
  // Si tienes más campos en MedicoDTO que quieras usar, agrégalos aquí
}