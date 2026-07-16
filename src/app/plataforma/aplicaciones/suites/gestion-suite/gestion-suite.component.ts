/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
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
import { PtlSuitesAPService } from 'src/app/theme/shared/service/ptlsuites-ap.service'
import { LocalStorageService } from 'src/app/theme/shared/service/local-storage.service'
import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model'
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component'
import { PtllogActividadesService, SwalAlertService, UploadFilesService } from 'src/app/theme/shared/service'
import Swal from 'sweetalert2'
import { v4 as uuidv4 } from 'uuid'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model'

@Component({
    selector: 'app-gestion-suite',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-suite.component.html',
    styleUrl: './gestion-suite.component.scss'
})
export class GestionSuiteComponent implements OnInit {
    // private props
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: PTLSuiteAPModel = new PTLSuiteAPModel()
    menuItems$!: Observable<NavigationItem[]>
    logActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()
    gradientConfig: any
    navCollapsed: boolean = false
    navCollapsedMob: boolean = false
    windowWidth: number = 0
    registroId: string = ''
    form: undefined
    isSubmit: boolean
    modoEdicion: boolean = false
    aplicacionesSub?: Subscription
    aplicaciones: PTLAplicacionModel[] = []
    codigosuite = uuidv4()
    tipoEditorTexto = 'basica'
    suscriptor: string = ''

    selectedFile: File | null = null
    previewUrl: string | ArrayBuffer | null = null
    userPhotoUrl: string = ''
    fileName: string | null = null
    selectedFileUrl: string | null = null
    lockScreenSubscription: Subscription | undefined
    isLocked: boolean = false
    lockMessage: string = ''

    // constructor
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _registrosService: PtlSuitesAPService,
        private _aplicacionesService: PtlAplicacionesService,
        private _layoutInitializer: LayoutInitializerService,
        private _logActividadesService: PtllogActividadesService,
        private _swalService: SwalAlertService,
        private _translate: TranslateService,
        private _localStorageService: LocalStorageService,
        private _uploadService: UploadFilesService,
        private _navigationService: NavigationService
    ) {
        this.isSubmit = false
        GradientConfig.header_fixed_layout = true
        this.gradientConfig = GradientConfig
        this.navCollapsed = this.windowWidth >= 992 ? GradientConfig.isCollapse_menu : false
        this.navCollapsedMob = false
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
        const regId = this._localStorageService.getObject<string>('regId') || 'nuevo'
        if (regId != 'nuevo') {
            this.modoEdicion = true
            this._registrosService.getSuiteAPById(this.registroId).subscribe({
                next: (resp: any) => {
                    this.FormRegistro = resp.suite
                    this.codigosuite = resp.suite.codigoSuite
                    this.selectedFileUrl = this._uploadService.getFilePath(this.suscriptor, 'suites', resp.suite.imagenInicio)
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo obtener la suite por, ', 'error')
                }
            })
        } else {
            this.modoEdicion = false
        }
    }

    ngOnInit() {
        this._layoutInitializer.applyLayout()
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        this.consultarAplicaciones()
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
            this.FormRegistro.codigoSuite = uuidv4()
            this.FormRegistro.imagenInicio = 'no-image.png'
            console.log('FormRegistro loading', this.FormRegistro)
        }
        console.log('Inicial formregistro', this.FormRegistro)
        // const navSettings = this._localStorageService.getNavSettingsLocalStorage();
        console.log('data del log', this.logActividad)
    }

    consultarAplicaciones() {
        this.aplicacionesSub = this._aplicacionesService
            .getAplicaciones()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.aplicaciones = resp.aplicaciones
                        console.log('Todos las aplicaciones', this.aplicaciones)
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
        const value = event.target.value
        const app = this.aplicaciones.filter(x => x.codigoAplicacion == value)[0]
        this.FormRegistro.codigoAplicacion = app.codigoAplicacion || ''
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcionSuite = nuevoContenido
        console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionSuite)
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    onFileSelectedClick(event: any) {
        const file: File = event.target.files[0]
        const objUpload = {
            susc: this.suscriptor,
            tipo: 'suites'
        }
        if (file) {
            const reader = new FileReader()
            reader.onload = (e: any) => {
                this.selectedFileUrl = e.target.result
            }
            reader.readAsDataURL(file)
            this._uploadService.uploadUserPhoto(file, objUpload).subscribe({
                next: (path: any) => {
                    const resp = path.data.respuesta
                    this.FormRegistro.imagenInicio = resp.fileName
                    this.userPhotoUrl = resp.fileName
                },
                error: () => {
                    this._swalService.getAlertError(this._translate.instant('PLATAFORMA.UPLOADPHOTOERROR'))
                }
            })
        } else {
            this.selectedFileUrl = null
            this.userPhotoUrl = ''
        }
    }

    btnGestionarRegistroClick(form: any) {
        this.isSubmit = true
        if (!form.valid) {
            return
        }

        // 1. Combinamos lo que haya en el formulario HTML con nuestra variable global
        this.FormRegistro = { ...this.FormRegistro, ...form.value }

        if (this.modoEdicion) {
            // Actualizamos directamente this.FormRegistro
            this.FormRegistro.imagenInicio = this.userPhotoUrl || this.FormRegistro.imagenInicio
            this.FormRegistro.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            this.FormRegistro.fechaModificacion = new Date().toISOString()

            this._registrosService.actualizarSuiteAP(this.FormRegistro).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PLATAFORMA.INSERTAR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalService.getAlertSuccess(this.translate.instant('PLATAFORMA.MODIFICAR'))
                        this.router.navigate(['/aplicaciones/suites'])
                    } else {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO') + ', ' + resp.message
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalService.getAlertError(resp.message || this.translate.instant('PLATAFORMA.NOMODIFICO'))
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
                    this._swalService.getAlertError(this.translate.instant('PLATAFORMA.NOMODIFICO'))
                }
            })
        } else {
            // Actualizamos directamente this.FormRegistro
            this.FormRegistro.codigoSuite = uuidv4()
            this.FormRegistro.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            this.FormRegistro.fechaCreacion = new Date().toISOString()
            this.FormRegistro.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            this.FormRegistro.imagenInicio = this.userPhotoUrl || this.FormRegistro.imagenInicio || 'no-image.png'
            this.FormRegistro.fechaModificacion = new Date().toISOString()

            console.log('insertar registro', this.FormRegistro)

            // ✅ AHORA SÍ ENVIAMOS LA VARIABLE CON TODOS LOS DATOS
            this._registrosService.crearSuiteAP(this.FormRegistro).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PLATAFORMA.INSERTAR') + ' ' + resp.mensaje
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalService.getAlertSuccess(this.translate.instant('PLATAFORMA.INSERTAR'))
                        form.resetForm()
                        this.isSubmit = false
                        this.router.navigate(['/aplicaciones/suites'])
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
                    this._swalService.getAlertError(this.translate.instant('PLATAFORMA.NOINSERTO'))
                }
            })
        }
    }

    // btnGestionarRegistroClick(form: any) {
    //     this.isSubmit = true
    //     if (!form.valid) {
    //         return
    //     }
    //     const registroData = form.value as PTLSuiteAPModel
    //     if (this.modoEdicion) {
    //         registroData.imagenInicio = this.userPhotoUrl || this.FormRegistro.imagenInicio
    //         registroData.codigoUsuarioCreacion = this.FormRegistro.codigoUsuarioCreacion
    //         registroData.fechaCreacion = this.FormRegistro.fechaCreacion
    //         registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
    //         registroData.fechaModificacion = new Date().toISOString()
    //         this._registrosService.actualizarSuiteAP(this.FormRegistro).subscribe({
    //             next: (resp: any) => {
    //                 if (resp.ok) {
    //                     const logData = {
    //                         codigoTipoLog: '',
    //                         codigoRespuesta: '201',
    //                         descripcionLog: this.translate.instant('PLATAFORMA.INSERTAR')
    //                     }
    //                     this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
    //                     this._swalService.getAlertSuccess(this.translate.instant('PLATAFORMA.MODIFICAR'))
    //                     this.router.navigate(['/aplicaciones/suites'])
    //                 } else {
    //                     const logData = {
    //                         codigoTipoLog: '',
    //                         codigoRespuesta: '501',
    //                         descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO') + ', ' + resp.message
    //                     }
    //                     this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
    //                     this._swalService.getAlertError(resp.message || this.translate.instant('PLATAFORMA.NOMODIFICO'))
    //                 }
    //             },
    //             error: (err: any) => {
    //                 console.error(err)
    //                 const logData = {
    //                     codigoTipoLog: '',
    //                     codigoRespuesta: '501',
    //                     descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO') + ', ' + err.message
    //                 }
    //                 this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
    //                 this._swalService.getAlertError(this.translate.instant('PLATAFORMA.NOMODIFICO'))
    //             }
    //         })
    //     } else {
    //         registroData.codigoSuite = uuidv4()
    //         registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
    //         registroData.fechaCreacion = new Date().toISOString()
    //         registroData.codigoUsuarioModificacion = ''
    //         registroData.imagenInicio = this.userPhotoUrl || this.FormRegistro.imagenInicio
    //         registroData.fechaModificacion = ''
    //         console.log('insertar registro', registroData)
    //         this._registrosService.crearSuiteAP(this.FormRegistro).subscribe({
    //             next: (resp: any) => {
    //                 if (resp.ok) {
    //                     const logData = {
    //                         codigoTipoLog: '',
    //                         codigoRespuesta: '201',
    //                         descripcionLog: this.translate.instant('PLATAFORMA.INSERTAR') + ' ' + resp.mensaje
    //                     }
    //                     this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
    //                     this._swalService.getAlertSuccess(this.translate.instant('PLATAFORMA.INSERTAR'))
    //                     form.resetForm()
    //                     this.isSubmit = false
    //                     this.router.navigate(['/aplicaciones/suites'])
    //                 }
    //             },
    //             error: (err: any) => {
    //                 console.error(err)
    //                 const logData = {
    //                     codigoTipoLog: '',
    //                     codigoRespuesta: '501',
    //                     descripcionLog: this.translate.instant('PLATAFORMA.NOINSERTO') + ', ' + err.message
    //                 }
    //                 this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
    //                 this._swalService.getAlertError(this.translate.instant('PLATAFORMA.NOINSERTO'))
    //             }
    //         })
    //     }
    // }

    btnRegresarClick() {
        this.router.navigate(['/aplicaciones/suites'])
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
