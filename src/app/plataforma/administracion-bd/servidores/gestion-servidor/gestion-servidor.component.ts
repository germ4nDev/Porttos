/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { GradientConfig } from 'src/app/app-config';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { PTLServidorModel } from 'src/app/theme/shared/_helpers/models/PTLServidor.model';
import { LayoutInitializerService } from 'src/app/theme/shared/service/layout-initializer.service';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { PTLServidorService } from 'src/app/theme/shared/service/ptlservidor.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';
import { LocalStorageService, PtllogActividadesService } from 'src/app/theme/shared/service';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';

@Component({
    selector: 'app-gestion-servidor',
    standalone: true,
    imports: [CommonModule, SharedModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-servidor.component.html',
    styleUrl: './gestion-servidor.component.scss'
})
export class GestionServidorComponent {
    @Output() toggleSidebar = new EventEmitter<void>();
    FormRegistro: PTLServidorModel = new PTLServidorModel();
    menuItems$!: Observable<NavigationItem[]>;
    gradientConfig: any;
    navCollapsed: boolean = false;
    navCollapsedMob: boolean = false;
    windowWidth: number = 0;
    registrosSub?: Subscription;
    form: undefined;
    isSubmit: boolean = false;
    modoEdicion: boolean = false;
    codeRegistro = uuidv4();
    tipoEditorTexto = 'basica';
    lockScreenSubscription: Subscription | undefined;
    isLocked: boolean = false;
    lockMessage: string = '';

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _registrosService: PTLServidorService,
        private _layoutInitializer: LayoutInitializerService,
        private _logActividadesService: PtllogActividadesService,
        private _localStorageService: LocalStorageService,
        private _navigationService: NavigationService
    ) {
        this.isSubmit = false;
        GradientConfig.header_fixed_layout = true;
        this.gradientConfig = GradientConfig;
        this.navCollapsed = this.windowWidth >= 992 ? GradientConfig.isCollapse_menu : false;
        this.navCollapsedMob = false;
        const registroId = this._localStorageService.getObject<string>('regId') || 'nuevo'
        if (registroId != 'nuevo') {
            this.modoEdicion = true;
            this._registrosService.getRegistroById(registroId).subscribe({
                next: (resp: any) => {
                    console.log('resp', resp);
                    this.FormRegistro = resp.servidor;
                    console.log('datos del FormRegistro', this.FormRegistro);
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo obtener el servidor', 'error');
                }
            });
        } else {
            this.modoEdicion = false;
        }
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems$ = this._navigationService.menuItems$;
        this._layoutInitializer.applyLayout();
        this.lockScreenSubscription = this._navigationService.lockScreenEvent$.subscribe({
            next: (message: string) => {
                this._localStorageService.setFormRegistro(this.FormRegistro);
                this.isLocked = true;
                this.lockMessage = message;
            },
            error: (err) => console.error('Error al suscribirse al evento de bloqueo:', err)
        });
        if (this.modoEdicion == false) {
            this.FormRegistro.codigoServidor = uuidv4();
            console.log('FormRegistro loading', this.FormRegistro);
        }
        const form = this._localStorageService.getFormRegistro();
        if (form != undefined) {
            this.FormRegistro = form;
            this._localStorageService.removeFormRegistro();
        }
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcionServidor = nuevoContenido;
        console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionServidor);
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    btnGestionarRegistroClick(form: any) {
        this.isSubmit = true;
        if (!form.valid) {
            return;
        }
        if (this.modoEdicion) {
            // console.log('1.0 modificar usuario', this.FormRegistro);
            this._registrosService.putModificarRegistro(this.FormRegistro).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PLATAFORMA.MODIFICAR')
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        Swal.fire('', this.translate.instant('PLATAFORMA.MODIFICAR'), 'success');
                        this.router.navigate(['/administracion-bd/servidores/']);
                    } else {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO')
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        Swal.fire('Error', resp.message || this.translate.instant('PLATAFORMA.NOMODIFICO'), 'error');
                    }
                },
                error: (err: any) => {
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO') + ', ' + err.message
                    };
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                    console.error(err);
                    Swal.fire('Error', this.translate.instant('PLATAFORMA.NOMODIFICO'), 'error');
                }
            });
        } else {
            const registroData = form.value as PTLServidorModel;
            registroData.codigoServidor = uuidv4();
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            registroData.fechaCreacion = new Date().toISOString();
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            registroData.fechaModificacion = new Date().toISOString();
            this._registrosService.postCrearRegistro(registroData).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PLATAFORMA.INSERTAR')
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        Swal.fire('', this.translate.instant('PLATAFORMA.INSERTAR'), 'success');
                        form.resetForm();
                        this.isSubmit = false;
                        this.router.navigate(['/administracion-bd/servidores/']);
                    }
                },
                error: (err: any) => {
                    console.error(err);
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('PLATAFORMA.NOINSERTO') + ', ' + err.message
                    };
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                    Swal.fire('Error', this.translate.instant('PLATAFORMA.NOINSERTO'), 'error');
                }
            });
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/administracion-bd/servidores/']);
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
