import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, user } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { Usuario } from '../../models/user.model';
import { UserService } from './user.service';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user$: Observable<any>;
  tipo: 'p' | 'a' | null = null;

  constructor(
    private userService: UserService,
    private auth: Auth,
    private http: HttpClient
  ) {
    this.user$ = user(this.auth);
  }

  async loginWithGoogleAndLoadUser(tipo: 'p' | 'a'): Promise<Usuario> {
    this.tipo = tipo; // Guarda si es paciente o administrativo (médico)

    const credential = await signInWithPopup(this.auth, new GoogleAuthProvider());
    const { uid, displayName, email } = credential.user;


    const nuevo: Usuario = {
      uid,
      nombre: displayName ?? '',
      correo: email ?? '',
      rol: tipo,
      datos: false,
      fechaNac: '',
      genero: '',
      telefono: '',
      direccion: '',
      especialidad: { nombre: '', id: 1, activa: true },
      cedula: '',
      nacionalidad: '',
      estadoC: '',
      contactoC: '',
      esMedico: tipo === 'a' // Solo true si es administrativo
    };

    const endpoint = tipo === 'p' ? 'pacientes' : 'medicos';
    const getUrl = `http://localhost:8080/api/${endpoint}/uid/${uid}`;
    const postUrl = `http://localhost:8080/api/${endpoint}`;

    return new Promise<Usuario>((resolve, reject) => {
      this.http.get<Usuario>(getUrl).pipe(
        catchError(() => of(null)) // Si no existe, devolver null
      ).subscribe((existente) => {
        if (existente) {
          console.log('Usuario ya registrado:', existente);
          this.userService.setUsuario(existente);
          resolve(existente);
        } else {
          this.http.post<Usuario>(postUrl, nuevo).subscribe({
            next: creado => {
              console.log('Usuario creado en backend:', creado);
              this.userService.setUsuario(creado);
              resolve(creado);
            },
            error: err => {
              console.error('Error al registrar usuario:', err);
              reject(err);
            }
          });
        }
      });
    });
  }

  logout() {
    localStorage.removeItem('usuario');
    return signOut(this.auth);
  }

  getUsuarioActual(uid: string): Observable<Usuario> {
    const endpoint = this.tipo === 'p' ? 'pacientes' : 'medicos';
    return this.http.get<Usuario>(`http://localhost:8080/api/${endpoint}/uid/${uid}`);
  }

  updateUser(usuario: Usuario): Observable<Usuario> {
  const endpoint = this.tipo === 'p' ? 'pacientes' : 'medicos';
  if (!usuario.id) {
    throw new Error('El usuario no tiene un personalID válido.');
  }
  return this.http.put<Usuario>(`http://localhost:8080/api/${endpoint}/put/${usuario.id}`, usuario);
}
}
