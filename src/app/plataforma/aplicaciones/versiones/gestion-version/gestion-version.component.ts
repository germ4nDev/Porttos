/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { PtlAplicacionesService } from 'src/app/theme/shared/service/ptlaplicaciones.service';
import { catchError, Observable, of, Subscription, tap } from 'rxjs';
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GradientConfig } from 'src/app/app-config';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { LayoutInitializerService } from 'src/app/theme/shared/service/layout-initializer.service';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { PtlversionesApService } from 'src/app/theme/shared/service/ptlversiones-ap.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component';
import { NgForm } from '@angular/forms';
import { LocalStorageService } from 'src/app/theme/shared/service';
import { PTLVersionAP } from 'src/app/theme/shared/_helpers/models/PTLVersionAP.model';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';

@Component({
    selector: 'app-gestion-version',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-version.component.html',
    styleUrl: './gestion-version.component.scss'
})
export class GestionVersionComponent implements OnInit {
    @ViewChild('validationForm') validationForm!: NgForm;
    @Output() toggleSidebar = new EventEmitter<void>();
    FormRegistro: PTLVersionAP = new PTLVersionAP();

    tipoEditorTexto = 'basica';
    menuItems$!: Observable<NavigationItem[]>;
    gradientConfig: any;
    navCollapsed: boolean = false;
    navCollapsedMob: boolean = false;
    windowWidth: number = 0;
    registroId: string = '';
    isSubmit: boolean = false;
    modoEdicion: boolean = false;
    aplicacionesSub?: Subscription;
    aplicaciones: PTLAplicacionModel[] = [];
    codigosuite = uuidv4();
    lockScreenSubscription: Subscription | undefined;
    isLocked: boolean = false;
    lockMessage: string = '';

    // constructor
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _registrosService: PtlversionesApService,
        private _aplicacionesService: PtlAplicacionesService,
        private _layoutInitializer: LayoutInitializerService,
        private _localStorageService: LocalStorageService,
        private _navigationService: NavigationService
    ) {
        this.isSubmit = false;
        GradientConfig.header_fixed_layout = true;
        this.gradientConfig = GradientConfig;
        this.navCollapsed = this.windowWidth >= 992 ? GradientConfig.isCollapse_menu : false;
        this.navCollapsedMob = false;
        this.registroId = this._localStorageService.getObject<string>('regId') || 'nuevo'
        if (this.registroId != 'nuevo') {
            this.modoEdicion = true;
            this._registrosService.getRegistroById(this.registroId).subscribe({
                next: (resp: any) => {
                    const version = resp.version;
                    console.log('version', resp.version);
                    this.FormRegistro = version;
                    this.FormRegistro.fecha = this.setFechaRiesgo(new Date(version.fechaVersion));
                    this.FormRegistro.descripcionVersion = version.descripcionVersion || '';
                    console.log('formRegisto', this.FormRegistro);
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo obtener la suite por, ', 'error');
                }
            });
        } else {
            this.modoEdicion = false;
            console.log('FormRegistro loading', this.FormRegistro);
        }
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems$ = this._navigationService.menuItems$;
        this.consultarAplicaciones();
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
        if (!this.modoEdicion) {
            this.FormRegistro.codigoAplicacion = '';
            this.FormRegistro.fecha = this.setFechaRiesgo(new Date());
            this.FormRegistro.codigoVersion = uuidv4();
            this.FormRegistro.version = '0.0.0.0';
            this.FormRegistro.estadoVersion = true;
        }
    }

    setFechaRiesgo(fecha: Date) {
        const year = fecha.getUTCFullYear();
        const month = fecha.getUTCMonth() + 1;
        const day = fecha.getUTCDate();
        const dateStruct: NgbDateStruct = {
            year: year,
            month: month,
            day: day
        };
        return dateStruct;
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcionVersion = nuevoContenido;
        console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionVersion);
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    consultarAplicaciones() {
        this.aplicacionesSub = this._aplicacionesService
            .getAplicaciones()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.aplicaciones = resp.aplicaciones;
                        console.log('Todos las aplicaciones', this.aplicaciones);
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

    onAplicacionchangeClick(event: any) {
        const value = event.target.value;
        const app = this.aplicaciones.find((x) => x.codigoAplicacion == value);
        if (app) {
            this.FormRegistro.codigoAplicacion = app.codigoAplicacion || '';
        }
    }

    onDateChange(): void {
        console.log('Fecha NgbDateStruct seleccionada:', this.FormRegistro.fecha);
    }

    btnGestionarRegistroClick(form: NgForm) {
        // Tipado a NgForm
        this.isSubmit = true;
        const descripcionValida = this.FormRegistro.descripcionVersion && this.FormRegistro.descripcionVersion.trim() !== '';
        if (!descripcionValida) {
            Swal.fire('Atención', this.translate.instant('VERSIONES.GESTION.REQUERIDODESCRIPCION'), 'warning');
            return;
        }
        if (!form.valid) {
            return;
        }
        console.log('======= modo edicion', this.modoEdicion);

        const registroData = form.value as PTLVersionAP;
        if (this.FormRegistro.fecha) {
            const { year, month, day } = this.FormRegistro.fecha;
            const fecha = new Date(year, month - 1, day).toISOString();
            registroData.fechaVersion = fecha;
        }
        if (this.modoEdicion) {
            if (!this.FormRegistro.fecha || !this.FormRegistro.fecha.year || !this.FormRegistro.fecha.month || !this.FormRegistro.fecha.day) {
                return null;
            }
            const jsDate = new Date(this.FormRegistro.fecha.year, this.FormRegistro.fecha.month - 1, this.FormRegistro.fecha?.day);
            registroData.codigoVersion = form.value.codigoVersion;
            registroData.fechaVersion = jsDate.toISOString();
            registroData.codigoUsuarioCreacion = this.FormRegistro.codigoUsuarioCreacion || '';
            registroData.fechaCreacion = this.FormRegistro.fechaCreacion || '';
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            registroData.fechaModificacion = new Date().toISOString();
            console.log('registroData', registroData);
            this._registrosService.putModificarRegistro(registroData).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        Swal.fire('', this.translate.instant('PLATAFORMA.MODIFICAR'), 'success');
                        this.router.navigate(['/aplicaciones/versiones']);
                    } else {
                        Swal.fire('Error', resp.message || this.translate.instant('PLATAFORMA.NOMODIFICO'), 'error');
                    }
                },
                error: (err: any) => {
                    console.error(err);
                    Swal.fire('Error', this.translate.instant('PLATAFORMA.NOMODIFICO'), 'error');
                }
            });
        } else {
            registroData.codigoVersion = uuidv4();
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            registroData.fechaCreacion = new Date().toISOString();
            registroData.codigoUsuarioModificacion = '';
            registroData.fechaModificacion = '';
            console.log('insertar registro', registroData);
            this._registrosService.postCrearRegistro(registroData).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        Swal.fire('', this.translate.instant('PLATAFORMA.INSERTAR'), 'success');
                        form.resetForm();
                        this.isSubmit = false;
                        this.router.navigate(['/aplicaciones/versiones']);
                    }
                },
                error: (err: any) => {
                    console.error(err);
                    Swal.fire('Error', this.translate.instant('PLATAFORMA.NOINSERTO'), 'error');
                }
            });
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/aplicaciones/versiones']);
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
