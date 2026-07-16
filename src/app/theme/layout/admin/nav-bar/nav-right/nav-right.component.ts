/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, DoCheck, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { GradientConfig } from 'src/app/app-config';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from 'src/app/theme/shared/components/language-selector/language-selector.component';
import {
    AuthenticationService,
    LanguageService,
    NavigationService,
    PtlColoresSettingsService,
    UploadFilesService
} from 'src/app/theme/shared/service';
import { ChatUserListComponent } from './chat-user-list/chat-user-list.component';
import { ChatMsgComponent } from './chat-msg/chat-msg.component';
import { ThemeService } from 'src/app/theme/shared/service/theme.service';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from 'src/app/theme/shared/service/local-storage.service';
import { PTLUsuarioModel } from 'src/app/theme/shared/_helpers/models/PTLUsuario.model';
import { catchError, Observable, of, Subject, Subscription, tap } from 'rxjs';
import { PTLColorSettingModel } from 'src/app/theme/shared/_helpers/models/PTLColorSetting.model';
import { ProfileDrpComponent } from "src/app/theme/shared/components/profile-drp/profile-drp.component";

@Component({
    selector: 'app-nav-right',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NgbDropdownModule,
        TranslateModule,
        FormsModule,
        LanguageSelectorComponent,
        ChatUserListComponent,
        ChatMsgComponent,
        ProfileDrpComponent
    ],
    templateUrl: './nav-right.component.html',
    styleUrls: ['./nav-right.component.scss'],
    animations: [
        trigger('slideInOutLeft', [
            transition(':enter', [style({ transform: 'translateX(100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
            transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(100%)' }))])
        ]),
        trigger('slideInOutRight', [
            transition(':enter', [style({ transform: 'translateX(-100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
            transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))])
        ])
    ]
})
export class NavRightComponent implements DoCheck, OnInit {
    usuario: PTLUsuarioModel = new PTLUsuarioModel();
    colorsettings: PTLColorSettingModel[] = [];
    visibleUserList: boolean = false;
    chatMessage: boolean = false;
    friendId!: number;
    gradientConfig = GradientConfig;
    isDarkTheme: boolean = false;
    themeSettings: any;
    iconoTema: string = '';
    avatarUsuario: string = '';
    nombreUsuario: string = '';
    navbarColor: string = '';
    suscriptor: string = '';
    currentLanguage: string = 'es';
    registrosSub?: Subscription;
    themeTextKey: string = 'PLATAFORMA.NAVBAR.CHANGE_TO_DARK';
    colorPalette: any[] = [];
    lockScreenSubject = new Subject<string>();
    lockScreenEvent$: Observable<string> = this.lockScreenSubject.asObservable();
    suscriptorPlataforma: string = '';

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

    onNavbarColorChange(i: number): void {
        const color = this.colorPalette[i];
        this.themeService.setNavbarColor(color.color);
        this.themeService.setIconosColor(color.iconos);
        // this.themeService.setTextoColor(color.texto);
    }

    changeLanguage(event: Event): void {
        const lang = (event.target as HTMLSelectElement).value;
        this.languageService.setLanguage(lang);
    }

    onChatToggle(friendID: any) {
        this.friendId = friendID;
        this.chatMessage = !this.chatMessage;
    }

    perfilUsuario() {
        const user = this._localStorageService.getUsuarioLocalStorage();
        // console.log('ver perfil del usuario', user.usuarioId);
        this.router.navigate(['starter/perfil'], { queryParams: { regId: user.usuarioId } });
    }

    ngDoCheck() {
        const isRtl = document.querySelector('body')?.classList.contains('elite-rtl') || false;
        this.gradientConfig.isRtlLayout = isRtl;
    }

    lockscreen() {
        const currentUrl = this.router.url;
        // console.log('ruta actual de navegacion', currentUrl);
        this._navigationService.emitLockScreen('saveForm');
        sessionStorage.setItem('locked_url', currentUrl);
        this.router.navigate(['/starter/lock-screen']);
    }

    empresasScreen() {
        this.router.navigate(['/starter/inicio-empresas']);
    }

    aplicacionesScreen() {
        this.router.navigate(['/starter/inicio-aplicaciones']);
    }

    suitesScreen() {
        this.router.navigate(['/starter/inicio-suites']);
    }

    helpsClick() {
        this.router.navigate(['/starter/help-modulos']);
    }

    logout() {
        this.authenticationService.logout();
    }
}
