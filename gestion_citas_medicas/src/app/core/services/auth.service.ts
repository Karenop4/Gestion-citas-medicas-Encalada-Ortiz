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

  async loginWithGoogleAndLoadUser(tipoUsuario: 'p' | 'a'): Promise<Usuario | null> {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      const user = credential.user;

      if (user) {
        const uid = user.uid;
        // Intenta obtener el perfil del backend
        const backendUser = await this.getUsuarioActual(uid).toPromise(); // Convierte Observable a Promise

        if (!backendUser) {
          // Usuario no existe en el backend, hay que registrarlo
          const newUser: Usuario = {
            uid: uid,
            nombre: user.displayName || 'Usuario Nuevo',
            correo: user.email || '',
            rol: tipoUsuario,
            esMedico: tipoUsuario === 'a' ? true : false, // Por defecto, si es 'a' es médico.
            datos: false, // Perfil incompleto al registrarse
            personalID: undefined, // Se generará en el backend
            // Inicializa las demás propiedades vacías o con valores por defecto
            cedula: '', contactoC: '', telefono: '', direccion: '',
            estadoC: '', genero: '', nacionalidad: '', fechaNac: '',
          };
          // Asume que tienes un endpoint para registrar (POST) nuevos usuarios
          const registeredUser = await this.http.post<Usuario>(`http://localhost:8080/api/usuarios/register`, newUser).toPromise();
          if (registeredUser) {
            this.userService.setUsuario(registeredUser); // Guarda en UserService/localStorage
            return registeredUser; // Retorna el usuario recién registrado
          } else {
            console.error('Error al registrar el nuevo usuario en el backend.');
            return null;
          }
        } else {
          // Usuario ya existe en el backend, solo cargarlo
          this.userService.setUsuario(backendUser); // Guarda en UserService/localStorage
          return backendUser; // Retorna el usuario existente
        }
      }
      return null;
    } catch (error) {
      console.error('Error al iniciar sesión con Google o cargar usuario:', error);
      return null;
    }
  }

  logout() {
    localStorage.removeItem('usuario');
    return signOut(this.auth);
  }

  getUsuarioActual(uid: string): Observable<Usuario | null> {
    // Asegúrate de que esta URL sea EXACTAMENTE la del controlador de Usuario que devuelve UsuarioDTO
    const url = `http://localhost:8080/api/usuarios/porFirebaseUid?uid=${uid}`;
    console.log("AuthService: Intentando obtener usuario de:", url); // Log para verificar la URL
    return this.http.get<Usuario>(url);
  }

updateUser(usuario: Usuario): Observable<Usuario> {
    const endpoint = usuario.rol === 'p' ? 'pacientes' : 'medicos';

    // ¡Directamente usamos personalID porque ahora es consistente!
    if (!usuario.personalID) {
      console.error(`Error: Intentando actualizar ${endpoint} sin personalID.`);
    }

    // El objeto 'usuario' de Angular se envía directamente, ya que tiene 'personalID'
    // y tus DTOs del backend ahora esperan 'personalID'. ¡Simple y limpio!
    return this.http.put<Usuario>(`http://localhost:8080/api/${endpoint}/put/${usuario.personalID}`, usuario);
  }

}
