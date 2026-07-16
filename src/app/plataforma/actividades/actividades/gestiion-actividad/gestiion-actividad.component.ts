/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { GradientConfig } from 'src/app/app-config';
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import {
    LocalStorageService,
    PtllogActividadesService,
    SwalAlertService,
    UploadFilesService,
    PtlActividadesService,
    PtlAplicacionesService,
    PtlmodulosApService,
    PtlSuitesAPService
} from 'src/app/theme/shared/service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { Observable, Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import { PTLActividadModel } from 'src/app/theme/shared/_helpers/models/PTLActividades.model';
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model';
import { PTLModuloAP } from 'src/app/theme/shared/_helpers/models/PTLModuloAP.model';
import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model';
// import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model';
// import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model';

@Component({
    selector: 'app-gestiion-actividad',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestiion-actividad.component.html',
    styleUrl: './gestiion-actividad.component.scss'
})
export class GestiionActividadComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>();
    FormRegistro: PTLActividadModel = new PTLActividadModel();
    logActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel();
    menuItems$!: Observable<NavigationItem[]>;
    gradientConfig: any;
    navCollapsed: boolean = false;
    navCollapsedMob: boolean = false;
    windowWidth: number = 0;
    selectedFile: File | null = null;
    previewUrl: string | ArrayBuffer | null = null;
    userPhotoUrl: string = '';
    fileName: string | null = null;
    selectedFileUrl: string | null = null;

    form: undefined;
    isSubmit: boolean = false;
    modoEdicion: boolean = false;
    codeActividad = uuidv4();
    tipoEditorTexto = 'basica';
    lockScreenSubscription: Subscription | undefined;
    isLocked: boolean = false;
    lockMessage: string = '';

    subscriptions = new Subscription();
    aplicaciones: PTLAplicacionModel[] = [];
    suites: PTLSuiteAPModel[] = [];
    modulos: PTLModuloAP[] = [];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _localStorageService: LocalStorageService,
        private _logActividadesService: PtllogActividadesService,
        private _actividadesService: PtlActividadesService,
        private _aplicacionesService: PtlAplicacionesService,
        private _suitesService: PtlSuitesAPService,
        private _modulosService: PtlmodulosApService,
        private _swalService: SwalAlertService,
        private _translate: TranslateService,
        private _uploadService: UploadFilesService
    ) {
        this.isSubmit = false;
        GradientConfig.header_fixed_layout = true;
        this.gradientConfig = GradientConfig;
        this.navCollapsed = this.windowWidth >= 992 ? GradientConfig.isCollapse_menu : false;
        this.navCollapsedMob = false;
        const registroId = this._localStorageService.getObject<string>('regId') || 'nuevo'
        if (registroId !== 'nuevo') {
            this.modoEdicion = true;
            this._actividadesService.getRegistroById(registroId).subscribe({
                next: (resp: any) => {
                    this.FormRegistro = resp.actividad;
                    this.codeActividad = resp.actividad.codigoActividad;
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo obtener la Aplicación', 'error');
                }
            });
        }
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems$ = this._navigationService.menuItems$;
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
        this.consultarAplicaciones();
        this.consultarSuites();
        this.consultarModulos();
        if (this.modoEdicion == false) {
            this.FormRegistro.codigoActividad = uuidv4();
            this.FormRegistro.codigoAplicacion = '';
            this.FormRegistro.codigoSuite = '';
            this.FormRegistro.codigoModulo = '';
            console.log('FormRegistro loading', this.FormRegistro);
        }
        console.log('Inicial formregistro', this.FormRegistro);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    consultarAplicaciones() {
        this.subscriptions.add(
            this._aplicacionesService.cargarAplicaciones().subscribe((resp: any) => {
                if (resp.length >= 0) {
                    this.aplicaciones = resp;
                    console.log('Todos las aplicaciones', this.aplicaciones);
                    return;
                }
            })
        );
    }

    consultarSuites() {
        this.subscriptions.add(
            this._suitesService.cargarRegistros().subscribe((resp: any) => {
                if (resp.length >= 0) {
                    this.suites = resp;
                    console.log('Todos las suites', this.suites);
                    return;
                }
            })
        );
    }

    consultarModulos() {
        this.subscriptions.add(
            this._modulosService.cargarRegistros().subscribe((resp: any) => {
                if (resp.length >= 0) {
                    this.modulos = resp.filter((mod: PTLModuloAP) => mod.codigoPadre !== '0');
                    console.log('************todos los modulos hijos', this.modulos);
                    return;
                }
            })
        );
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcion = nuevoContenido;
        console.log('Descripción de versión actualizada:', this.FormRegistro.descripcion);
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    onAplicacionchangeClick(evento: any) {
        console.log('evento', evento);
    }

    onSuiteChangeClick(evento: any) {
        console.log('evento', evento);
    }

    onModuloChangeClick(evento: any) {
        console.log('evento', evento);
    }

    btnGestionarActividadClick(form: any) {
        // this.isSubmit = true;
        if (this.modoEdicion) {
            this.FormRegistro.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            this.FormRegistro.fechaModificacion = new Date().toISOString();
            this._actividadesService.putModificarRegistro(this.FormRegistro).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('ACTIVIDADES.UPDATESUCCSESSFULLY')
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        this._swalService.getAlertSuccess(this.translate.instant('ACTIVIDADES.UPDATESUCCSESSFULLY'));
                        form.resetForm();
                        // this.isSubmit = false;
                        this.router.navigate(['/actividades/actividades']);
                    }
                },
                error: (err: any) => {
                    console.error(err);
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('ACTIVIDADES.UPDATEERROR')
                    };
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                    this._swalService.getAlertError('No se pudo actualizar la Actividad');
                }
            });
        } else {
            form.actividadId = 0;
            const registroData = form.value as PTLActividadModel;
            registroData.codigoActividad = uuidv4();
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            registroData.fechaCreacion = new Date().toISOString();
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            registroData.fechaModificacion = new Date().toISOString();
            this._actividadesService.postCrearRegistro(registroData).subscribe({
                next: (resp: any) => {
                    console.log('resp', resp);
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('ACTIVIDADES.ELIMINAREXITOSA')
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        this._swalService.getAlertSuccess(this.translate.instant('ACTIVIDADES.CREATESUCCESSFULLY'));
                        form.resetForm();
                        // this.isSubmit = false;
                        this.router.navigate(['/actividades/actividades']);
                    }
                },
                error: (err: any) => {
                    console.error(err);
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '500',
                        descripcionLog: this.translate.instant('ACTIVIDADES.CREATEERROR')
                    };
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                    this._swalService.getAlertError('No se pudo crear la Actividad');
                }
            });
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/actividades/actividades']);
    }

    navMobClick() {
        if (this.windowWidth < 992) {
            if (this.navCollapsedMob && !document.querySelector('app-navigation.pcoded-navbar')?.classList.contains('mob-open')) {
                this.navCollapsedMob = !this.navCollapsedMob;
                setTimeout(() => {
                    this.navCollapsedMob = !this.navCollapsedMob;
                }, 100);
            } else {
                this.navCollapsedMob = !this.navCollapsedMob;
            }
        }
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
