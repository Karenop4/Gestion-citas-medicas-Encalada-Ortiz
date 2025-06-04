import { Injectable } from '@angular/core';
import { Usuario } from '../../models/user.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.getStoredUser());
  usuario$ = this.usuarioSubject.asObservable();

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
}
