/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { ActivatedRoute, Router } from '@angular/router'
import { PtlAplicacionesService } from 'src/app/theme/shared/service/ptlaplicaciones.service'
import { catchError, Observable, of, Subscription, tap } from 'rxjs'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GradientConfig } from 'src/app/app-config'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { LayoutInitializerService } from 'src/app/theme/shared/service/layout-initializer.service'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { v4 as uuidv4 } from 'uuid'
import { PtlSuitesAPService } from 'src/app/theme/shared/service/ptlsuites-ap.service'
import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model'
import { PtlmodulosApService } from 'src/app/theme/shared/service/ptlmodulos-ap.service'
import { PTLModuloAP } from 'src/app/theme/shared/_helpers/models/PTLModuloAP.model'
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component'
import { LocalStorageService, PtlBibliotecasService, PtllogActividadesService, SwalAlertService } from 'src/app/theme/shared/service'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { PTLBiblioteca } from 'src/app/theme/shared/_helpers/models/PTLBiblioteca.model'

@Component({
    selector: 'app-gestion-modulo',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-modulo.component.html',
    styleUrl: './gestion-modulo.component.scss'
})
export class GestionModuloComponent implements OnInit, OnDestroy {
    // #region VARIABLES
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: PTLModuloAP = new PTLModuloAP()
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
    bibliotecasSub?: Subscription
    listBibliotecas: PTLBiblioteca[] = []
    codigoModulo = uuidv4()
    tipoEditorTexto = 'basica'
    lockScreenSubscription: Subscription | undefined
    isLocked: boolean = false
    lockMessage: string = ''
    // #endregion VARIABLES

    // constructor
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _aplicacionesService: PtlAplicacionesService,
        private _suitesService: PtlSuitesAPService,
        private _biblioecasService: PtlBibliotecasService,
        private _registrosService: PtlmodulosApService,
        private _layoutInitializer: LayoutInitializerService,
        private _logActividadesService: PtllogActividadesService,
        private _swalAlertService: SwalAlertService,
        private _localStorageService: LocalStorageService,
        private _navigationService: NavigationService
    ) {
        this.isSubmit = false
        GradientConfig.header_fixed_layout = true
        this.gradientConfig = GradientConfig
        this.navCollapsed = this.windowWidth >= 992 ? GradientConfig.isCollapse_menu : false
        this.navCollapsedMob = false
        this.moduloId = this._localStorageService.getObject<string>('regId') || 'nuevo'
        if (this.moduloId != 'nuevo') {
            this.modoEdicion = true
            this._registrosService.getRegistroById(this.moduloId).subscribe({
                next: (resp: any) => {
                    this.FormRegistro = resp.modulo
                    this.FormRegistro.hijos = resp.modulo.hijos;
                    this.FormRegistro.estadoModulo = resp.modulo.estadoModulo;
                    this.FormRegistro.rutaModulo = resp.modulo.hijos ? 'Padre' : resp.modulo.rutaModulo;
                    console.log('formRegistro modulo', this.FormRegistro)
                    this.consultarSuites(this.FormRegistro.codigoAplicacion)
                    this.consultarMLodulos(this.FormRegistro.codigoSuite)
                },
                error: () => {
                    this._swalAlertService.getAlertError('No se pudo obtener el modulo.')
                }
            })
        } else {
            this.modoEdicion = false
        }
        this.route.queryParams.subscribe(params => { })
    }

    ngOnInit() {
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        this.consultarAplicaciones()
        this.consultarSuites()
        this.consultarMLodulos()
        this._layoutInitializer.applyLayout()
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
            this.FormRegistro.codigoPadre = ''
            this.FormRegistro.codigoModulo = uuidv4()
            // this.FormRegistro.codigoModulo = uuidv4();
            console.log('FormRegistro', this.FormRegistro)
        }
    }

    ngOnDestroy(): void {
        this.aplicacionesSub?.unsubscribe()
        this.suitesSub?.unsubscribe()
        this.bibliotecasSub?.unsubscribe()
        this.modulosSub?.unsubscribe()
    }

    consultarAplicaciones() {
        this.aplicacionesSub = this._aplicacionesService
            .getAplicaciones()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.aplicaciones = resp.aplicaciones
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

    consultarMLodulos(codSuite?: string) {
        this.modulosSub = this._registrosService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        console.log('todos los modulos', resp.modulos)
                        if (codSuite) {
                            const modulosSuite = resp.modulos.filter((x: { codigoSuite: string }) => x.codigoSuite == codSuite)
                            this.modulosPadre = modulosSuite.filter((x: { hijos: boolean }) => x.hijos == true)
                        } else {
                            this.modulosPadre = resp.modulos.filter((x: { hijos: boolean }) => x.hijos == true)
                        }
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

    onAplicacionChangeClick(event: any) {
        const value = event.target.value
        const app = this.aplicaciones.filter(x => x.codigoAplicacion == value)[0]
        this.FormRegistro.codigoAplicacion = app.codigoAplicacion || ''
        this.consultarSuites(app.codigoAplicacion)
    }

    onSuiteChangeClick(event: any) {
        const value = event.target.value
        const suite = this.suites.filter(x => x.codigoSuite == value)[0]
        this.FormRegistro.codigoSuite = suite.codigoSuite || ''
        this.consultarMLodulos(this.FormRegistro.codigoSuite)
    }

    onCodigoPadreChangeClick(event: any) {
        const value = event.target.value
        this.FormRegistro.codigoPadre = value || ''
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcionModulo = nuevoContenido
        console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionModulo)
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    btnGestionarRegistroClick(form: any) {
        this.isSubmit = true
        // if (!form.valid) {
        //   return;
        // }
        if (form.value.hijos == true) {
            form.value.codigoPadre = '0'
            form.value.rutaModulo = ''
        } else {
            form.value.icon = ''
        }
        const registroData = form.value as PTLModuloAP
        console.log('insertar formRegistro', registroData)
        if (this.modoEdicion) {
            registroData.codigoUsuarioCreacion = this.FormRegistro.codigoUsuarioCreacion
            registroData.fechaCreacion = this.FormRegistro.fechaCreacion
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaModificacion = new Date().toISOString()
            this._registrosService.putModificarRegistro(registroData, this.moduloId).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PLATAFORMA.MODIFICAR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.MODIFICAR'))
                        this.router.navigate(['/aplicaciones/modulos'])
                    } else {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalAlertService.getAlertError(resp.message || this.translate.instant('PLATAFORMA.NOMODIFICO'))
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO') + ', ' + err.message
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOMODIFICO'))
                }
            })
        } else {
            //   const registroData = form.value as PTLModuloAP;
            registroData.codigoModulo = uuidv4()
            registroData.codigoBiblioteca = uuidv4()
            registroData.codigoPadre = this.FormRegistro.codigoPadre || '0'
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaCreacion = new Date().toISOString()
            registroData.codigoUsuarioModificacion = ''
            registroData.fechaModificacion = ''
            console.log('insertar registro', registroData)
            this._registrosService.postCrearRegistro(registroData).subscribe({
                next: (resp: any) => {
                    console.log('reesp', resp.modulo)
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PLATAFORMA.INSERTAR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.INSERTAR'))
                        form.resetForm()
                        this.isSubmit = false
                        this.router.navigate(['/aplicaciones/modulos'])
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('PLATAFORMA.NOINSERTO') + ', ' + err.message
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOINSERTO') + ', ' + err)
                }
            })
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/aplicaciones/modulos'])
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
