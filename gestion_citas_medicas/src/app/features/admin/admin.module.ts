// src/app/features/admin/admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module'; 


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    AdminRoutingModule // Importa el módulo de enrutamiento de administración
  ]
})
export class AdminModule { }
