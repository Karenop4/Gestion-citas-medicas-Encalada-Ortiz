 import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../models/user.model';
import { UserService } from '../../../core/services/user.service';
import { EspecialidadesService, Especialidad } from '../../../core/services/especialidades.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  usuario: Usuario = this.getDefaultUsuario();
  especialidades: Especialidad[] = [];

  constructor(
    private router: Router,
    private auth: Auth,
    private authService: AuthService,
    private userService: UserService,
    private especialidadesService: EspecialidadesService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state as any;
    if (state?.user) {
      this.usuario = { ...this.getDefaultUsuario(), ...state.user };
    }
  }

async ngOnInit() {
  this.especialidadesService.getEspecialidades().subscribe(
    esps => {
      this.especialidades = esps;

      this.authService.user$.subscribe(async user => {
        if (!user) return;

        const uid = user.uid;
        this.authService.getUsuarioActual(uid).subscribe(datos => {
  //("--- DEBUG DE CARGA DE USUARIO ---");
  //("Objeto 'datos' recibido directamente del backend:", datos); // <-- ¡Log MUY IMPORTANTE!
  if (datos) {
    this.usuario = { ...datos }; // Asignación

    //("Contenido de this.usuario después de asignación:", this.usuario);
    //("Valor de this.usuario.personalID:", this.usuario.personalID);
    //("Valor de datos.personalID:", (datos as any).personalID); // Intenta acceder a personalID en 'datos' directamente
    //("Valor de datos.id:", (datos as any).id); // Por si acaso sigue viniendo como 'id'
    //("--- FIN DEBUG ---");

    // ... el resto de tu lógica (sincronización de especialidad, setUsuario, localStorage) ...
  } else {
    //("No se recibieron datos del usuario.");
  }
});
      });
    },
    error => {
      console.error('Error al obtener especialidades:', error);
    }
  );
}

  guardar() {
    if (!this.auth.currentUser) return;

    this.usuario.uid = this.auth.currentUser.uid;
    this.usuario.correo = this.auth.currentUser.email ? this.auth.currentUser.email : '';
    //("Usuario a guardar:", this.usuario);
    this.usuario.datos = true; // Aseguramos que los datos estén completos antes de guardar
    this.authService.updateUser(this.usuario).subscribe(() => {
      localStorage.setItem('usuario', JSON.stringify(this.usuario));
      this.userService.setUsuario(this.usuario);
      alert('Datos guardados correctamente');
      this.router.navigate(['/main']);
    });
  }

  compareEspecialidad(o1: Especialidad, o2: Especialidad): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  private getDefaultUsuario(): Usuario {
  return {
    nombre: '',
    fechaNac: '',
    genero: '',
    telefono: '',
    correo: '',
    direccion: '',
    nacionalidad: '',
    estadoC: '',
    cedula: '',
    contactoC: '',
    rol: 'p',
    esMedico: false,
    especialidad: { id: 1, nombre: '' , activa: true },
    datos: false,
    personalID: undefined // O null, para ser explícito
  };
  }
}