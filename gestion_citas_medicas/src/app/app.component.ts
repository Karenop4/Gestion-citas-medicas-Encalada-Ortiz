import { Component,HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
import { RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { UserService } from './core/services/user.service';
import { Usuario } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  usuario: Usuario = this.getDefaultUsuario();
  title = 'gestion_citas_medicas';
    isScrolled: boolean = false;
  constructor(private router: Router, private userService: UserService, private auth: Auth, private authService: AuthService,) {}
  

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
  isDropdownOpen = false;
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.checkScroll();
  }
  checkScroll() {
    if (window.scrollY > 50) {
      this.isScrolled = true; // Aplica la clase 'scrolled'
    } else {
      this.isScrolled = false; // Remueve la clase 'scrolled'
    }
  }

  showNavbar: boolean = true;
  showFooter: boolean = true;
  ngOnInit(): void {
    const saved = localStorage.getItem('usuario');
    if (saved) {
      const usuarioGuardado: Usuario = JSON.parse(saved);
      this.userService.setUsuario(usuarioGuardado); 
    }

    this.userService.usuario$.subscribe(usuario => {
      this.usuario = usuario ?? this.getDefaultUsuario();
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const routesToHide = ['/login', '/registro', '/patient/perfil'];
        const hide = routesToHide.some(route => event.urlAfterRedirects.includes(route));
        this.showNavbar = !hide;
        this.showFooter = !hide;
      }
    });
  }

  private getDefaultUsuario(): Usuario {
    return {
      nombre: '',
      fechaNacimiento: '',
      genero: '',
      telefono: '',
      correo: '',
      direccion: '',
      nacionalidad: '',
      estadoCivil: '',
      cedula: '',
      contactoEmergencia: '',
      rol: 'p',
      esMedico: false,
      especialidad: '',
      datosCompletos: false
    };
  }
}
