import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { AnimationItem } from 'lottie-web';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LottieComponent, CommonModule],  // <-- Importa aquí el componente de Lottie
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  mostrarTipoUsuario = true;
  tipoUsuario: 'paciente' | 'administrativo' | null = null;

  options: AnimationOptions = {
    path: 'assets/doctores.json', // animación por defecto
  };

  animationCreated(animationItem: AnimationItem): void {
    console.log(animationItem);
  }

  seleccionarUsuario(tipo: 'paciente' | 'administrativo') {
    this.tipoUsuario = tipo;
    this.mostrarTipoUsuario = false;

    // Cambiar animación según el tipo seleccionado
    if (tipo === 'paciente') {
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
    this.authService.loginWithGoogle().then(() => {
      this.router.navigate(['/main']);
    });
  }
}
