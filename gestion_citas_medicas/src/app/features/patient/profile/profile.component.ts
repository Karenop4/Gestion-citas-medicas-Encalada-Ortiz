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
    // Cargar especialidades primero
    this.especialidadesService.getEspecialidades().subscribe(
      esps => {
        this.especialidades = esps;

        // Luego cargar usuario y sincronizar especialidad
        this.authService.user$.subscribe(async user => {
          if (!user) return;

          const uid = user.uid;
          this.authService.getUsuarioActual(uid).subscribe(datos => {
            if (datos) {
              this.usuario = datos;
              
              // Sincronizar la especialidad con la lista para que sea el mismo objeto
              if (this.usuario.especialidad?.id) {
                const espSeleccionada = this.especialidades.find(e => e.id === this.usuario.especialidad.id);
                if (espSeleccionada) {
                  this.usuario.especialidad = espSeleccionada;
                }
              }

              this.userService.setUsuario(this.usuario);
              localStorage.setItem('usuario', JSON.stringify(this.usuario));
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
    console.log("Usuario a guardar:", this.usuario);

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
      especialidad: { id: 1, nombre: '' , activa: true }, // Inicializamos especialidad como un objeto vacío
      datosCompletos: false
    };
  }
}