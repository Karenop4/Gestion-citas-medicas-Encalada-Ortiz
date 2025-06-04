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
    const uid = this.auth.currentUser?.uid;
    if (!uid) return;

    const datos = await this.authService.getUsuarioActual(uid);
    if (datos) {
      this.usuario = datos;
      this.userService.setUsuario(this.usuario);
    }

    this.especialidadesService.getEspecialidades().subscribe(esps => {
      this.especialidades = esps;
    }, error => {
      console.error('Error al obtener contactos:', error);
    });

  }

  

  guardar() {
    if (!this.auth.currentUser) return;

    this.usuario.uid = this.auth.currentUser.uid;
    this.usuario.correo = this.auth.currentUser.email ? this.auth.currentUser.email : '';

    this.authService.updateUser(this.usuario.uid, this.usuario).then(() => {
      alert('Datos guardados correctamente');
      this.userService.setUsuario(this.usuario);
      this.router.navigate(['/main']);
    });
  }

  private getDefaultUsuario(): Usuario {
    return {
      nombre: '',
      fechaNacimiento: '',
      genero: '',
      telefono: '',
      correo: '',
      direccion: '',
      nacionalidad: '',
      estadoCivil: '',
      cedula: '',
      contactoEmergencia: '',
      rol: 'p',
      esMedico: false,
      especialidad: '',
      datosCompletos: false
    };
  }
}
