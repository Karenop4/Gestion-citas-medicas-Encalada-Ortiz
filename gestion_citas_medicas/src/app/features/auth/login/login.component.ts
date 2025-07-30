import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { AnimationItem } from 'lottie-web';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { CommonModule } from '@angular/common';

// Componente para el inicio de sesión
// Este componente permite al usuario seleccionar su tipo (paciente o administrativo) y realizar el inicio de sesión con Google
@Component({ 
  selector: 'app-login',
  standalone: true,
  imports: [LottieComponent, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})

// Este componente maneja el inicio de sesión y la selección del tipo de usuario
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) { }

  mostrarTipoUsuario = true;
  tipoUsuario: 'p' | 'a' | null = null;
  uidFirestore: string | null = null;

  options: AnimationOptions = {
    path: 'assets/doctores.json', // animación por defecto
  };

  // Método para inicializar la animación
  animationCreated(animationItem: AnimationItem): void {
    console.log(animationItem);
  }

  // Método para manejar la selección del tipo de usuario (paciente o administrativo)
  seleccionarUsuario(tipo: 'p' | 'a') {
    this.tipoUsuario = tipo;
    this.mostrarTipoUsuario = false;

    // Cambiar animación según el tipo seleccionado
    if (tipo === 'p') {
      this.options = {
        path: 'assets/paciente.json',
      };
    } else {
      this.options = {
        path: 'assets/doctorSaludo.json',
      };
    }
  }

  login() {
    if (!this.tipoUsuario) return;

    this.authService.loginWithGoogleAndLoadUser(this.tipoUsuario).then(data => {
      if (data) {// Si se obtiene un usuario, redirige al perfil del paciente
        this.router.navigate(['/patient/perfil'], { state: { user: data } });
      } else {// Si no se obtiene un usuario, verifica el tipo de usuario
        this.authService.user$.subscribe(async user => {
          if (!user) return;
          const uid = user.uid;
          const datos$ = this.authService.getUsuarioActual(uid);
          console.log('Observable datos$:', datos$);
          datos$.subscribe(datos => {
            console.log('Recibí datos:', datos);  // <-- Añade este para confirmar entrada
            if (datos) { // Si se obtienen los datos del usuario, verifica su rol
              console.log('Dentro del if(datos), datos:', datos);
              if (datos?.rol === this.tipoUsuario) {
                console.log('Rol coincide:', datos.rol);
                console.log('datos.datos:', datos.datos, 'typeof:', typeof datos.datos);

                if (datos.datos === true) {
                  this.router.navigate(['/main']);
                } else {
                  this.router.navigate(['/patient/perfil'], { state: { user: datos } });
                }
              } else {
                this.options = {
                  path: 'assets/doctores.json',
                };
                this.mostrarTipoUsuario = true;
              }
            } else {
              console.log('No hay datos');
            }
          });

        });
      }
    });
  }
}
