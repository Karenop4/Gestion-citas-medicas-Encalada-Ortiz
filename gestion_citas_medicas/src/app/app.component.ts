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
  isDropdownOpen = false; // Estado del dropdown del usuario
  isSideMenuOpen: boolean = false; // <--- NUEVO: Estado del menú lateral

  constructor(private router: Router, private userService: UserService, private auth: Auth, private authService: AuthService,) {}
  

  goToLogin(): void {
    this.router.navigate(['/login']);
    this.closeSideMenu(); // <--- Cierra el menú lateral al navegar
    this.isDropdownOpen = false; // Cierra el dropdown también
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // <--- NUEVOS MÉTODOS PARA EL MENÚ LATERAL
  toggleSideMenu(): void {
    this.isSideMenuOpen = !this.isSideMenuOpen;
    if (this.isSideMenuOpen) {
      document.body.style.overflow = 'hidden'; // Evita el scroll del cuerpo
    } else {
      document.body.style.overflow = ''; // Restaura el scroll
    }
  }

  closeSideMenu(): void {
    this.isSideMenuOpen = false;
    document.body.style.overflow = ''; // Restaura el scroll
  }
  // FIN NUEVOS MÉTODOS

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.closeSideMenu(); // <--- Cierra el menú lateral al navegar
    this.isDropdownOpen = false; // Cierra el dropdown también
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
        // <--- NUEVO: Asegurarse de cerrar el menú lateral si la ruta cambia
        this.closeSideMenu(); 
      }
    });
  }

  private getDefaultUsuario(): Usuario {
    return {
      nombre: '',
      fechaNac: '',
      genero: '',
      telefono: '',
      correo: '',
      direccion: '',
      nacionalidad: '',
      estadoC: '',
      cedula: '',
      contactoC: '',
      rol: 'p',
      esMedico: false,
      especialidad: { nombre: '', id: 0, activa: true}, // Inicializamos especialidad como un objeto vacío
      datos: false
    };
  }
}
