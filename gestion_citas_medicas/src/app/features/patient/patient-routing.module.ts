import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppointmentRequestComponent } from './appointment-request/appointment-request.component';
import { MyAppointmentsComponent } from './my-appointments/my-appointments.component';
import { ProfileComponent } from './profile/profile.component';
import {ServComponent} from './servicios/serv.component';
const routes: Routes = [
  { path: 'citas', component: AppointmentRequestComponent },
  { path: 'consultasC', component: MyAppointmentsComponent }, 
  { path: 'perfil', component: ProfileComponent },
  {path: 'servicios', component: ServComponent},
  { path: '', redirectTo: 'perfil', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientRoutingModule { }