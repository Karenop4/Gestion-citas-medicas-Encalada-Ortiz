// src/app/features/auth/login/login.component.ts

import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})


export class LoginComponent {
  constructor(private authService: AuthService) {}

  login() {
    this.authService.loginWithGoogle().then((res) => {
      console.log('Usuario autenticado:', res.user);
    });
  }
}
