import { Component } from '@angular/core';
import { Router } from '@angular/router'; 
import { RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'gestion_citas_medicas';
  
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


  showNavbar: boolean = true;
  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const routesToHideNavbar = ['/login', '/registro']; 
        this.showNavbar = !routesToHideNavbar.some(route => event.urlAfterRedirects.includes(route));
      }
    });
  }
}
