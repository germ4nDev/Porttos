import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GradientConfig } from 'src/app/app-config';
import { NavRightComponent } from './nav-right/nav-right.component';
import { ThemeService } from 'src/app/theme/shared/service/theme.service';
import { LocalStorageService } from 'src/app/theme/shared/service';
import { NavSettings } from 'src/app/theme/shared/_helpers/models/navSettings.model';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [CommonModule, RouterModule, NavRightComponent],
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
    gradientConfig = GradientConfig;
    navbarColor: string = '#346BA6';
    menuClass = false;
    collapseStyle = 'none';
    windowWidth = window.innerWidth;
    logoEmpresa: string = 'assets/images/logo.png';
    @Output() NavCollapse = new EventEmitter<void>();
    @Output() NavCollapsedMob = new EventEmitter<void>();

    constructor(
        private themeService: ThemeService,
        private _localStorage: LocalStorageService,
        private _themeService: ThemeService
    ) {
        console.log('abriendo navbar');
    }

    ngOnInit(): void {
        const navSettings: any = this._localStorage.getObject('navsettings')
        console.log('navsettings en el navbar', navSettings);
        // const dark = 'assets/tablero-control/logoUIPorttosDK.png'
        // const soft = 'assets/tablero-control/logoUIPorttosWT.png'
        const dark = 'assets/images/tablero-control/logoUIPorttosDK.png'
        const soft = 'assets/images/tablero-control/logoUIPorttosWT.png'
        const isDark = this._localStorage.getThemeSettings();
        this.logoEmpresa = isDark.isDarkTheme ? dark : soft;

        this.themeService.navbarColor$.subscribe(color => {
            this.navbarColor = color;
        });
    }

    toggleMobOption(): void {
        this.menuClass = !this.menuClass;
        this.collapseStyle = this.menuClass ? 'block' : 'none';
    }

    navCollapse(): void {
        if (this.windowWidth >= 992) {
            this.NavCollapse.emit();
        }
    }

    toggleSidebar() {
        this.gradientConfig.collapseMenu = !this.gradientConfig.collapseMenu;
    }
}
