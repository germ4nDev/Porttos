import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, tap, catchError, of } from 'rxjs';
import { GradientConfig } from 'src/app/app-config';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model';
import { PTLPaqueteModel } from 'src/app/theme/shared/_helpers/models/PTLPaquete.model';
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component';
import {
    PtlAplicacionesService,
    PtllogActividadesService,
    SwalAlertService,
    LocalStorageService,
    UploadFilesService,
    NavigationService,
    PTLPaquetesService,
} from 'src/app/theme/shared/service';
import { LayoutInitializerService } from 'src/app/theme/shared/service/layout-initializer.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { PTLItemPaquete } from 'src/app/theme/shared/_helpers/models/PTLItemPaquete.model';
import { PtlItemsPaqueteService } from 'src/app/theme/shared/service/ptlitems-paquete.service';

@Component({
    selector: 'app-gestion-paquete',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-paquete.component.html',
    styleUrl: './gestion-paquete.component.scss'
})
export class GestionPaqueteComponent {
    // private props
    @Output() toggleSidebar = new EventEmitter<void>();
    FormRegistro: PTLPaqueteModel = new PTLPaqueteModel();
    itemPaquete: PTLItemPaquete = new PTLItemPaquete();
    menuItems$!: Observable<NavigationItem[]>;
    gradientConfig: any;
    navCollapsed: boolean = false;
    navCollapsedMob: boolean = false;
    windowWidth: number = 0;
    registroId: string = '';
    form: undefined;
    isGestionItems: boolean = false;
    isSubmit: boolean;
    modoEdicion: boolean = false;
    aplicacionesSub?: Subscription;
    aplicaciones: PTLAplicacionModel[] = [];
    codigosuite = uuidv4();
    codigoItem = uuidv4();
    tipoEditorTexto = 'basica';
    registros: PTLItemPaquete[] = [];
    registrosFiltrado: PTLItemPaquete[] = [];
    modulosPaquete: any[] = [];
    itemsPaquete: any[] = [];
    selectedFile: File | null = null;
    previewUrl: string | ArrayBuffer | null = null;
    userPhotoUrl: string = '';
    fileName: string | null = null;
    selectedFileUrl: string | null = null;
    selectedFileImagenUrl: string | null = null;
    selectedFileIconoUrl: string | null = null;
    lockScreenSubscription: Subscription | undefined;
    isLocked: boolean = false;
    isPromocion: boolean = true;
    lockMessage: string = '';
    suscriptor: string = ''

    // constructor
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _registrosService: PTLPaquetesService,
        private _aplicacionesService: PtlAplicacionesService,
        private _layoutInitializer: LayoutInitializerService,
        private _logActividadesService: PtllogActividadesService,
        private _itemsPaqueteService: PtlItemsPaqueteService,
        private _swalService: SwalAlertService,
        private _translate: TranslateService,
        private _localStorageService: LocalStorageService,
        private _uploadService: UploadFilesService,
        private _navigationService: NavigationService
    ) {
        this.isSubmit = false;
        GradientConfig.header_fixed_layout = true;
        this.gradientConfig = GradientConfig;
        this.navCollapsed = this.windowWidth >= 992 ? GradientConfig.isCollapse_menu : false;
        this.navCollapsedMob = false;
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
        this.registroId = this._localStorageService.getObject<string>('regId') || '';
        console.log('regId', this.registroId);
        if (this.registroId !== 'nuevo') {
            this.modoEdicion = true;
            this._registrosService.getRegistroById(this.registroId).subscribe({
                next: (resp: any) => {
                    this.FormRegistro = resp.paquete;
                    this.selectedFileUrl = this._uploadService.getFilePath('paquetes', 'paquetes', resp.paquete.imagenPaquete);
                    this.registrosFiltrado = this.getItemsPaquete(this.FormRegistro.codigoPaquete || '');
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo obtener el paquete por, ', 'error');
                }
            });
        } else {
            this.registroId = uuidv4();
            this.modoEdicion = false;
            this.FormRegistro.codigoPaquete = this.registroId;
            this.registrosFiltrado = [];
        }
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems$ = this._navigationService.menuItems$;
        this.consultarAplicaciones();
        //
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
            this.FormRegistro.codigoPaquete = uuidv4();
            this.FormRegistro.imagenPaquete = 'no-image.png';
            this.FormRegistro.iconoPaquete = 'no-image.png';
            console.log('FormRegistro loading', this.FormRegistro);
        } else {
            this.getItemsPaquete('codigo');
        }
    }

    getItemsPaquete(codigoPaquete: string) {
        let registros: any[] = [];
        this._itemsPaqueteService.getRegistroByCodigoPaquete(codigoPaquete).subscribe((data: any) => {
            console.log('data', data);
            if (data.itemsPaquete.length > 0) {
                registros = data.itemsPaquete;
            } else {
                registros = [];
            }
        });
        return registros;
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

    onAplicacionChangeClick(event: any) {
        const value = event.target.value;
        const app = this.aplicaciones.filter((x) => x.codigoAplicacion == value)[0];
        // this.FormRegistro.codigoAplicacion = app.codigoAplicacion || '';
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        // this.FormRegistro.descripcionSuite = nuevoContenido;
        // console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionSuite);
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    onFileSelectedClick(event: any, tipo: string) {
        const file: File = event.target.files[0];
        const objUpload = {
            suc: this.suscriptor,
            tipo: 'paquetes',
            id: '0'
        };
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.selectedFileUrl = e.target.result;
            };
            reader.readAsDataURL(file);
            //   this._uploadService.uploadUserPhoto(file, objUpload).subscribe({
            //     next: (path: any) => {
            //       console.log('resultado', path);
            //       this.FormRegistro.imagenInicio = path.nombreArchivo;
            //     },
            //     error: () => {
            //       this._swalService.getAlertError(this._translate.instant('PLATAFORMA.UPLOADPHOTOERROR'));
            //     }
            //   });
        } else {
            this.selectedFileUrl = null;
            this.userPhotoUrl = '';
        }
    }

    btnGestionarRegistroClick(form: any) {
        this.isSubmit = true;
        if (!form.valid) {
            return;
        }
        const registroData = form.value as PTLPaqueteModel;
        console.log('registro', registroData);
        if (this.modoEdicion) {
            registroData.codigoUsuarioCreacion = this.FormRegistro.codigoUsuarioCreacion;
            registroData.fechaCreacion = this.FormRegistro.fechaCreacion;
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            registroData.fechaModificacion = new Date().toISOString();
            registroData.colorPaquete = '';
            this._registrosService.putModificarRegistro(this.FormRegistro).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PLATAFORMA.INSERTAR')
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        this._swalService.getAlertSuccess(this.translate.instant('PLATAFORMA.MODIFICAR'));
                        this.router.navigate(['/aplicaciones/paquetes']);
                    } else {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO') + ', ' + resp.message
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        this._swalService.getAlertError(resp.message || this.translate.instant('PLATAFORMA.NOMODIFICO'));
                    }
                },
                error: (err: any) => {
                    console.error(err);
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO') + ', ' + err.message
                    };
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                    this._swalService.getAlertError(this.translate.instant('PLATAFORMA.NOMODIFICO'));
                }
            });
        } else {
            registroData.codigoPaquete = uuidv4();
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            registroData.fechaCreacion = new Date().toISOString();
            registroData.codigoUsuarioModificacion = '';
            registroData.fechaModificacion = '';
            registroData.colorPaquete = '';
            registroData.imagenPaquete = 'no-image.png';
            registroData.iconoPaquete = 'no-image.png';
            console.log('insertar registro', registroData);
            this._registrosService.postCrearRegistro(registroData).subscribe({
                next: (resp: any) => {
                    console.log('resp paquete', resp);
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PLATAFORMA.INSERTAR') + ' ' + resp.mensaje
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        this._swalService.getAlertSuccess(this.translate.instant('PLATAFORMA.INSERTAR'));
                        form.resetForm();
                        this.isSubmit = false;
                        this.router.navigate(['/aplicaciones/suites']);
                    }
                },
                error: (err: any) => {
                    console.error('Se presento un error, ', err);
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('PLATAFORMA.NOINSERTO') + ', ' + err
                    };
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                    this._swalService.getAlertError(this.translate.instant('PLATAFORMA.NOINSERTO'));
                }
            });
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/aplicaciones/paquetes']);
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }

    columnasPaquetes: ColumnMetadata[] = [
        {
            name: 'nombreItem',
            header: 'PAQUETES.NAME',
            type: 'text'
        },
        {
            name: 'cantidad',
            header: 'PAQUETES.COSTE',
            type: 'price'
        },
        {
            name: 'valorUnitario',
            header: 'PAQUETES.PRECIO',
            type: 'price'
        },
        {
            name: 'valorTotal',
            header: 'PAQUETES.PRECIO',
            type: 'price'
        },
        {
            name: 'nomEstado',
            header: 'PAQUETES.STATUS',
            type: 'text'
        }
    ];

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'codigoValor',
            header: 'PAQUETES.PROMOCION',
            type: 'text'
        },
        {
            name: 'descripcionItem',
            header: 'PAQUETES.PRECIOPROMOCION',
            type: 'price'
        },
        {
            name: 'valoresAdicionales',
            header: 'PAQUETES.IMAGEN',
            type: 'image'
        }
    ];

    OnNuevoRegistroClick() {
        this.isGestionItems = true;
        this.itemPaquete.codigoItem = uuidv4();
    }

    onPromocionClick(evento: any) {
        const option = evento.target.value;
        this.isPromocion = option == 'true' ? false : true;
    }

    OnEditarRegistroClick(evento: any) { }

    OnEliminarRegistroClick(evento: any) { }

    btnGestionarModulosClick() {
        this._localStorageService.setObject('regId', this.registroId);
        this.router.navigate(['aplicaciones/modulos-paquete']);
    }
    btnGestionarItemsClick() {
        this._localStorageService.setObject('regId', this.registroId);
        this.router.navigate(['aplicaciones/items-paquete']);
    }
}
