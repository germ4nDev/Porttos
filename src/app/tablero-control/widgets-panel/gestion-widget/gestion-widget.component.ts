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
import { Widget } from './../../../theme/shared/_helpers/models/tablero-control/widget.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { Observable, Subscription } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'
import Swal from 'sweetalert2'
import { WidgetsService } from 'src/app/theme/shared/service/tablero-control/widgets.service'

// import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model';
// import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model';

@Component({
    selector: 'app-gestion-widget',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-widget.component.html',
    styleUrl: './gestion-widget.component.scss'
})
export class GestionWidgetComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: Widget = new Widget()
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
    codigo_widget: string = ''
    tipoEditorTexto = 'basica'
    lockScreenSubscription: Subscription | undefined
    isLocked: boolean = false
    lockMessage: string = ''
    suscriptor: string = ''

    public listaPestanas: any[] = [
        { id: 'TLC_MARITIMO_001', nombre: 'Operación Marítima' },
        { id: 'TLC_TERRESTRE_001', nombre: 'Operación Terrestre' },
        { id: 'TLC_MAPA_001', nombre: 'Mapa Logístico' }
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _localStorageService: LocalStorageService,
        private _logActividadesService: PtllogActividadesService,
        private _widgetsService: WidgetsService,
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
        this.suscriptor = 'torre-control'
        const regId = this._localStorageService.getObject<string>('regId') || 'nuevo'
        if (regId !== 'nuevo') {
            this.modoEdicion = true
            this._widgetsService.getWidgetByCode(regId).subscribe({
                next: (resp: any) => {
                    console.log('editar widget', resp);
                    this.FormRegistro = resp.widget
                    // this.codigo_widget = resp.data.codigo_widget
                    // this.selectedFileUrl = this._uploadService.getFilePath(this.suscriptor, 'widgets', resp.widget.thumbnail_url)
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
            // this.FormRegistro.codigo_widget = uuidv4()
            this.FormRegistro.thumbnail_url = 'no-image.png'
            console.log('FormRegistro loading', this.FormRegistro)
        }
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcion = nuevoContenido
        console.log('Descripción de versión actualizada:', this.FormRegistro.descripcion)
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    onFileSelectedClick(event: any) {
        const file: File = event.target.files[0]
        const objUpload = {
            susc: this.suscriptor,
            tipo: 'widgets'
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
                    this.FormRegistro.thumbnail_url = resp.fileName
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

    btnCearWidgetClick(form: any) {
        form.widgetId = 0
        const registroData = form.value as Widget
        registroData.thumbnail_url = this.userPhotoUrl
        registroData.usuario_cargue = this._localStorageService.getUsuarioLocalStorage().codigoUsuario || ''
        registroData.fecha_cargue = new Date().toISOString()
        console.log('nueva widget', registroData);
        this._widgetsService.crearWidget(registroData).subscribe({
            next: (resp: any) => {
                if (resp.ok) {
                    // const logData = {
                    //     codigoTipoLog: '',
                    //     codigoRespuesta: '201',
                    //     descripcionLog: this.translate.instant('APLICACIONES.CREATESUCCSESSFULLY')
                    // }
                    // this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalService.getAlertSuccess(this.translate.instant('APLICACIONES.CREATESUCCSESSFULLY'))
                    form.resetForm()
                    // this.isSubmit = false;
                    this.router.navigate(['/tablero-control/widget-panel'])
                }
            },
            error: (err: any) => {
                console.error(err)
                // const logData = {
                //     codigoTipoLog: '',
                //     codigoRespuesta: '501',
                //     descripcionLog: this.translate.instant('APLICACIONES.CREATESUCCSESSFULLY')
                // }
                // this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                this._swalService.getAlertError('No se pudo actualizar la Aplicación')
            }
        })
    }

    btnGestionarWidgetClick(form: any) {
        form.widgetId = 0
        const registroData = form.value as Widget
        registroData.thumbnail_url = this.userPhotoUrl
        registroData.usuario_cargue = this._localStorageService.getUsuarioLocalStorage().codigoUsuario || ''
        registroData.fecha_cargue = new Date().toISOString()
        console.log('actualizar widget', registroData);
        this._widgetsService.actualizarWidget(registroData).subscribe({
            next: (resp: any) => {
                console.log('resp', resp)
                if (resp.ok) {
                    // const logData = {
                    //     codigoTipoLog: '',
                    //     codigoRespuesta: '201',
                    //     descripcionLog: this.translate.instant('APLICACIONES.ELIMINAREXITOSA')
                    // }
                    // this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalService.getAlertSuccess(this.translate.instant('APLICACIONES.UPDATESUCCSESSFULLY'))
                    form.resetForm()
                    // this.isSubmit = false;
                    this.router.navigate(['/tablero-control/widget-panel'])
                }
            },
            error: (err: any) => {
                console.error(err)
                // const logData = {
                //     codigoTipoLog: '',
                //     codigoRespuesta: '500',
                //     descripcionLog: this.translate.instant('APLICACIONES.ELIMINAREXITOSA')
                // }
                // this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                this._swalService.getAlertError('No se pudo crear la Aplicación')
            }
        })
    }

    btnRegresarClick() {
        this.router.navigate(['/tablero-control/widget-panel'])
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
