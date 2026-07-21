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
import { FarosService } from 'src/app/theme/shared/service/tablero-control/faros.service'
import { MapaSelectorComponent } from 'src/app/theme/shared/components/tablero-control/mapa-selector/mapa-selector.component'
import { FaroModel } from 'src/app/theme/shared/_helpers/models/tablero-control/faro.model'
import { ColorSelectorComponent } from 'src/app/theme/shared/components/color-selector/color-selector.component'

@Component({
    selector: 'app-gestion-faro-panel',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent, MapaSelectorComponent, ColorSelectorComponent],
    templateUrl: './gestion-faro-panel.component.html',
    styleUrl: './gestion-faro-panel.component.scss'
})
export class GestionFaroPanelComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: FaroModel = new FaroModel()
    faro: FaroModel = new FaroModel()
    logActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()
    menuItems$!: Observable<NavigationItem[]>
    faros: FaroModel[] = [];
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
        private _farosService: FarosService,
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
            console.log('id FaroModel', regId);
            this._farosService.getFaroById(regId).subscribe({
                next: (resp: any) => {
                    console.log('data FaroModel', resp.data);
                    this.faro = resp.data
                    this.FormRegistro.geocerca_geo = resp.data.geocerca_geo
                    this.FormRegistro = resp.data
                    console.log('data registro', this.FormRegistro);
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo obtener el FaroModel', 'error')
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
        this.faros = this._farosService.getFarosActuales();
        console.log('Inicial formregistro', this.FormRegistro)
        console.log('data del log', this.logActividad)
    }

    onVerificarNombre(event: any) {
        const nombreBuscado = event.target.value.trim().toUpperCase();

        if (!nombreBuscado) {
            this.nombreDuplicado = false; // Si borra todo, quitamos el error
            return;
        }

        const existe = this.faros.some(faro =>
            faro.nombre_faro?.trim().toLowerCase() === nombreBuscado
        );

        // 👇 Actualizamos el estado para la vista
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

    actualizarMapa(data: { ubicacion_geo: any, geocerca_geo: any }) {
        this.FormRegistro.geocerca_geo = data.geocerca_geo;
    }

    OnColorSelectedClick(evento: any) {
        console.log('evento', evento);
        this.FormRegistro.color_ui = evento.color;
    }

    actualizarGeocerca(data: any) {
        console.log("📥 [Padre] Datos recibidos del mapa:", data);
        if (data && data.type === 'FeatureCollection') {
            this.FormRegistro.geocerca_geo = data;
            console.log("✅ [Padre] Geocerca asignada correctamente.");
        } else {
            console.error("❌ [Padre] El dato recibido no es una FeatureCollection válida:", data);
        }
    }

    btnGestionarRegistroClick(form: any) {
        const payload = { ...this.FormRegistro };
        payload.geocerca_geo = this.FormRegistro.geocerca_geo ? this.FormRegistro.geocerca_geo : this.faro.geocerca_geo
        payload.geocerca_geo = this.FormRegistro.geocerca_geo?.geocerca ? {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: this.FormRegistro.geocerca_geo.geocerca,
                properties: {}
            }]
        } : null;
        payload.usuario_cargue = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
        payload.fecha_cargue = new Date().toISOString();
        console.log('payload', payload);
        if (this.modoEdicion) {
            this._farosService.updateFaro(payload).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        console.log('MODIFICAdo FaroModel', resp.data);
                        form.resetForm()
                        this._swalService.getAlertSuccess(this.translate.instant('MUELLES.CREATESUCCSESSFULLY'))
                        this.router.navigate(['/tablero-control/faros-panel'])
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
                    this._swalService.getAlertError('No se pudo actualizar el faro')
                }
            })
        } else {
            console.log('CREAR FaroModel', payload);
            this._farosService.saveFaro(payload).subscribe({
                next: (resp: any) => {
                    console.log('resp', resp)
                    if (resp.ok) {
                        form.resetForm()
                        this._swalService.getAlertSuccess(this.translate.instant('MUELLES.UPDATESUCCSESSFULLY'))
                        this.router.navigate(['/tablero-control/faros-panel'])
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
                    this._swalService.getAlertError('No se pudo crear el FaroModel')
                }
            })
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/tablero-control/faros-panel'])
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

