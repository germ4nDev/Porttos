/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Subscription, tap, catchError, of, Observable } from 'rxjs'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { PTLConexionBDModel } from 'src/app/theme/shared/_helpers/models/PTLConexionBD.model'
import { PTLPaquetesSCModel } from 'src/app/theme/shared/_helpers/models/PTLPaquetesSC.model'
import { PTLSuscriptorModel } from 'src/app/theme/shared/_helpers/models/PTLSuscriptor.model'
import { LocalStorageService, PtlAplicacionesService, PtllogActividadesService } from 'src/app/theme/shared/service'
import { PTLConexionesBDSTService } from 'src/app/theme/shared/service/ptlconexiones-bd-st.service'
import { PTLPaquetesSCService } from 'src/app/theme/shared/service/ptlpaquetes-sc.service'
import { PTLSuscriptoresService } from 'src/app/theme/shared/service/ptlsuscriptores.service'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { GradientConfig } from 'src/app/app-config'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { LayoutInitializerService } from 'src/app/theme/shared/service/layout-initializer.service'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component'
import Swal from 'sweetalert2'
import { v4 as uuidv4 } from 'uuid'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'

@Component({
    selector: 'app-gestion-conexion',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-conexion.component.html',
    styleUrl: './gestion-conexion.component.scss'
})
export class GestionConexionComponent {
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: PTLConexionBDModel = new PTLConexionBDModel()
    menuItems$!: Observable<NavigationItem[]>
    gradientConfig: any
    navCollapsed: boolean = false
    navCollapsedMob: boolean = false
    windowWidth: number = 0

    aplicaciones: PTLAplicacionModel[] = []
    suscriptores: PTLSuscriptorModel[] = []
    paquetes: PTLPaquetesSCModel[] = []
    registrosSub?: Subscription
    form: undefined
    isSubmit: boolean = false
    modoEdicion: boolean = false
    codeRegistro = uuidv4()
    tipoEditorTexto = 'basica'
    lockScreenSubscription: Subscription | undefined
    isLocked: boolean = false
    lockMessage: string = ''

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _registrosService: PTLConexionesBDSTService,
        private _aplicacionesService: PtlAplicacionesService,
        private _logActividadesService: PtllogActividadesService,
        private _suscriptoresService: PTLSuscriptoresService,
        private _paquetesService: PTLPaquetesSCService,
        private _layoutInitializer: LayoutInitializerService,
        private _localStorageService: LocalStorageService,
        private _navigationService: NavigationService
    ) {
        this.isSubmit = false
        GradientConfig.header_fixed_layout = true
        this.gradientConfig = GradientConfig
        this.navCollapsed = this.windowWidth >= 992 ? GradientConfig.isCollapse_menu : false
        this.navCollapsedMob = false
        const registroId = this._localStorageService.getObject<string>('regId') || ''
        if (registroId != 'nuevo') {
            console.log('me llena el Id', registroId)
            this.modoEdicion = true
            this._registrosService.getRegistroById(registroId).subscribe({
                next: (resp: any) => {
                    console.log('resp', resp)
                    const susc = this.suscriptores.filter(x => x.codigoSuscriptor == resp.codigoSuscriptor)[0]
                    const paque = this.paquetes.filter(x => x.codigoPaquete == resp.codigoPaquete)[0]
                    resp.nombreSuscriptor = susc.nombreSuscriptor
                    resp.nombrePaquete = paque.nombrePaquete
                    this.FormRegistro = resp.paquetes
                    console.log('datos del FormRegistro', this.FormRegistro)
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo obtener el rol', 'error')
                }
            })
        } else {
            // console.log('no llena el Id', registroId);
            this.modoEdicion = false
            // this.FormRegistro.aplicacionId = uuidv4();
        }
    }

    ngOnInit() {
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        // this.consultarAplicaciones();
        this.consultarSuscriptores()
        this.consultarPaquetes()
        this._layoutInitializer.applyLayout()
        this.lockScreenSubscription = this._navigationService.lockScreenEvent$.subscribe({
            next: (message: string) => {
                this._localStorageService.setFormRegistro(this.FormRegistro)
                this.isLocked = true
                this.lockMessage = message
            },
            error: err => console.error('Error al suscribirse al evento de bloqueo:', err)
        })
        if (this.modoEdicion == false) {
            this.FormRegistro.codigoConexion = uuidv4()
            console.log('FormRegistro loading', this.FormRegistro)
        }
        const form = this._localStorageService.getFormRegistro()
        if (form != undefined) {
            this.FormRegistro = form
            this._localStorageService.removeFormRegistro()
        }
    }

    consultarSuscriptores() {
        this.registrosSub = this._suscriptoresService
            .getSuscriptores()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.suscriptores = resp.suscriptores
                        console.log('Todos las suscriptores', this.suscriptores)
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

    consultarPaquetes() {
        this.registrosSub = this._paquetesService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.paquetes = resp.paquetes
                        // console.log('Todos las paquetes', this.paquetes);
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

    onAplicacionchangeClick(event: any) {
        console.log('evento', event)
        // const value = event.target.value;
        // const app = this.aplicaciones.filter((x) => x.aplicacionId == value)[0];
        // this.FormRegistro.aplicacionId = app.aplicacionId;
        // this.FormRegistro.aplicacionId = value;
    }

    onSuscriptorChangeClick(event: any) {
        const value = event.target.value
        const suscriptor = this.suscriptores.filter(x => x.codigoSuscriptor == value)[0]
        // console.log('Código de suscriptor seleccionado:', value);
        // console.log('data suscriptor seleccionado:', suscriptor);
        this.FormRegistro.codigoSuscriptor = suscriptor.codigoSuscriptor
        this.FormRegistro.codigoSuscriptor = value
    }

    onPaqueteChangeClick(event: any) {
        const value = event.target.value
        const paquete = this.paquetes.filter(x => x.suscriptorPaqueteId == value)[0]
        // console.log('Código de paquete seleccionado:', value);
        // console.log('data paquete seleccionado:', paquete);
        this.FormRegistro.codigoPaquete = paquete.codigoSuscriptor
        this.FormRegistro.codigoPaquete = value
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcionConexion = nuevoContenido
        console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionConexion)
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    btnGestionarRegistroClick(form: any) {
        this.isSubmit = true
        if (!form.valid) {
            return
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
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire('', this.translate.instant('PLATAFORMA.MODIFICAR'), 'success')
                        this.router.navigate(['/administracion-bd/conexiones'])
                    } else {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('PLATAFORMA.MODIFICAR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire('Error', resp.message || this.translate.instant('PLATAFORMA.NOMODIFICO'), 'error')
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
                    Swal.fire('Error', this.translate.instant('PLATAFORMA.NOMODIFICO'), 'error')
                }
            })
        } else {
            // console.log('formregistro', this.FormRegistro);
            const registroData = form.value as PTLConexionBDModel
            registroData.codigoConexion = uuidv4()
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaCreacion = new Date().toISOString()
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaModificacion = new Date().toISOString()
            this._registrosService.postCrearRegistro(registroData).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PLATAFORMA.INSERTAR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire('', this.translate.instant('PLATAFORMA.INSERTAR'), 'success')
                        form.resetForm()
                        this.isSubmit = false
                        this.router.navigate(['/administracion-bd/conexiones'])
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
                    Swal.fire('Error', this.translate.instant('PLATAFORMA.NOINSERTO'), 'error')
                }
            })
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/administracion-bd/conexiones'])
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
