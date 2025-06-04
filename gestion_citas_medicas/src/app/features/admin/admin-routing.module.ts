import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppointmentManagementComponent } from './appointment-management/appointment-management.component';
import { ScheduleManagementComponent } from './schedule-management/schedule-management.component';
import { EspecialidadComponent } from './especialidades/especialidad.component';

const routes: Routes = [
  { path: 'gcitas', component: AppointmentManagementComponent },
  { path: 'ghorarios', component: ScheduleManagementComponent },
  { path: 'gespecialidad', component: EspecialidadComponent },
  { path: '', redirectTo: 'gestion-citas', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)], 
  exports: [RouterModule]
})
export class AdminRoutingModule { }
