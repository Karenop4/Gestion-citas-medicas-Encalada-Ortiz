// src/app/features/auth/auth-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Importa los componentes que pertenecen a este módulo
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  // Define las rutas hijas para el módulo 'auth'
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent }, // O 'register' si lo prefieres
  // Opcional: una ruta por defecto si el usuario navega a '/auth' sin una sub-ruta
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Usa forChild para módulos de características
  exports: [RouterModule]
})
export class AuthRoutingModule { }