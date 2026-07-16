import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { catchError, Observable, of, Subject, Subscription, tap } from 'rxjs';
import { ThemeService } from 'src/app/theme/shared/service/theme.service';
import { AuthenticationService, LocalStorageService, UploadFilesService, PtlColoresSettingsService, NavigationService, LanguageService } from '../../service';
import { PTLColorSettingModel } from '../../_helpers/models/PTLColorSetting.model';

@Component({
    selector: 'app-profile-drp',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NgbDropdownModule,
        TranslateModule,
        FormsModule
    ],
    templateUrl: './profile-drp.component.html',
    styleUrl: './profile-drp.component.scss'
})
export class ProfileDrpComponent implements OnInit {
    colorsettings: PTLColorSettingModel[] = [];
    iconoTema: string = '';
    avatarUsuario: string = '';
    nombreUsuario: string = '';
    navbarColor: string = '';
    suscriptor: string = '';
    currentLanguage: string = 'es';
    themeTextKey: string = 'PLATAFORMA.NAVBAR.CHANGE_TO_DARK';
    colorPalette: any[] = [];
    lockScreenSubject = new Subject<string>();
    lockScreenEvent$: Observable<string> = this.lockScreenSubject.asObservable();
    isDarkTheme: boolean = false;
    themeSettings: any;
    registrosSub?: Subscription;
    mostrarPanelColores = false;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private themeService: ThemeService,
        private _localStorageService: LocalStorageService,
        private _uploadService: UploadFilesService,
        private _colorsettingsService: PtlColoresSettingsService,
        private _navigationService: NavigationService,
        private languageService: LanguageService
    ) {
        // console.log('isDarkTheme', this.isDarkTheme);
        this.isDarkTheme = this.themeService.isDarkThemeEnabled();
        this.iconoTema = this.isDarkTheme ? 'icon feather icon-sun' : 'icon feather icon-moon';
        this.themeTextKey = this.isDarkTheme ? 'PLATAFORMA.NAVBAR.THEME_LIGHT' : 'PLATAFORMA.NAVBAR.THEME_DARK';
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
    }

    ngOnInit(): void {
        this.consultarColorsettings();
        const userLogg = this._localStorageService.getUsuarioLocalStorage();
        this.avatarUsuario = this._uploadService.getFilePath(this.suscriptor, 'usuarios', userLogg.fotoUsuario);
        this.nombreUsuario = userLogg.nombreUsuario || '';
        this.themeService.isDarkTheme$.subscribe((isDark) => {
            this.isDarkTheme = isDark;
        });
        this.themeService.navbarColor$.subscribe((color) => {
            this.navbarColor = color;
        });
        this.languageService.currentLang$.subscribe((lang) => {
            this.currentLanguage = lang;
        });
    }

    consultarColorsettings() {
        this.registrosSub = this._colorsettingsService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        resp.coloresNav.forEach((color: PTLColorSettingModel) => {
                            if (color.estadoColor == true) {
                                const colorSetting = {
                                    color: color.navbarColor,
                                    iconos: color.iconosColor,
                                    texto: color.textoColor,
                                    hover: color.buttonsHoverColor
                                };
                                this.colorPalette.push(colorSetting);
                            }
                        });
                        this.colorsettings = resp.coloresNav;
                        // console.log('Todos las colorSettings', this.colorPalette);
                        return;
                    }
                }),
                catchError((err) => {
                    console.log('Ha ocurrido un error', err);
                    return of(null);
                })
            )
            .subscribe();
    }

    toggleTheme(): void {
        this.themeService.toggleDarkTheme();
        this.isDarkTheme = !this.isDarkTheme;
        const settings = this._localStorageService.getThemeSettings();
        this.iconoTema = settings.isDarkTheme ? 'icon feather icon-sun' : 'icon feather icon-moon';
        this.themeTextKey = settings.isDarkTheme ? 'PLATAFORMA.NAVBAR.THEME_LIGHT' : 'PLATAFORMA.NAVBAR.THEME_DARK';
    }

    // Método para ABRIR/CERRAR el panel
    togglePanelColores(event: MouseEvent) {
        event.preventDefault();   // Evita que el enlace recargue la página
        event.stopPropagation();  // ¡EL ESCUDO! Evita que el menú principal se entere y se cierre
        this.mostrarPanelColores = !this.mostrarPanelColores;
    }

    // Método para SELECCIONAR el color sin que se cierre la paleta
    seleccionarColor(event: MouseEvent, color: string, index: number) {
        event.preventDefault();
        event.stopPropagation(); // El escudo para las bolitas de color

        this.navbarColor = color;
        this.onNavbarColorChange(index); // Llama a tu función original
    }

    onNavbarColorChange(i: number): void {
        const color = this.colorPalette[i];
        this.themeService.setNavbarColor(color.color);
        this.themeService.setIconosColor(color.iconos);
        // this.themeService.setTextoColor(color.texto);
    }

    perfilUsuario() {
        const user = this._localStorageService.getUsuarioLocalStorage();
        // console.log('ver perfil del usuario', user.usuarioId);
        this.router.navigate(['starter/perfil'], { queryParams: { regId: user.usuarioId } });
    }

    lockscreen() {
        const currentUrl = this.router.url;
        // console.log('ruta actual de navegacion', currentUrl);
        this._navigationService.emitLockScreen('saveForm');
        sessionStorage.setItem('locked_url', currentUrl);
        this.router.navigate(['/starter/lock-screen']);
    }

    logout() {
        this.authenticationService.logout();
    }
}
