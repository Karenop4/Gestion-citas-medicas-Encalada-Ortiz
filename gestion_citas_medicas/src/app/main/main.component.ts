// main.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { Subscription, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

// Define la interfaz para el usuario de Firestore (puedes expandirla según tus datos)
interface UserData {
  rol?: string; // Asume que el rol se guarda en un campo 'rol' (con 'l' minúscula)
}

// Servicio de ejemplo para obtener el rol del usuario desde Firestore
// En un proyecto real, esto estaría en un archivo de servicio separado (ej. user.service.ts)
// y se inyectaría en el constructor.
class UserService {
  constructor(private firestore: Firestore) {}

  getUserRole(uid: string): Observable<string | null> {
    const userDocRef = doc(this.firestore, `usuarios/${uid}`);
    return new Observable<string | null>(observer => {
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as UserData;
          observer.next(userData.rol || null);
        } else {
          observer.next(null); // No se encontró el documento de usuario
        }
        observer.complete();
      }).catch(error => {
        console.error('Error al obtener el rol del usuario:', error);
        observer.error(error);
      });
    });
  }
}


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit, OnDestroy {
  authSubscription!: Subscription;
  userRole: string | null = null; // 'p' para paciente, 'a' para administrador, null si no logueado

  constructor(
    private router: Router,
    private afAuth: Auth, // Inyecta el servicio Auth de AngularFire
    private firestore: Firestore // Inyecta Firestore para el UserService
  ) {}

  ngOnInit(): void {
    // Inicializa el UserService aquí o inyéctalo si es un servicio real
    const userService = new UserService(this.firestore);

    // Suscríbete al observable 'user' de AngularFireAuth
    this.authSubscription = user(this.afAuth).pipe(
      tap(firebaseUser => {
        if (!firebaseUser) {
          // Si no hay usuario autenticado, el rol es null
          this.userRole = null;
          // console.log('No hay usuario autenticado.'); // Línea de depuración eliminada
        }
      }),
      switchMap(firebaseUser => {
        if (firebaseUser && firebaseUser.uid) {
          // Si hay un usuario, obtener su rol
          return userService.getUserRole(firebaseUser.uid);
        } else {
          // No hay usuario, emite null para el rol
          return of(null);
        }
      })
    ).subscribe(role => {
      // Asigna el rol obtenido a la propiedad del componente
      this.userRole = role;
    });
  }

  ngOnDestroy(): void {
    // Es crucial desuscribirse para evitar fugas de memoria
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
