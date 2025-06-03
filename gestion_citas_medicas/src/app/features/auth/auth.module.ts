// src/app/features/auth/auth.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module'; // Asegúrate de que esta línea esté presente


@NgModule({
  declarations: [
    // Si tus componentes (LoginComponent, RegisterComponent) NO son standalone,
    // DEBES declararlos aquí:
    // LoginComponent,
    // RegisterComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule // Importa el módulo de enrutamiento de autenticación
  ]
})
export class AuthModule { }