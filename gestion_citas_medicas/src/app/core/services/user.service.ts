// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { Usuario } from '../../models/user.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { tap, catchError } from 'rxjs/operators';
import { Auth, user } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class UserService {
  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.getStoredUser());
  usuario$ = this.usuarioSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private afAuth: Auth
  ) {
    console.log('UserService constructor: Intentando obtener usuario de Firebase...');
    user(this.afAuth).pipe(
      tap(firebaseUser => {
        if (firebaseUser) {
          console.log('UserService: Usuario de Firebase detectado, UID:', firebaseUser.uid);
          if (firebaseUser.uid) {
            this.loadUserProfileByFirebaseUid(firebaseUser.uid).subscribe({
              error: (err) => {
                console.error('UserService: Error al cargar el perfil del usuario desde el backend:', err);
                this.clearUser();
              },
              complete: () => {
                console.log('UserService: Carga de perfil del backend completada (independientemente del éxito/error).');
              }
            });
          } else {
            console.warn('UserService: Usuario de Firebase sin UID. Limpiando usuario local.');
            this.clearUser();
          }
        } else {
          console.log('UserService: No hay usuario de Firebase autenticado. Limpiando usuario local.');
          this.clearUser();
        }
      }),
      catchError(error => {
        console.error('UserService: Error al observar el usuario de Firebase:', error);
        this.clearUser();
        return of(null);
      })
    ).subscribe();
  }

  setUsuario(usuario: Usuario) {
    console.log('UserService: Estableciendo usuario en localStorage y emitiendo:', usuario);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }

  getUsuario(): Usuario | null {
    const current = this.usuarioSubject.getValue();
    console.log('UserService: getUsuario() llamado, valor actual:', current);
    return current;
  }

  private getStoredUser(): Usuario | null {
    const stored = localStorage.getItem('usuario');
    const user = stored ? JSON.parse(stored) as Usuario : null;
    console.log('UserService: getStoredUser() llamado, usuario almacenado:', user);
    return user;
  }

  clearUser() {
    console.log('UserService: Limpiando usuario (localStorage y subject).');
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
  }

  loadUserProfileByFirebaseUid(firebaseUid: string): Observable<Usuario> {
    console.log('UserService: Llamando a apiService.getUserProfileByFirebaseUid con UID:', firebaseUid);
    return this.apiService.getUserProfileByFirebaseUid(firebaseUid).pipe(
      tap(userProfile => {
        console.log('UserService: Perfil del usuario obtenido del backend:', userProfile);
        if (userProfile && userProfile.id && userProfile.rol) {
          this.setUsuario(userProfile);
        } else {
          console.warn('UserService: Perfil del usuario incompleto recibido del backend. Limpiando usuario.', userProfile);
          this.clearUser();
        }
      }),
      catchError(error => {
        console.error('UserService: Error en loadUserProfileByFirebaseUid:', error);
        this.clearUser();
        throw error; // Re-lanza el error para que sea manejado por el suscriptor
      })
    );
  }
}