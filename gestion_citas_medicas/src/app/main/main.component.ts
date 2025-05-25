import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
}