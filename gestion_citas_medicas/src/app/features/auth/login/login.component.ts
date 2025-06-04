import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { AnimationItem } from 'lottie-web';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { CommonModule } from '@angular/common';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { UserCredential } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LottieComponent, CommonModule],  // <-- Importa aquí el componente de Lottie
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router, private firestore: Firestore) { }

  mostrarTipoUsuario = true;
  tipoUsuario: 'p' | 'a' | null = null;

  options: AnimationOptions = {
    path: 'assets/doctores.json', // animación por defecto
  };

  animationCreated(animationItem: AnimationItem): void {
    console.log(animationItem);
  }

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
      if (data) {
        this.router.navigate(['/patient/perfil'], { state: { user: data } });
      } else {
        this.authService.user$.subscribe(async user => {
          if (!user) return;

          const uid = user.uid;
          const datos = await this.authService.getUsuarioActual(uid);
          if(datos){
            if (datos?.rol === this.tipoUsuario) {
            this.router.navigate(['/main']);
          }
          else {
              this.options={
                  path: 'assets/doctores.json',
              };
              this.mostrarTipoUsuario=true;
          }
          }
        });
      }
    });
  }
}
