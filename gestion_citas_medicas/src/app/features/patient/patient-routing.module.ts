// src/app/features/patient/patient-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Importa los componentes que pertenecen a este módulo
import { AppointmentRequestComponent } from './appointment-request/appointment-request.component';
import { MyAppointmentsComponent } from './my-appointments/my-appointments.component';
import { ProfileComponent } from './profile/profile.component';
import {ServComponent} from './servicios/serv.component';
const routes: Routes = [
  // Define las rutas hijas para el módulo 'patient'
  { path: 'citas', component: AppointmentRequestComponent },
  { path: 'consultasC', component: MyAppointmentsComponent }, 
  { path: 'perfil', component: ProfileComponent },
  {path: 'servicios', component: ServComponent},
  { path: '', redirectTo: 'perfil', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Usa forChild para módulos de características
  exports: [RouterModule]
})
export class PatientRoutingModule { }