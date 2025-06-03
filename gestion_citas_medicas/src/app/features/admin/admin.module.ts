// src/app/features/admin/admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module'; // Asegúrate de que esta línea esté presente


@NgModule({
  declarations: [
    // Si tus componentes (AppointmentManagementComponent, ScheduleManagementComponent) NO son standalone,
    // DEBES declararlos aquí:
    // AppointmentManagementComponent,
    // ScheduleManagementComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule // Importa el módulo de enrutamiento de administración
  ]
})
export class AdminModule { }
