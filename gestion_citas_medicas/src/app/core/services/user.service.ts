import { Injectable } from '@angular/core';
import { Usuario } from '../../models/user.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
// Servicio para manejar el usuario actual
// Este servicio se encarga de almacenar y recuperar el usuario actual en el localStorage
export class UserService {
  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.getStoredUser()); // Inicializa el BehaviorSubject con el usuario almacenado en localStorage
  usuario$ = this.usuarioSubject.asObservable();// Observable para que otros componentes puedan suscribirse a los cambios del usuario

  setUsuario(usuario: Usuario) {// Método para establecer el usuario actual
    localStorage.setItem('usuario', JSON.stringify(usuario)); 
    this.usuarioSubject.next(usuario);
  }

  getUsuario(): Usuario | null {// Método para obtener el usuario actual
    return this.usuarioSubject.getValue();
  }

  private getStoredUser(): Usuario | null { // Método privado para recuperar el usuario almacenado en localStorage
    const stored = localStorage.getItem('usuario');
    return stored ? JSON.parse(stored) as Usuario : null;
  }
}
