import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/user.model';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  user$: Observable<any>;

  constructor(private userService: UserService ,private auth: Auth, private firestore: Firestore) {
    this.user$ = user(this.auth);
  }

  async loginWithGoogleAndLoadUser(tipo: 'p' | 'a') {
    const credential = await signInWithPopup(this.auth, new GoogleAuthProvider());
    const { uid, displayName, email } = credential.user;

    const userRef = doc(this.firestore, 'usuarios', uid);
    const userSnap = await getDoc(userRef);

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
        especialidad: '',
        cedula: '',
        nacionalidad: '',
        estadoCivil: '',
        contactoEmergencia: ''
      };
      await setDoc(userRef, nuevo);
      this.userService.setUsuario(nuevo); 

      return nuevo;
    } else {
      const userData = userSnap.data() as Usuario;
      this.userService.setUsuario(userData); 
      if (!userData.datosCompletos) {
        return userData;
      } else {
        return null;
      }
    }


  }

  updateUser(uid: string, datos: any) {
    const ref = doc(this.firestore, 'usuarios', uid);
    datos.datosCompletos = true;
    return setDoc(ref, datos);
  }

  logout() {
    localStorage.removeItem('usuario');
    return signOut(this.auth);
  }

  async getUsuarioActual(uid: string): Promise<Usuario | null> {
    const userRef = doc(this.firestore, 'usuarios', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as Usuario;
    }
    return null;
  }
}
