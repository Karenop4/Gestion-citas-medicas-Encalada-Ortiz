import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../models/user.model';
import { UserService } from '../../../core/services/user.service';
import { EspecialidadesService, Especialidad } from '../../../core/services/especialidades.service';

@Component({// Componente para el perfil del paciente
  selector: 'app-profile',
  standalone: true, // Indica que este componente es independiente y puede ser utilizado sin necesidad de un módulo específico
  imports: [CommonModule, FormsModule], 
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

// Este componente permite al paciente ver y editar su perfil
export class ProfileComponent implements OnInit {
  usuario: Usuario = this.getDefaultUsuario();// Inicializa el usuario con valores por defecto
  especialidades: Especialidad[] = []; // Lista de especialidades disponibles

  constructor(// Inyecta los servicios necesarios para el componente
    private router: Router,
    private auth: Auth,
    private authService: AuthService,
    private userService: UserService,
    private especialidadesService: EspecialidadesService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state as any; // Obtiene el estado de la navegación actual
    // Si hay un usuario en el estado, lo fusiona con los valores por defecto
    if (state?.user) {
      this.usuario = { ...this.getDefaultUsuario(), ...state.user };
    }
  }

  // Método que se ejecuta al inicializar el componente
  // Se suscribe al observable del usuario actual y obtiene las especialidades disponibles
  async ngOnInit() {
    this.authService.user$.subscribe(async user => {
      if (!user) return;

      const uid = user.uid;
      const datos = await this.authService.getUsuarioActual(uid);

      if (datos) {
        this.usuario = datos;
        this.userService.setUsuario(this.usuario);
        localStorage.setItem('usuario', JSON.stringify(this.usuario));
      }
    });

    this.especialidadesService.getEspecialidades().subscribe(
      esps => {
        this.especialidades = esps;
      },
      error => {
        console.error('Error al obtener especialidades:', error);
      }
    );
  }

  // Método para guardar los datos del usuario
  guardar() {
    if (!this.auth.currentUser) return; // Verifica si el usuario está autenticado

    // Asigna el uid y correo del usuario autenticado al objeto usuario
    this.usuario.uid = this.auth.currentUser.uid;
    this.usuario.correo = this.auth.currentUser.email ? this.auth.currentUser.email : '';

    // Verifica si el usuario ya tiene datos completos
    this.authService.updateUser(this.usuario.uid, this.usuario).then(() => {
      localStorage.setItem('usuario', JSON.stringify(this.usuario)); // Guarda el usuario en el localStorage
      this.userService.setUsuario(this.usuario); 
      alert('Datos guardados correctamente');
      this.router.navigate(['/main']); 
    });
  }

  
  private getDefaultUsuario(): Usuario {// Método privado para obtener un usuario con valores por defecto
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
