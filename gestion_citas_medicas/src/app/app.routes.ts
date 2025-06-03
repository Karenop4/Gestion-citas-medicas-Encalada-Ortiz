import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component'; // Mantener MainComponent si es parte de la carga inicial principal

// Importaciones de componentes que ahora serán manejados por lazy loading
// ELIMINAR O COMENTAR LAS SIGUIENTES LÍNEAS si estos componentes están en módulos lazy-loaded:
// import { LoginComponent } from './features/auth/login/login.component';
// import { RegisterComponent } from './features/auth/register/register.component';
// import { AppointmentManagementComponent} from './features/admin/appointment-management/appointment-management.component';
// import {AppointmentRequestComponent} from './features/patient/appointment-request/appointment-request.component';
// import {ScheduleManagementComponent} from './features/admin/schedule-management/schedule-management.component';
// import {ProfileComponent} from './features/patient/profile/profile.component'
// import {ServComponent} from './features/servicios/serv.component'; // Este lo haremos lazy-loaded
// import {MyAppointmentsComponent} from './features/patient/my-appointments/my-appointments.component';


export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'main', component: MainComponent },
  // Rutas que ahora serán manejadas por sus módulos lazy-loaded
  // ELIMINAR O COMENTAR LAS SIGUIENTES RUTAS si ya están definidas dentro de los módulos lazy-loaded:
  // { path: 'login', component: LoginComponent },
  // { path: 'registro', component: RegisterComponent },
  // { path: 'horarios', component: ScheduleManagementComponent },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  { path: 'patient', loadChildren: () => import('./features/patient/patient.module').then(m => m.PatientModule) },
  { path: 'admin', loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule) },
  { path: '**', redirectTo: 'auth/login' }
];
