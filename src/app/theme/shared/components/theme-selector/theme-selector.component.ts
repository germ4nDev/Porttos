// src/app/components/theme-selector/theme-selector.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../service/theme.service';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ThemeSelectorComponent implements OnInit {
  isDarkTheme: boolean = false;
  navbarColor: string = '#f8f9fa';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });

    // Leer el color del navbar del localStorage al iniciar
    const savedNavbarColor = localStorage.getItem('app-navbar-color');
    if (savedNavbarColor) {
      this.navbarColor = savedNavbarColor;
    }
  }

  // Método para cambiar de tema
  toggleTheme(): void {
    this.themeService.toggleDarkTheme();
  }

  // Método para cambiar el color del navbar
  onNavbarColorChange(): void {
    // this.themeService.setNavbarColor(this.navbarColor);
  }

  // Paleta de colores para el navbar
  get colorPalette(): string[] {
    return ['#f8f9fa', '#e9ecef', '#dee2e6', '#adb5bd', '#6c757d', '#343a40', '#212529', '#007bff', '#6610f2', '#6f42c1', '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8'];
  }
}
