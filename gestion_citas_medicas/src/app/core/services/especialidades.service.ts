import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Especialidad {
  id?: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root',
})
export class EspecialidadesService {
  constructor(private firestore: Firestore) {}

  getEspecialidades(): Observable<Especialidad[]> {
    const especialidadesRef = collection(this.firestore, 'especialidades');
    return collectionData(especialidadesRef, { idField: 'id' }).pipe(
      map((docs: any[]) =>
        docs.map(doc => ({
          id: doc.id,
          nombre: doc.name // <--- usar el campo actual
        }))
      )
    );
  }

}
