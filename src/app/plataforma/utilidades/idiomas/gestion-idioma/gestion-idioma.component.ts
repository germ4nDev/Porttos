/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { GradientConfig } from 'src/app/app-config'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import {
    LocalStorageService,
    PtllogActividadesService,
    PtlidiomasService,
    SwalAlertService,
    UploadFilesService
} from 'src/app/theme/shared/service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { Observable, Subscription } from 'rxjs'
import { PTLIdioma } from 'src/app/theme/shared/_helpers/models/PTLIdioma.model'
import { v4 as uuidv4 } from 'uuid'

@Component({
    selector: 'app-gestion-idioma',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent],
    templateUrl: './gestion-idioma.component.html',
    styleUrl: './gestion-idioma.component.scss'
})
export class GestionIdiomaComponent implements OnInit {
    // private props
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: PTLIdioma = new PTLIdioma()
    menuItems!: Observable<NavigationItem[]>
    gradientConfig: any
    navCollapsed: boolean = false
    navCollapsedMob: boolean = false
    windowWidth: number = 0
    form: undefined
    isSubmit: boolean
    modoEdicion: boolean = false
    idiomasSub?: Subscription
    idiomas: PTLIdioma[] = []
    idioma: PTLIdioma = new PTLIdioma()
    tipoEditorTexto = 'basica'
    suscPlataforma: string = ''

    selectedFile: File | null = null
    previewUrl: string | ArrayBuffer | null = null
    fileName: string | null = null
    selectedFileUrl: string | null = null
    lockScreenSubscription: Subscription | undefined
    isLocked: boolean = false
    isModImagen: boolean = false
    lockMessage: string = ''
    flagOriginal: string = ''
    flagIdioma: string = ''
    // constructor
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _registrosService: PtlidiomasService,
        private _logActividadesService: PtllogActividadesService,
        private _swalAlertService: SwalAlertService,
        private _navigationService: NavigationService,
        private _uploadService: UploadFilesService,
        private _localStorageService: LocalStorageService,
        private _swalService: SwalAlertService
    ) {
        this.isSubmit = false
        GradientConfig.header_fixed_layout = true
        this.gradientConfig = GradientConfig
        this.navCollapsed = this.windowWidth >= 992 ? GradientConfig.isCollapse_menu : false
        this.suscPlataforma = this._localStorageService.getSuscriptorPlataformaLocalStorage()
        this.navCollapsedMob = false
        const regId = this._localStorageService.getObject<string>('regId') || 'nuevo'
        console.log('***************caargar el registro', regId)
        if (regId != 'nuevo') {
            this.modoEdicion = true
            this._registrosService.getRegistroById(regId).subscribe({
                next: (resp: any) => {
                    console.log('***************registro', resp)
                    this.idioma = resp.idioma
                    this.FormRegistro = this.idioma
                    this.flagOriginal = this.idioma.flagIdioma || ''
                    this.flagIdioma = this.idioma.flagIdioma || ''
                    this.selectedFileUrl = this.idioma.flagIdioma || ''
                    this.selectedFileUrl = this._uploadService.getFilePath(this.suscPlataforma, 'idiomas', this.idioma.flagIdioma || '')
                },
                error: err => {
                    this._swalAlertService.getAlertError('No se pudo obtener el slider por ' + err)
                }
            })
        } else {
            this.modoEdicion = false
        }
    }

    ngOnInit() {
        this._navigationService.getNavigationItems()
        this.menuItems = this._navigationService.menuItems$
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
            this.FormRegistro.codigoIdioma = uuidv4()
            this.FormRegistro.flagIdioma = 'no-image.png'
            console.log('FormRegistro loading', this.FormRegistro)
        }
    }

    onFileSelectedClick(event: any) {
        const file: File = event.target.files[0]
        const objUpload = {
            susc: this.suscPlataforma,
            tipo: 'idiomas',
            id: '0'
        }
        if (file) {
            const reader = new FileReader()
            reader.onload = (e: any) => {
                this.selectedFileUrl = e.target.result
            }
            reader.readAsDataURL(file)
            this._uploadService.uploadUserPhoto(file, objUpload).subscribe({
                next: (path: any) => {
                    console.log('resultado', path.nombreArchivo)
                    this.FormRegistro.flagIdioma = path.nombreArchivo
                    this.flagIdioma = path.nombreArchivo
                    this.isModImagen = true
                },
                error: () => {
                    this._swalService.getAlertError(this.translate.instant('PLATAFORMA.UPLOADPHOTOERROR'))
                }
            })
        } else {
            this.selectedFileUrl = null
            this.flagIdioma = ''
        }
    }

    btnGestionarRegistroClick(form: any) {
        // this.isSubmit = true;
        const registroData = form.value as PTLIdioma
        if (this.modoEdicion) {
            registroData.flagIdioma = this.flagOriginal != this.flagIdioma ? this.flagIdioma : this.flagOriginal
            registroData.codigoUsuarioCreacion = this.FormRegistro.codigoUsuarioCreacion
            registroData.fechaCreacion = this.FormRegistro.fechaCreacion
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaModificacion = new Date().toISOString()
            console.log('contenido de regData', registroData)
            this._registrosService.putModificarRegistro(registroData).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        console.log('resp', resp)
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('APLICACIONES.UPDATESUCCSESSFULLY')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        if (this.flagOriginal != this.flagIdioma) {
                            console.log('flagOriginal', this.flagOriginal)
                            console.log('flagIdioma', this.flagIdioma)
                            const objUpload = {
                                susc: this.suscPlataforma,
                                tipo: 'idiomas',
                                file: this.flagOriginal
                            }
                            console.log('borrar imagen', objUpload)
                            this._uploadService.deleteFilePath(objUpload).subscribe(() => console.log('imagen eliminada correctamente'))
                        }
                        this._swalService.getAlertSuccess(this.translate.instant('IDIOMAS.CREATESUCCSESSFULLY'))
                        form.resetForm()
                        // this.isSubmit = false;
                        this.router.navigate(['/utilidades/idiomas'])
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
                    const objUpload = {
                        susc: this.suscPlataforma,
                        tipo: 'idiomas',
                        folto: this.flagIdioma
                    }
                    this._uploadService.deleteFilePath(objUpload).subscribe(() => console.log('imagen eliminada correctamente'))
                    this._swalService.getAlertError('No se pudo actualizar la Aplicación')
                }
            })
        } else {
            console.log('flag idioma', this.flagIdioma)
            registroData.codigoIdioma = uuidv4()
            registroData.flagIdioma = this.flagIdioma
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaCreacion = new Date().toISOString()
            console.log('registroData', registroData)
            this._registrosService.postCrearRegistro(registroData).subscribe({
                next: (resp: any) => {
                    console.log('resp', resp)
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('IDIOMAS.CREATESUCCESSFULLY')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalService.getAlertSuccess(this.translate.instant('IDIOMAS.UPDATESUCCESSFULLY'))
                        form.resetForm()
                        // this.isSubmit = false;
                        this.router.navigate(['/utilidades/idiomas'])
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '500',
                        descripcionLog: this.translate.instant('IDIOMAS.ELIMINAREXITOSA')
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    const objUpload = {
                        susc: this.suscPlataforma,
                        tipo: 'idiomas',
                        file: this.flagIdioma
                    }
                    console.log('borrar imagen', objUpload)
                    this._uploadService.deleteFilePath(objUpload).subscribe(() => console.log('imagen eliminada correctamente'))
                    this._swalService.getAlertError('No se pudo crear la Aplicación')
                }
            })
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/utilidades/idiomas'])
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
