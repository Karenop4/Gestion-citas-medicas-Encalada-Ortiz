import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component'; 
import { LoginComponent } from './features/auth/login/login.component'; 
import { RegisterComponent } from './features/auth/register/register.component'; 
import { AppointmentManagementComponent} from './features/admin/appointment-management/appointment-management.component';
import {ScheduleManagementComponent} from './features/admin/schedule-management/schedule-management.component';
import {ProfileComponent} from './features/patient/profile/profile.component'
import {ServComponent} from './features/servicios/serv.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'main', component: MainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'perfil', component: ProfileComponent },
  { path: 'main', component: MainComponent },
  { path: 'servicios', component: ServComponent },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  { path: 'patient', loadChildren: () => import('./features/patient/patient.module').then(m => m.PatientModule) },
  { path: 'admin', loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule) },
  { path: 'horarios', component:ScheduleManagementComponent },
  { path: 'citas',component:AppointmentManagementComponent},
  { path: '**', redirectTo: 'auth/login' }
];