export interface Horario {
  id?: number | null; 
  descanso: boolean;
  dias: string; // "1,2,3,4,5"
  horaDescanso: string | null; 
  horaFin: string;     
  horaInicio: string;   
}