// src/app/features/admin/admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Importa los componentes que pertenecen a este módulo
import { AppointmentManagementComponent } from './appointment-management/appointment-management.component';
import { ScheduleManagementComponent } from './schedule-management/schedule-management.component';
import { EspecialidadComponent } from './especialidades/especialidad.component';

const routes: Routes = [
  // Define las rutas hijas para el módulo 'admin'
  { path: 'gcitas', component: AppointmentManagementComponent },
  { path: 'ghorarios', component: ScheduleManagementComponent },
  { path: 'gespecialidad', component: EspecialidadComponent },
  // Opcional: una ruta por defecto si el usuario navega a '/admin' sin una sub-ruta
  { path: '', redirectTo: 'gestion-citas', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Usa forChild para módulos de características
  exports: [RouterModule]
})
export class AdminRoutingModule { }
