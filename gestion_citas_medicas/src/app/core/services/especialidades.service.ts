import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface Especialidad { // Define la interfaz para Especialidad
  id?: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root',
})

// Servicio para manejar las especialidades
// Este servicio se encarga de obtener las especialidades desde Firestore
export class EspecialidadesService {
  constructor(private firestore: Firestore) {}

  getEspecialidades(): Observable<Especialidad[]> {
    const especialidadesRef = collection(this.firestore, 'especialidades');
    return collectionData(especialidadesRef, { idField: 'id' }).pipe(
      map((docs: any[]) =>
        docs.map(doc => ({
          id: doc.id,
          nombre: doc.name 
        }))
      )
    );
  }

}
