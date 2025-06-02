import { Injectable } from '@angular/core';
import { Usuario } from '../../models/user.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  setUsuario(usuario: Usuario) {
    this.usuarioSubject.next(usuario);
  }

  getUsuario(): Usuario | null {
    return this.usuarioSubject.getValue();
  }
}