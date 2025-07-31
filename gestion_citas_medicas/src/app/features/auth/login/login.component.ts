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
    //(animationItem);
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

    this.authService.loginWithGoogleAndLoadUser(this.tipoUsuario).then(userFromBackend => { // Cambié 'data' a 'userFromBackend' para más claridad
      if (userFromBackend) { // Si se obtiene un usuario, redirige al perfil del paciente
        //('--- DEBUG REDIRECCIÓN (LoginComponent) ---');
        //('1. Usuario obtenido de loginWithGoogleAndLoadUser (userFromBackend):', userFromBackend);
        //('2. Valor original de userFromBackend.datos:', userFromBackend.datos);
        //('3. Tipo original de userFromBackend.datos:', typeof userFromBackend.datos);

        // --- ¡Línea clave de conversión! ---
        const datosEsBooleanoTrue: boolean = !!userFromBackend.datos; 
        //('4. Valor convertido a booleano estricto (datosEsBooleanoTrue):', datosEsBooleanoTrue);
        //('5. Tipo de datosEsBooleanoTrue:', typeof datosEsBooleanoTrue);
        //('6. Resultado de la comparación (datosEsBooleanoTrue === true):', datosEsBooleanoTrue === true);
        //('-------------------------------------');

        if (datosEsBooleanoTrue === true) { // <--- Usamos la variable convertida aquí
          //('Decisión FINAL: Perfil completo, redirigiendo a /main');
          this.router.navigate(['/main']);
        } else {
          //('Decisión FINAL: Perfil incompleto (o no es true), redirigiendo a /patient/perfil');
          this.router.navigate(['/patient/perfil'], { state: { user: userFromBackend } });
        }
      } else {
        // Si no se obtiene un usuario desde loginWithGoogleAndLoadUser,
        // esto implicaría un fallo en el login o registro.
        // La lógica de `authService.user$.subscribe` que tenías aquí
        // ahora la encapsula `loginWithGoogleAndLoadUser`.
        // Este `else` solo se ejecutaría si `loginWithGoogleAndLoadUser` retorna `null`.
        console.error('LoginComponent: No se pudo obtener el usuario después del intento de login.');
        this.options = {
          path: 'assets/doctores.json',
        };
        this.mostrarTipoUsuario = true;
      }
    }).catch(error => {
      console.error('LoginComponent: Error en el proceso de login:', error);
      // Restablecer UI en caso de error
      this.options = {
        path: 'assets/doctores.json',
      };
      this.mostrarTipoUsuario = true;
    });
  }
}
