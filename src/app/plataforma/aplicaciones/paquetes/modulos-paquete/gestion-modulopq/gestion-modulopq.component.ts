import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Observable, Subscription, tap, catchError, of } from 'rxjs'
import { GradientConfig } from 'src/app/app-config'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { PTLModuloAP } from 'src/app/theme/shared/_helpers/models/PTLModuloAP.model'
import { PTLModuloPQModel, PTLModuloPQModelAdm } from 'src/app/theme/shared/_helpers/models/PTLModuloPQ.model'
import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model'
import {
    PtlAplicacionesService,
    PtlSuitesAPService,
    PtlmodulosApService,
    PtllogActividadesService,
    SwalAlertService,
    LocalStorageService,
    NavigationService
} from 'src/app/theme/shared/service'
import { LayoutInitializerService } from 'src/app/theme/shared/service/layout-initializer.service'
import { LoadingService } from 'src/app/theme/shared/service/loading.service'
import { PTLModulosPaqueteService } from 'src/app/theme/shared/service/ptlmodulos-paquete.service'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { v4 as uuidv4 } from 'uuid'

@Component({
    selector: 'app-gestion-modulopq',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent],
    templateUrl: './gestion-modulopq.component.html',
    styleUrl: './gestion-modulopq.component.scss'
})
export class GestionModulopqComponent {
    // #region VARIABLES
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: PTLModuloPQModel = new PTLModuloPQModel()
    menuItems$!: Observable<NavigationItem[]>
    gradientConfig: any
    navCollapsed: boolean = false
    navCollapsedMob: boolean = false
    windowWidth: number = 0
    form: undefined
    isSubmit: boolean
    moduloId: string = ''
    modoEdicion: boolean = false
    aplicacionesSub?: Subscription
    aplicaciones: PTLAplicacionModel[] = []
    suitesSub?: Subscription
    modulosSub?: Subscription
    suites: PTLSuiteAPModel[] = []
    modulosPadre: PTLModuloAP[] = []
    modulosSeleccionados: PTLModuloPQModel[] = []
    codigoPaquete: string = ''
    codigoAplicacion: string = ''
    codigoSuite: string = ''
    tipoEditorTexto = 'basica'
    lockScreenSubscription: Subscription | undefined
    isLocked: boolean = false
    lockMessage: string = ''
    suscriptor: string = ''
    // #endregion VARIABLES

    // constructor
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _aplicacionesService: PtlAplicacionesService,
        private _suitesService: PtlSuitesAPService,
        private _registrosService: PTLModulosPaqueteService,
        private _modulosService: PtlmodulosApService,
        private _layoutInitializer: LayoutInitializerService,
        private _logActividadesService: PtllogActividadesService,
        private _swalAlertService: SwalAlertService,
        private _localStorageService: LocalStorageService,
        private _loadingService: LoadingService,
        private _navigationService: NavigationService
    ) {
        this.isSubmit = false
        GradientConfig.header_fixed_layout = true
        this.gradientConfig = GradientConfig
        this.navCollapsed = this.windowWidth >= 992 ? GradientConfig.isCollapse_menu : false
        this.navCollapsedMob = false
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
        this.moduloId = this._localStorageService.getObject<string>('regId') || ''
        this.codigoPaquete = this._localStorageService.getObject<string>('regPQ') || ''
        if (this.moduloId != 'nuevo') {
            this.modoEdicion = true
            this.consultarModulosPaquete(this.codigoPaquete)
        } else {
            this.modoEdicion = false
        }
    }

    ngOnInit() {
        this._layoutInitializer.applyLayout()
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        this.consultarAplicaciones()
        // TODO Replicar en todos los modulos de gestion de datos
        this.lockScreenSubscription = this._navigationService.lockScreenEvent$.subscribe({
            next: (message: string) => {
                this._localStorageService.setFormRegistro(this.FormRegistro)
                this.isLocked = true
                this.lockMessage = message
            },
            error: err => console.error('Error al suscribirse al evento de bloqueo:', err)
        })
        const form = this._localStorageService.getFormRegistro()
        if (form != undefined) {
            this.FormRegistro = form
            this._localStorageService.removeFormRegistro()
        }
        if (!this.modoEdicion) {
            console.log('modo edicion', this.modoEdicion)
            this.FormRegistro.codigoAplicacion = ''
            this.FormRegistro.codigoSuite = ''
            this.FormRegistro.codigoModulo = ''
            this.FormRegistro.codigoModuloPQ = uuidv4()
            console.log('FormRegistro', this.FormRegistro)
        }
    }

    consultarAplicaciones() {
        this.aplicacionesSub = this._aplicacionesService
            .getAplicaciones()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.aplicaciones = resp.aplicaciones
                        console.log('las aplicaciones', this.aplicaciones)
                        return
                    }
                }),
                catchError(err => {
                    console.log('Ha ocurrido un error', err)
                    return of(null)
                })
            )
            .subscribe()
    }

    consultarSuites(codapp?: string) {
        this.suitesSub = this._suitesService
            .geSuitesAP()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        if (codapp) {
                            this.suites = resp.suites.filter((x: { codigoAplicacion: string }) => x.codigoAplicacion == codapp)
                        } else {
                            this.suites = resp.suites
                        }
                        console.log('Todos las suites', this.suites)
                        return
                    }
                }),
                catchError(err => {
                    console.log('Ha ocurrido un error', err)
                    return of(null)
                })
            )
            .subscribe()
    }

    consultarModulosPaquete(codPaquete?: string) {
        this._registrosService.getRegistros().subscribe({
            next: (resp: any) => {
                const modsPaquete = resp.modulosPaquete.filter((x: { codigoPaquete: string }) => x.codigoPaquete === codPaquete)
                this.modulosSeleccionados = modsPaquete
                console.log('modulos paquete', this.modulosSeleccionados)
            },
            error: () => {
                this._swalAlertService.getAlertError('No se pudo obtener el modulo.')
            }
        })
    }

    consultarModulos(codSuite?: string) {
        this.modulosSub = this._modulosService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        console.log('todos los modulos', resp.modulos)
                        if (codSuite) {
                            const modulosSuite = resp.modulos.filter((x: { codigoSuite: string }) => x.codigoSuite == codSuite)
                            modulosSuite.forEach((modulo: any) => {
                                const existe = this.modulosSeleccionados.find((sel: any) => sel.codigoModulo == modulo.codigoModulo)
                                console.log('existe', existe)
                                modulo.checked = existe ? true : false
                            })
                            this.modulosPadre = modulosSuite.filter((x: { hijos: boolean }) => x.hijos == true)
                        } else {
                            this.modulosPadre = []
                        }
                        // this._registrosService.getRegistros().subscribe({
                        //   next: (resp: any) => {
                        //     const modsPaquete = resp.modulosPaquete.filter((x: { codigoPaquete: string }) => x.codigoPaquete === this.codigoPaquete)
                        //     this.modulosSeleccionados = modsPaquete
                        //     console.log('modulos paquete', this.modulosSeleccionados)

                        //   },
                        //   error: () => {
                        //     this._swalAlertService.getAlertError('No se pudo obtener el modulo.')
                        //   }
                        // })
                        console.log('Todos las modulos padre', this.modulosPadre)
                        return
                    }
                }),
                catchError(err => {
                    console.log('Ha ocurrido un error', err)
                    return of(null)
                })
            )
            .subscribe()
    }

    btnAsociarTodosClick() {
        this.modulosPadre.forEach(modu => {
            const existe = this.modulosSeleccionados.filter(x => x.codigoModulo === modu.codigoModulo)
            console.log('existe', existe)
            if (existe.length > 0) {
                console.log('ya existe el registro', modu)
                if (modu.checked == true) {
                    const index = this.modulosSeleccionados.findIndex(x => x.codigoModulo === modu.codigoModulo)
                    this.modulosSeleccionados.splice(index, 1)
                    // modu.checked = false;
                }
            } else {
                modu.checked = true
                this.modulosSeleccionados.push(modu)
            }
        })
        console.log('modulos seleccionados', this.modulosSeleccionados)
    }

    onModuloCheckChange(evento: any, modu: PTLModuloAP) {
        console.log('asociar el modulo', modu)
        console.log('modulos seleccionados', this.modulosSeleccionados)
        modu.checked = evento.target.checked
        const existe = this.modulosSeleccionados.filter(x => x.codigoModulo === modu.codigoModulo)
        console.log('existe', existe)
        if (evento.target.checked) {
            if (existe.length == 0) {
                this.modulosSeleccionados.push(modu)
            }
        } else {
            if (existe.length != 0) {
                const index = this.modulosSeleccionados.findIndex(x => x.codigoModulo === modu.codigoModulo)
                this.modulosSeleccionados.splice(index, 1)
            }
        }

        console.log('modulos seleccionados', this.modulosSeleccionados)
    }

    onAplicacionChangeClick(value: any) {
        const app = this.aplicaciones.filter(x => x.codigoAplicacion == value.target.value)[0]
        this.FormRegistro.codigoAplicacion = app.codigoAplicacion || ''
        this.codigoAplicacion = app.codigoAplicacion || ''
        this.consultarSuites(app.codigoAplicacion)
    }

    onSuiteChangeClick(value: any) {
        const suite = this.suites.filter(x => x.codigoSuite == value.target.value)[0]
        console.log('suite seleccionada', suite)
        this.FormRegistro.codigoSuite = suite.codigoSuite || ''
        this.codigoSuite = suite.codigoSuite || ''
        this.consultarModulos(suite.codigoSuite)
    }

    btnGestionarRegistroClick(codigo: string) {
        this._loadingService.show()
        console.log('insertar los modulos', this.modulosSeleccionados)
        console.log('PAQUETEEEE', codigo)
        if (this.modulosSeleccionados.length > 0) {
            let modulosFinal: any[] = []
            this.modulosSeleccionados.forEach(modulo => {
                const registroData: PTLModuloPQModel = new PTLModuloPQModel()
                registroData.codigoModuloPQ = uuidv4()
                registroData.codigoModulo = modulo.codigoModulo
                registroData.codigoAplicacion = this.codigoAplicacion
                registroData.codigoSuite = this.codigoSuite
                registroData.codigoPaquete = this.codigoPaquete
                registroData.estadoModuloPQ = true
                registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
                registroData.fechaCreacion = new Date().toISOString()
                registroData.codigoUsuarioModificacion = ''
                registroData.fechaModificacion = ''
                console.log('insertar registro', registroData)
                modulosFinal.push(registroData)
            })
            const dataCrear: PTLModuloPQModelAdm = {
                codigoPaquete: this.codigoPaquete,
                codigoAplicacion: this.codigoAplicacion,
                codigoSuite: this.codigoSuite,
                modulos: modulosFinal
            }
            console.log('procesar data', dataCrear)
            this._registrosService.postCrearRegistro(dataCrear).subscribe({
                next: (resp: any) => {
                    console.log('reesp', resp)
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PLATAFORMA.INSERTAR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalAlertService.getAlertConfirmSuccess(this.translate.instant('PLATAFORMA.INSERTAR'))
                        this._loadingService.hide()
                        this.router.navigate(['aplicaciones/modulos-paquete'], { queryParams: { regId: this.codigoPaquete } })
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('PLATAFORMA.NOINSERTO') + ', ' + err.message
                    }
                    this._loadingService.hide()
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOINSERTO') + ', ' + err)
                }
            })
        } else {
            this._loadingService.hide()
            this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOREGISTROS'))
        }

        // if (this.modoEdicion) {
        //     this._registrosService.putModificarRegistro(registroData, this.moduloId).subscribe({
        //         next: (resp: any) => {
        //             if (resp.ok) {
        //                 const logData = {
        //                     codigoTipoLog: '',
        //                     codigoRespuesta: '201',
        //                     descripcionLog: this.translate.instant('PLATAFORMA.MODIFICAR')
        //                 };
        //                 this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
        //                 this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.MODIFICAR'));
        //                 this.router.navigate(['/aplicaciones/modulos']);
        //             } else {
        //                 const logData = {
        //                     codigoTipoLog: '',
        //                     codigoRespuesta: '501',
        //                     descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO')
        //                 };
        //                 this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
        //                 this._swalAlertService.getAlertError(resp.message || this.translate.instant('PLATAFORMA.NOMODIFICO'));
        //             }
        //         },
        //         error: (err: any) => {
        //             console.error(err);
        //             const logData = {
        //                 codigoTipoLog: '',
        //                 codigoRespuesta: '501',
        //                 descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO') + ', ' + err.message
        //             };
        //             this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
        //             this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOMODIFICO'));
        //         }
        //     });
        // } else {
        //     //   const registroData = form.value as PTLModuloAP;
        //     registroData.codigoModulo = uuidv4();
        //     registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
        //     registroData.fechaCreacion = new Date().toISOString();
        //     registroData.codigoUsuarioModificacion = '';
        //     registroData.fechaModificacion = '';
        //     console.log('insertar registro', registroData);
        //     this._registrosService.postCrearRegistro(registroData).subscribe({
        //         next: (resp: any) => {
        //             console.log('reesp', resp.modulo);
        //             if (resp.ok) {
        //                 const logData = {
        //                     codigoTipoLog: '',
        //                     codigoRespuesta: '201',
        //                     descripcionLog: this.translate.instant('PLATAFORMA.INSERTAR')
        //                 };
        //                 this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
        //                 this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.INSERTAR'));
        //                 form.resetForm();
        //                 this.isSubmit = false;
        //                 this.router.navigate(['/aplicaciones/modulos']);
        //             }
        //         },
        //         error: (err: any) => {
        //             console.error(err);
        //             const logData = {
        //                 codigoTipoLog: '',
        //                 codigoRespuesta: '501',
        //                 descripcionLog: this.translate.instant('PLATAFORMA.NOINSERTO') + ', ' + err.message
        //             };
        //             this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
        //             this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOINSERTO') + ', ' + err);
        //         }
        //     });
        // }
    }

    btnRegresarClick() {
        this.router.navigate(['aplicaciones/modulos-paquete'], { queryParams: { regId: this.codigoPaquete } })
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
