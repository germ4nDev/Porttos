/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { GradientConfig } from 'src/app/app-config'

// project import
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { LocalStorageService, PtlSlidersInicioService, SwalAlertService, UploadFilesService } from 'src/app/theme/shared/service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { PTLSliderInicioModel } from 'src/app/theme/shared/_helpers/models/PTLSliderInicio.model'
import { LayoutInitializerService } from 'src/app/theme/shared/service/layout-initializer.service'
import { Observable, Subscription } from 'rxjs'

@Component({
    selector: 'app-gestion-slider',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-slider.component.html',
    styleUrl: './gestion-slider.component.scss'
})
export class GestionSliderComponent implements OnInit {
    // private props
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: PTLSliderInicioModel = new PTLSliderInicioModel()
    menuItems!: Observable<NavigationItem[]>
    gradientConfig: any
    navCollapsed: boolean = false
    navCollapsedMob: boolean = false
    windowWidth: number = 0
    form: undefined
    isSubmit: boolean
    sliderId: string = ''
    modoEdicion: boolean = false
    slidersInicioSub?: Subscription
    slidersInicio: PTLSliderInicioModel[] = []
    tipoEditorTexto = 'basica'
    suscPlataforma: string = ''

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
        private _registrosService: PtlSlidersInicioService,
        private _layoutInitializer: LayoutInitializerService,
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
        this.sliderId = this._localStorageService.getObject<string>('regId') || 'nuevo'
        if (this.sliderId != 'nuevo') {
            this.modoEdicion = true
            this._registrosService.getRegistroById(this.sliderId).subscribe({
                next: (resp: any) => {
                    this.selectedFileUrl = this.FormRegistro = resp.sliderInicio
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
        this._layoutInitializer.applyLayout()
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
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcionSlider = nuevoContenido
        console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionSlider)
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    onFileSelectedClick(event: any) {
        const file: File = event.target.files[0]
        const objUpload = {
            susc: this.suscPlataforma,
            tipo: 'sliders',
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
                    console.log('resultado', path)
                    this.FormRegistro.urlSlider = path.nombreArchivo
                },
                error: () => {
                    this._swalService.getAlertError(this.translate.instant('PLATAFORMA.UPLOADPHOTOERROR'))
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
        if (this.modoEdicion) {
            this._registrosService.putModificarRegistro(this.FormRegistro, this.sliderId).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.MODIFICAR'))
                        this.router.navigate(['/utilidades/slider-inicio'])
                    } else {
                        this._swalAlertService.getAlertError(resp.message || this.translate.instant('PLATAFORMA.NOMODIFICO'))
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOMODIFICO'))
                }
            })
        } else {
            this._registrosService.postCrearRegistro(this.FormRegistro).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.INSERTAR'))
                        form.resetForm()
                        this.isSubmit = false
                        this.router.navigate(['/utilidades/slider-inicio'])
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOINSERTO'))
                }
            })
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/utilidades/slider-inicio'])
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
