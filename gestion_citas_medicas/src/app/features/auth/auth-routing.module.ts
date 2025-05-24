// src/app/features/auth/auth-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'; // 👈 Asegúrate de importar esto

const routes: Routes = [
  { path: 'login', component: LoginComponent } // 👈 Ruta añadida
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
