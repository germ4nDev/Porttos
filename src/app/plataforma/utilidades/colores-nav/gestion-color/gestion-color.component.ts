/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { GradientConfig } from 'src/app/app-config';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { LocalStorageService, PtlColoresSettingsService, SwalAlertService } from 'src/app/theme/shared/service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { LayoutInitializerService } from 'src/app/theme/shared/service/layout-initializer.service';
import { Observable, Subscription } from 'rxjs';
import { PTLColorSettingModel } from 'src/app/theme/shared/_helpers/models/PTLColorSetting.model';
import { ColorSelectorComponent } from 'src/app/theme/shared/components/color-selector/color-selector.component';
import { v4 as uuidv4 } from 'uuid'

@Component({
    selector: 'app-gestion-color',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, ColorSelectorComponent],
    templateUrl: './gestion-color.component.html',
    styleUrl: './gestion-color.component.scss'
})
export class GestionColorComponent implements OnInit {
    // private props
    @Output() toggleSidebar = new EventEmitter<void>();
    FormRegistro: PTLColorSettingModel = new PTLColorSettingModel();
    menuItems!: Observable<NavigationItem[]>;
    gradientConfig: any;
    navCollapsed: boolean = false;
    navCollapsedMob: boolean = false;
    windowWidth: number = 0;
    form: undefined;
    isSubmit: boolean;
    colorNavId: string = '';
    modoEdicion: boolean = false;
    slidersInicioSub?: Subscription;
    slidersInicio: PTLColorSettingModel[] = [];
    tipoEditorTexto = 'basica';

    navbarColor: string = 'navbar';
    textoColor: string = 'texto';
    iconosColor: string = 'icons';
    buttonsHoverColor: string = 'hover';
    estadoColor: boolean = false;

    nColor: string = '';
    tColor: string = '';
    iColor: string = '';
    bHColor: string = '';
    lockScreenSubscription: Subscription | undefined;
    isLocked: boolean = false;
    lockMessage: string = '';

    // constructor
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _registrosService: PtlColoresSettingsService,
        private _layoutInitializer: LayoutInitializerService,
        private _swalAlertService: SwalAlertService,
        private _localStorageService: LocalStorageService,
        private _navigationService: NavigationService
    ) {
        this.isSubmit = false;
        GradientConfig.header_fixed_layout = true;
        this.gradientConfig = GradientConfig;
        this.navCollapsed = this.windowWidth >= 992 ? GradientConfig.isCollapse_menu : false;
        this.navCollapsedMob = false;
        this.colorNavId = this._localStorageService.getObject<string>('regId') || 'nuevo';
        if (this.colorNavId) {
            this.modoEdicion = true;
            this._registrosService.getRegistroById(this.colorNavId).subscribe({
                next: (resp: any) => {
                    this.FormRegistro = resp.colorNav;
                    this.nColor = this.FormRegistro.navbarColor || '#1e3a8a';
                    this.tColor = this.FormRegistro.textoColor || '#1e3a8a';
                    this.iColor = this.FormRegistro.iconosColor || '#1e3a8a';
                    this.bHColor = this.FormRegistro.buttonsHoverColor || '#1e3a8a';
                    console.log('formRegistro', this.FormRegistro);
                    this.colorNavId = this.FormRegistro.codigoColor || '';
                },
                error: (err) => {
                    this._swalAlertService.getAlertError('No se pudo obtener el colorSetting por ' + err);
                }
            });
        } else {
            this.modoEdicion = false;
        }
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems = this._navigationService.menuItems$;
        this._layoutInitializer.applyLayout();
        this.lockScreenSubscription = this._navigationService.lockScreenEvent$.subscribe({
            next: (message: string) => {
                this._localStorageService.setFormRegistro(this.FormRegistro);
                this.isLocked = true;
                this.lockMessage = message;
            },
            error: (err) => console.error('Error al suscribirse al evento de bloqueo:', err)
        });
        const form = this._localStorageService.getFormRegistro();
        if (form != undefined) {
            this.FormRegistro = form;
            this._localStorageService.removeFormRegistro();
        }
        if (this.modoEdicion == false) {
            this.FormRegistro.codigoColor = uuidv4()
            console.log('FormRegistro loading', this.FormRegistro)
        }
    }

    OnColorSelectedClick(evento: any) {
        console.log('evento', evento);
        switch (evento.id) {
            case 'navbar':
                this.FormRegistro.navbarColor = evento.color;
                break;
            case 'texto':
                this.FormRegistro.textoColor = evento.color;
                break;
            case 'icons':
                this.FormRegistro.iconosColor = evento.color;
                break;
            case 'hover':
                this.FormRegistro.buttonsHoverColor = evento.color;
                break;
        }
        console.log('formRegistro', this.FormRegistro);
    }

    btnGestionarRegistroClick(form: any) {
        this.isSubmit = true;
        if (!form.valid) {
            return;
        }
        if (this.modoEdicion) {
            if (this.colorNavId != '') {
                this._registrosService.putModificarRegistro(this.FormRegistro, this.colorNavId).subscribe({
                    next: (resp: any) => {
                        if (resp.ok) {
                            this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.MODIFICAR'));
                            this.router.navigate(['/utilidades/colores-nav']);
                        } else {
                            this._swalAlertService.getAlertError(resp.message || this.translate.instant('PLATAFORMA.NOMODIFICO'));
                        }
                    },
                    error: (err: any) => {
                        console.error(err);
                        this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOMODIFICO'));
                    }
                });
            } else {
                this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.REGISTRONOENCONTRADO'));
            }
        } else {
            console.log('formRegistro a insertar', this.FormRegistro);
            this.FormRegistro.codigoColor = uuidv4();
            this._registrosService.postCrearRegistro(this.FormRegistro).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.INSERTAR'));
                        form.resetForm();
                        this.isSubmit = false;
                        this.router.navigate(['/utilidades/colores-nav']);
                    }
                },
                error: (err: any) => {
                    console.error(err);
                    this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOINSERTO'));
                }
            });
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/utilidades/colores-nav']);
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
