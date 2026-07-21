/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { GradientConfig } from 'src/app/app-config'
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import {
    LocalStorageService,
    PtllogActividadesService,
    SwalAlertService,
    UploadFilesService
} from 'src/app/theme/shared/service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { Observable, Subscription } from 'rxjs'
import Swal from 'sweetalert2'
import { MapaSelectorComponent } from 'src/app/theme/shared/components/tablero-control/mapa-selector/mapa-selector.component'
import { ColorSelectorComponent } from 'src/app/theme/shared/components/color-selector/color-selector.component'
import { TipoInfraestructura } from 'src/app/theme/shared/_helpers/models/tablero-control/tipo-infraestructura.model'
import { TiposTipoInfraestructuraService } from 'src/app/theme/shared/service/tablero-control/tipos-infraestructura.service'

@Component({
    selector: 'app-gestion-faro-panel',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent, MapaSelectorComponent, ColorSelectorComponent],
    templateUrl: './gestion-tipo-infraestructura.component.html',
    styleUrl: './gestion-tipo-infraestructura.component.scss'
})
export class GestionTipoInfraestructuraComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: TipoInfraestructura = new TipoInfraestructura()
    tipoInfraestructura: TipoInfraestructura = new TipoInfraestructura()
    logActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()
    menuItems$!: Observable<NavigationItem[]>
    tiposInfra: TipoInfraestructura[] = [];
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
    tipoEditorTexto = 'basica'
    lockScreenSubscription: Subscription | undefined
    isLocked: boolean = false
    lockMessage: string = ''
    suscriptor: string = ''
    modoMapa: 'punto' | 'bbox' = 'punto';
    public codigo_tipoDuplicado: boolean = false;
    public nombreDuplicado: boolean = false;
    textoColor: string = 'id_color'

    ETIPOS_FARO = [
        { id: 'PEAJE', label: 'Peaje', color: '#22c55e' },
        { id: 'PUNTO_CONTROL', label: 'Punto de Control', color: '#facc15' },
        { id: 'ZONA_TERRESTRE', label: 'Zona Terrestre', color: '#f59e0b' },
        { id: 'ZONA_MARITIMA', label: 'Zona Marítima', color: '#dc2626' }
    ];

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _localStorageService: LocalStorageService,
        private _logActividadesService: PtllogActividadesService,
        private _tiposInfraService: TiposTipoInfraestructuraService,
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
            console.log('id TipoInfraestructura', regId);
            this._tiposInfraService.getTipoInfraestructuraByCode(regId).subscribe({
                next: (resp: any) => {
                    console.log('data TipoInfraestructura', resp.data);
                    this.tipoInfraestructura = resp.data
                    this.FormRegistro = resp.data
                    console.log('data registro', this.FormRegistro);
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo obtener el TipoInfraestructura', 'error')
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
        console.log('--------- modoEdicion', this.modoEdicion)
        if (this.modoEdicion == false) {
            // this.FormRegistro.id_interno = '';
            // this.FormRegistro.id_terminal = '';
            console.log('FormRegistro loading', this.FormRegistro)
        }
        this.tiposInfra = this._tiposInfraService.getTipoInfraestructurasActuales();
    }

    onVerificarTipo(event: any) {
        const tipoBuscado = event.target.value.trim().toUpperCase();

        if (!tipoBuscado) {
            this.codigo_tipoDuplicado = false;
            return;
        }

        const existe = this.tiposInfra.some(faro =>
            faro.codigo_tipo?.trim().toLowerCase() === tipoBuscado
        );

        this.codigo_tipoDuplicado = existe;
    }

    onVerificarNombre(event: any) {
        const nombreBuscado = event.target.value.trim().toUpperCase();

        if (!nombreBuscado) {
            this.nombreDuplicado = false;
            return;
        }

        const existe = this.tiposInfra.some(faro =>
            faro.nombre?.trim().toLowerCase() === nombreBuscado
        );

        this.nombreDuplicado = existe;
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
                    // this.FormRegistro.thumbnail_url = resp.fileName
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

    OnColorSelectedClick(evento: any) {
        console.log('evento', evento);
        this.FormRegistro.color_ui = evento.color;
    }

    btnGestionarRegistroClick(form: any) {
        const payload = { ...this.FormRegistro };
        payload.usuario_cargue = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
        payload.fecha_cargue = new Date().toISOString();
        console.log('payload', payload);
        if (this.modoEdicion) {
            this._tiposInfraService.updateTipoInfraestructura(payload).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        console.log('MODIFICAdo TipoInfraestructura', resp.data);
                        form.resetForm()
                        this._swalService.getAlertSuccess(this.translate.instant('MUELLES.CREATESUCCSESSFULLY'))
                        this.router.navigate(['/tablero-control/tipos-infraestructura-panel'])
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('MUELLES.CREATESUCCSESSFULLY')
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalService.getAlertError('No se pudo actualizar el TipoInfraestructura')
                }
            })
        } else {
            console.log('CREAR TipoInfraestructura', payload);
            this._tiposInfraService.saveTipoInfraestructura(payload).subscribe({
                next: (resp: any) => {
                    console.log('resp', resp)
                    if (resp.ok) {
                        form.resetForm()
                        this._swalService.getAlertSuccess(this.translate.instant('MUELLES.UPDATESUCCSESSFULLY'))
                        this.router.navigate(['/tablero-control/tipos-infraestructura-panel'])
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '500',
                        descripcionLog: this.translate.instant('MUELLES.ELIMINAREXITOSA')
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalService.getAlertError('No se pudo crear el TipoInfraestructura')
                }
            })
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/tablero-control/tipos-infraestructura-panel'])
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

