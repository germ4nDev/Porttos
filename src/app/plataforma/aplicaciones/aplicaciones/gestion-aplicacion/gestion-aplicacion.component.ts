/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { GradientConfig } from 'src/app/app-config'
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import {
    LocalStorageService,
    PtlAplicacionesService,
    PtllogActividadesService,
    SwalAlertService,
    UploadFilesService
} from 'src/app/theme/shared/service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { Observable, Subscription } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'
import Swal from 'sweetalert2'

// import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model';
// import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model';

@Component({
    selector: 'app-gestion-aplicacion',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-aplicacion.component.html',
    styleUrl: './gestion-aplicacion.component.scss'
})
export class GestionAplicacionComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: PTLAplicacionModel = new PTLAplicacionModel()
    logActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()
    menuItems$!: Observable<NavigationItem[]>
    gradientConfig: any
    navCollapsed: boolean = false
    navCollapsedMob: boolean = false
    windowWidth: number = 0
    selectedFile: File | null = null
    previewUrl: string | ArrayBuffer | null = null
    userPhotoUrl: string = ''
    fileName: string | null = null
    selectedFileUrl: string | null = null

    form: undefined
    isSubmit: boolean = false
    modoEdicion: boolean = false
    codeAplicacion = uuidv4()
    tipoEditorTexto = 'basica'
    lockScreenSubscription: Subscription | undefined
    isLocked: boolean = false
    lockMessage: string = ''
    suscriptor: string = ''

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _localStorageService: LocalStorageService,
        private _logActividadesService: PtllogActividadesService,
        private _aplicacionesService: PtlAplicacionesService,
        private _swalService: SwalAlertService,
        private _translate: TranslateService,
        private _uploadService: UploadFilesService
    ) {
        this.isSubmit = false
        GradientConfig.header_fixed_layout = true
        this.gradientConfig = GradientConfig
        this.navCollapsed = this.windowWidth >= 992 ? GradientConfig.isCollapse_menu : false
        this.navCollapsedMob = false
        this._navigationService.getNavigationItems()
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
        const regId = this._localStorageService.getObject<string>('regId') || 'nuevo'
        if (regId !== 'nuevo') {
            this.modoEdicion = true
            this._aplicacionesService.getAplicacionById(regId).subscribe({
                next: (resp: any) => {
                    this.FormRegistro = resp.aplicacion
                    this.codeAplicacion = resp.aplicacion.codigoAplicacion
                    this.selectedFileUrl = this._uploadService.getFilePath(this.suscriptor, 'aplicaciones', resp.aplicacion.imagenInicio)
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo obtener la Aplicación', 'error')
                }
            })
        }
    }

    ngOnInit() {
        this.menuItems$ = this._navigationService.menuItems$
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
        if (this.modoEdicion == false) {
            this.FormRegistro.codigoAplicacion = uuidv4()
            this.FormRegistro.imagenInicio = 'no-image.png'
            console.log('FormRegistro loading', this.FormRegistro)
        }
        console.log('Inicial formregistro', this.FormRegistro)
        // const navSettings = this._localStorageService.getNavSettingsLocalStorage();
        console.log('data del log', this.logActividad)
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcionAplicacion = nuevoContenido
        console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionAplicacion)
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    onFileSelectedClick(event: any) {
        const file: File = event.target.files[0]
        const objUpload = {
            susc: this.suscriptor,
            tipo: 'aplicaciones'
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

    btnGestionarAplicacionClick(form: any) {
        // this.isSubmit = true;
        if (this.modoEdicion) {
            this.FormRegistro.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            this.FormRegistro.fechaModificacion = new Date().toISOString()
            this._aplicacionesService.actualizarAplicacion(this.FormRegistro).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('APLICACIONES.CREATESUCCSESSFULLY')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalService.getAlertSuccess(this.translate.instant('APLICACIONES.CREATESUCCSESSFULLY'))
                        form.resetForm()
                        // this.isSubmit = false;
                        this.router.navigate(['/aplicaciones/aplicaciones'])
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('APLICACIONES.CREATESUCCSESSFULLY')
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalService.getAlertError('No se pudo actualizar la Aplicación')
                }
            })
        } else {
            form.aplicacionId = 0
            const registroData = form.value as PTLAplicacionModel
            registroData.codigoAplicacion = uuidv4()
            registroData.imagenInicio = this.FormRegistro.imagenInicio
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario || ''
            registroData.fechaCreacion = new Date().toISOString()
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario || ''
            registroData.fechaModificacion = new Date().toISOString()
            console.log('nueva aplicacion', registroData);

            // this._aplicacionesService.crearAplicacion(registroData).subscribe({
            //     next: (resp: any) => {
            //         console.log('resp', resp)
            //         if (resp.ok) {
            //             const logData = {
            //                 codigoTipoLog: '',
            //                 codigoRespuesta: '201',
            //                 descripcionLog: this.translate.instant('APLICACIONES.ELIMINAREXITOSA')
            //             }
            //             this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
            //             this._swalService.getAlertSuccess(this.translate.instant('APLICACIONES.UPDATESUCCSESSFULLY'))
            //             form.resetForm()
            //             // this.isSubmit = false;
            //             this.router.navigate(['/aplicaciones/aplicaciones'])
            //         }
            //     },
            //     error: (err: any) => {
            //         console.error(err)
            //         const logData = {
            //             codigoTipoLog: '',
            //             codigoRespuesta: '500',
            //             descripcionLog: this.translate.instant('APLICACIONES.ELIMINAREXITOSA')
            //         }
            //         this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
            //         this._swalService.getAlertError('No se pudo crear la Aplicación')
            //     }
            // })
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/aplicaciones/aplicaciones'])
    }

    navMobClick() {
        if (this.windowWidth < 992) {
            if (this.navCollapsedMob && !document.querySelector('app-navigation.pcoded-navbar')?.classList.contains('mob-open')) {
                this.navCollapsedMob = !this.navCollapsedMob
                setTimeout(() => {
                    this.navCollapsedMob = !this.navCollapsedMob
                }, 100)
            } else {
                this.navCollapsedMob = !this.navCollapsedMob
            }
        }
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
