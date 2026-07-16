import { Injectable } from '@angular/core';
import { GradientConfig } from 'src/app/app-config';
import { CustomsThemeService } from 'src/app/theme/shared/service/customs-theme.service';

@Injectable({ providedIn: 'root' })
export class LayoutInitializerService {
  constructor(private themeService: CustomsThemeService) {}

  applyLayout() {
    const layout = GradientConfig.layoutType;
    this.themeService.customsTheme.next(layout);
    this.setLayoutClass(layout);
  }

  private setLayoutClass(layout: string) {
    const navbar = document.querySelector('.pcoded-navbar');
    const body = document.body;
    const html = document.documentElement;

    navbar?.classList.remove('menu-light', 'menu-dark', 'navbar-dark', 'brand-dark');
    body.classList.remove('gradient-dark');
    html.classList.remove('dark');

    if (layout === 'dark') {
      navbar?.classList.add('navbar-dark', 'brand-dark');
      body.classList.add('gradient-dark');
      html.classList.add('dark');
    } else if (layout === 'menu-light') {
      navbar?.classList.add('menu-light');
    }
  }
}
