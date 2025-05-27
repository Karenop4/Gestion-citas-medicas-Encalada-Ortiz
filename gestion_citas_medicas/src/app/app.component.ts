import { Component,HostListener } from '@angular/core';
import { Router } from '@angular/router'; 
import { RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  
  

  title = 'gestion_citas_medicas';
   isScrolled: boolean = false;
  constructor(private router: Router) {}

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
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      const routesToHide = ['/login', '/registro'];
      const hide = routesToHide.some(route => event.urlAfterRedirects.includes(route));
      this.showNavbar = !hide;
      this.showFooter = !hide;
    }
  });
}

}
