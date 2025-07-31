// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { Usuario } from '../../models/user.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { tap, catchError } from 'rxjs/operators';
import { Auth, user } from '@angular/fire/auth'; // ¡Necesitamos Auth de Firebase aquí!

@Injectable({ providedIn: 'root' })
export class UserService {
  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.getStoredUser());
  usuario$ = this.usuarioSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private afAuth: Auth // ¡Inyectamos Auth de AngularFire!
  ) {
    // Al iniciar el servicio, intentamos obtener el usuario de Firebase
    // y luego cargar su perfil desde nuestro backend.
    user(this.afAuth).pipe(
      tap(firebaseUser => {
        if (firebaseUser && firebaseUser.uid) {
          // Si hay un usuario de Firebase, cargamos su perfil desde nuestro backend
          this.loadUserProfileByFirebaseUid(firebaseUser.uid).subscribe({
            error: (err) => {
              console.error('Error al cargar el perfil del usuario desde el backend:', err);
              this.clearUser(); // Limpiar el usuario si hay un error
            }
          });
        } else {
          // Si no hay usuario de Firebase, limpiar el usuario local
          this.clearUser();
        }
      }),
      catchError(error => {
        console.error('Error al observar el usuario de Firebase:', error);
        this.clearUser();
        return of(null); // Manejar el error para no romper la cadena
      })
    ).subscribe(); // Asegúrate de suscribirte al observable
  }

  setUsuario(usuario: Usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }

  getUsuario(): Usuario | null {
    return this.usuarioSubject.getValue();
  }

  private getStoredUser(): Usuario | null {
    const stored = localStorage.getItem('usuario');
    return stored ? JSON.parse(stored) as Usuario : null;
  }

  clearUser() {
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
  }

  /**
   * Carga el perfil del usuario desde el backend usando el UID de Firebase.
   * Este es el método que conecta Firebase con tu base de datos.
   */
  loadUserProfileByFirebaseUid(firebaseUid: string): Observable<Usuario> {
    return this.apiService.getUserProfileByFirebaseUid(firebaseUid).pipe(
      tap(userProfile => {
        this.setUsuario(userProfile); // Almacena el perfil obtenido
      }),
      catchError(error => {
        console.error('Error al obtener el perfil del usuario con Firebase UID:', error);
        this.clearUser(); // Limpiar el usuario si hay un error
        return of(null as any); // Devolver un Observable de null o un error
      })
    );
  }
}