import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  user$: Observable<any>;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.user$ = user(this.auth);
  }

  async loginWithGoogleAndLoadUser(tipo: 'p' | 'a') {
    const credential = await signInWithPopup(this.auth, new GoogleAuthProvider());
    const { uid, displayName, email } = credential.user;

    const userRef = doc(this.firestore, 'usuarios', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Usuario nuevo → crear documento
      const nuevo = {
        uid,
        nombre: displayName ?? '',
        correo: email ?? '',
        rol: tipo,
        datosCompletos: false
      };
      await setDoc(userRef, nuevo);
      return nuevo; // redirigir a /perfil
    } else {
      const userData = userSnap.data();
      if (!userData['datosCompletos']) {
        return userData; // redirigir a /perfil
      } else {
        return null; // ya tiene todo → ir a /main
      }
    }
  }

  updateUser(uid: string, datos: any) {
    const ref = doc(this.firestore, 'usuarios', uid);
    datos.datosCompletos = true;
    return setDoc(ref, datos);
  }

  logout() {
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
