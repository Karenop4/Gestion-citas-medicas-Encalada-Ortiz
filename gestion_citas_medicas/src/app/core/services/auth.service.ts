import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/user.model';
import { UserService } from './user.service';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  user$: Observable<any>; // Observable para el usuario autenticado

  constructor(private userService: UserService ,private auth: Auth, private firestore: Firestore, private http: HttpClient) { // Inyectamos Auth y Firestore
    // Inicializamos el observable del usuario autenticado
    this.user$ = user(this.auth);
  }

  // Método para iniciar sesión con Google y cargar el usuario
  async loginWithGoogleAndLoadUser(tipo: 'p' | 'a') { // 'p' para paciente, 'a' para administrador
    const credential = await signInWithPopup(this.auth, new GoogleAuthProvider());// Iniciamos sesión con Google
    const { uid, displayName, email } = credential.user; // Obtenemos los datos del usuario autenticado

    const userRef = doc(this.firestore, 'usuarios', uid);// Referencia al documento del usuario en Firestore
    const userSnap = await getDoc(userRef); // Obtenemos el documento del usuario

    // Si el usuario no existe, lo creamos con los datos básicos
    if (!userSnap.exists()) {
      const nuevo: Usuario = {
        uid,
        nombre: displayName ?? '',
        correo: email ?? '',
        rol: tipo,
        datosCompletos: false,
        fechaNacimiento: '',
        genero: '',
        telefono: '',
        direccion: '',
        especialidad : { nombre: '', id: 1, activa: true }, // Inicializamos especialidad como un objeto vacío
        cedula: '',
        nacionalidad: '',
        estadoCivil: '',
        contactoEmergencia: ''
      };
      await setDoc(userRef, nuevo);

      if(tipo === 'p') {
        this.http.post('http://localhost:8080/api/pacientes', nuevo).subscribe({
          next: res => console.log('Usuario guardado en el backend:', res),
          error: err => console.error('Error al guardar en el backend:', err)
        });
      }else if(tipo === 'a') {
        this.http.post('http://localhost:8080/api/medicos', nuevo).subscribe({
          next: res => console.log('Administrador guardado en el backend:', res),       
          error: err => console.error('Error al guardar en el backend:', err)
        });
      }

      this.userService.setUsuario(nuevo);

      return nuevo;
    } else { // Si el usuario ya existe, lo cargamos
      const userData = userSnap.data() as Usuario;
      this.userService.setUsuario(userData); 
      if (!userData.datosCompletos) {
        return userData;
      } else {
        return null;
      }
    }
  }

  // Método para actualizar los datos del usuario
  updateUser(uid: string, datos: any) {
    const ref = doc(this.firestore, 'usuarios', uid);
    datos.datosCompletos = true;
    return setDoc(ref, datos);
  }

  // Método para cerrar sesión y limpiar el usuario del localStorage
  logout() {
    localStorage.removeItem('usuario');
    return signOut(this.auth);
  }

  // Método para obtener el usuario actual desde Firestore
  async getUsuarioActual(uid: string): Promise<Usuario | null> {
    const userRef = doc(this.firestore, 'usuarios', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as Usuario;
    }
    return null;
  }
}
