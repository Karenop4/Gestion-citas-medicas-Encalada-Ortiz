// main.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from '../core/services/user.service'; // ¡Importa tu UserService!
import { Usuario } from '../models/user.model'; // ¡Importa tu modelo de Usuario!

// ¡Importa Firebase Auth aquí para que el UserService lo pueda usar en el constructor!
// Aunque no lo use directamente el MainComponent, es necesario para la inyección.
import { Auth } from '@angular/fire/auth';


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit, OnDestroy {
  userSubscription!: Subscription;
  userRole: string | null = null; // 'p' para paciente, 'a' para administrador, null si no logueado

  constructor(
    private router: Router,
    private userService: UserService, // Inyecta tu UserService
    private afAuth: Auth // Necesario para que Angular sepa que Auth está siendo usado y lo provea al UserService
  ) {}

  ngOnInit(): void {
    // Suscribirse al observable 'usuario$' del UserService
    this.userSubscription = this.userService.usuario$.subscribe(
      (user: Usuario | null) => {
        if (user && user.rol) {
          this.userRole = user.rol; // Asigna el rol del usuario
        } else {
          this.userRole = null; // Si no hay usuario o rol, el rol es null
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}