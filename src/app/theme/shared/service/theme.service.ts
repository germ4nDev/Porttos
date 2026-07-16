/*
    Author: German Valencia
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, OnDestroy, Renderer2, RendererFactory2, RendererStyleFlags2 } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LocalStorageService } from './local-storage.service'; // Asegúrate de que esta ruta sea correcta

export interface ThemeSettings {
    isDarkTheme: boolean;
    navbarColor: string;
    iconosColor: string;
    buttonsHoverColor: string;
    // textoColor eliminado para ceder el control al SCSS global
}

@Injectable({
    providedIn: 'root'
})
export class ThemeService implements OnDestroy {
    private renderer: Renderer2;

    // 1. EL OBJETO INICIAL (La fuente de la verdad por defecto)
    private readonly DEFAULT_THEME_SETTINGS: ThemeSettings = {
        isDarkTheme: false,
        navbarColor: '#007bff',       // Azul QPLUS
        iconosColor: '#464e57',       // Gris estándar
        buttonsHoverColor: '#b4b4b4'  // Gris claro
    };

    private isDarkTheme = new BehaviorSubject<boolean>(this.DEFAULT_THEME_SETTINGS.isDarkTheme);
    private navbarColor = new BehaviorSubject<string>(this.DEFAULT_THEME_SETTINGS.navbarColor);
    private iconosColor = new BehaviorSubject<string>(this.DEFAULT_THEME_SETTINGS.iconosColor);
    private buttonsHoverColor = new BehaviorSubject<string>(this.DEFAULT_THEME_SETTINGS.buttonsHoverColor);

    isDarkTheme$ = this.isDarkTheme.asObservable();
    navbarColor$ = this.navbarColor.asObservable();
    iconosColor$ = this.iconosColor.asObservable();
    buttonsHoverColor$ = this.buttonsHoverColor.asObservable();
    private subscriptions: Subscription = new Subscription();

    constructor(
        rendererFactory: RendererFactory2,
        private _localStorageService: LocalStorageService
    ) {
        console.log('ThemeService: Inicializando con arquitectura de Tokens de Diseño.');
        this.renderer = rendererFactory.createRenderer(null, null);

        // Bandera para variables dinámicas de marca (Sin !important)
        const flags = RendererStyleFlags2.DashCase;

        this.subscriptions.add(
            this.navbarColor$.subscribe((color) => {
                if (color) {
                    this.renderer.setStyle(document.body, '--app-navbar-color', color, flags);
                    this.renderer.setStyle(document.body, '--primary-color', color, flags);
                    this.renderer.setStyle(document.body, '--aside-tab-active', color, flags);
                }
            })
        );

        this.subscriptions.add(
            this.iconosColor$.subscribe((color) => {
                if (color) {
                    this.renderer.setStyle(document.body, '--app-iconos-color', color, flags);
                }
            })
        );

        this.subscriptions.add(
            this.buttonsHoverColor$.subscribe((color) => {
                if (color) {
                    this.renderer.setStyle(document.body, '--app-btn-secondary', color, flags);
                }
            })
        );

        // Control maestro de Tema Estructural
        this.subscriptions.add(
            this.isDarkTheme$.subscribe((isDark) => {
                if (isDark) {
                    this.renderer.addClass(document.body, 'dark-theme');
                } else {
                    this.renderer.removeClass(document.body, 'dark-theme');
                }
            })
        );

        this.loadThemeSettings();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    loadThemeSettings(): void {
        // Obtenemos lo que haya en caché (puede ser null o un objeto incompleto)
        const savedSettings = this._localStorageService.getThemeSettings();

        // Detectamos la preferencia del sistema operativo del usuario
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        // 2. LA FUSIÓN MÁGICA (Merge)
        const finalSettings: ThemeSettings = {
            ...this.DEFAULT_THEME_SETTINGS,
            isDarkTheme: savedSettings ? savedSettings.isDarkTheme : prefersDark,
            ...(savedSettings || {})
        };

        // 3. Emitimos los valores a toda la plataforma
        this.isDarkTheme.next(finalSettings.isDarkTheme);
        this.navbarColor.next(finalSettings.navbarColor);
        this.iconosColor.next(finalSettings.iconosColor);
        this.buttonsHoverColor.next(finalSettings.buttonsHoverColor);

        // 4. Si era la primera vez (no había savedSettings), guardamos el objeto inicial en el caché
        if (!savedSettings) {
            console.log('ThemeService: Inicializando localStorage con objeto ThemeSettings base.');
            this.saveThemeSettings();
        }
    }

    saveThemeSettings(): void {
        const settings: ThemeSettings = {
            isDarkTheme: this.isDarkTheme.value,
            navbarColor: this.navbarColor.value,
            iconosColor: this.iconosColor.value,
            buttonsHoverColor: this.buttonsHoverColor.value
        };
        this._localStorageService.setThemeSettingsLocalStorage(settings);
    }

    setNavbarColor(color: string): void {
        this.navbarColor.next(color);
        this.saveThemeSettings();
    }

    setIconosColor(color: string): void {
        this.iconosColor.next(color);
        this.saveThemeSettings();
    }

    setBotonHoverColor(color: string): void {
        this.buttonsHoverColor.next(color);
        this.saveThemeSettings();
    }

    isDarkThemeEnabled(): boolean {
        return this.isDarkTheme.value;
    }

    toggleDarkTheme(): void {
        this.isDarkTheme.next(!this.isDarkTheme.value);
        this.saveThemeSettings();
    }

    setDarkTheme(isDark: boolean): void {
        this.isDarkTheme.next(isDark);
        this.saveThemeSettings();
    }

    hexToRgb(hex: string): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        return `${r}, ${g}, ${b}`;
    }
}
