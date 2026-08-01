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
import { Infraestructura } from 'src/app/theme/shared/_helpers/models/tablero-control/infraestructura.model'
import { InfraestructuraPortuariaService } from 'src/app/theme/shared/service/tablero-control/infraestructura-portuaria.service'
import { TiposTipoInfraestructuraService } from 'src/app/theme/shared/service/tablero-control/tipos-infraestructura.service'
import { TipoInfraestructura } from 'src/app/theme/shared/_helpers/models/tablero-control/tipo-infraestructura.model'

@Component({
    selector: 'app-gestion-faro-panel',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent, MapaSelectorComponent, ColorSelectorComponent],
    templateUrl: './gestion-infraestructura.component.html',
    styleUrl: './gestion-infraestructura.component.scss'
})
export class GestionInfraestructuraComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: Infraestructura = new Infraestructura()
    infraestructura: Infraestructura = new Infraestructura()
    logActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()
    menuItems$!: Observable<NavigationItem[]>
    infra: Infraestructura[] = [];
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
    public terminalDuplicado: boolean = false;
    textoColor: string = 'id_color'

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _localStorageService: LocalStorageService,
        private _logActividadesService: PtllogActividadesService,
        private _infraestructuraService: InfraestructuraPortuariaService,
        private _tiposInfraestructuraService: TiposTipoInfraestructuraService,
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
            console.log('id Infraestructura', regId);
            this._infraestructuraService.getInfraestructuraByCode(Number(regId)).subscribe({
                next: (resp: any) => {
                    console.log('data Infraestructura', resp.data);
                    this.infraestructura = resp.data
                    this.FormRegistro = resp.data
                    const data = this.tiposInfra.filter(x => x.id_tipo == resp.data.id_tipo)[0];
                    this.FormRegistro.tipo = data.nombre
                    this.FormRegistro.ubicacion_geo = resp.data.ubicacion_geo
                    this.FormRegistro.geocerca_geo = resp.data.geocerca_geo
                    this.selectedFileUrl = this._uploadService.getFilePath(this.suscriptor, 'puertos', resp.data.imagen_url)
                    console.log('data registro', this.FormRegistro);
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo obtener el Infraestructura', 'error')
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
        this.tiposInfra = this._tiposInfraestructuraService.getTipoInfraestructurasActuales();
        this.infra = this._infraestructuraService.getInfraestructurasActuales();
        if (form != undefined) {
            this.FormRegistro = form
            this._localStorageService.removeFormRegistro()
        }
        console.log('--------- modoEdicion', this.modoEdicion)
        if (this.modoEdicion == false) {
            this.FormRegistro.tipo = '';
            // this.FormRegistro.id_terminal = '';
            console.log('FormRegistro loading', this.FormRegistro)
        }
    }

    onVerificarTerminal(event: any) {
        const terminalDuplicado = event.target.value.trim().toUpperCase();

        if (!terminalDuplicado) {
            this.nombreDuplicado = false;
            return;
        }

        const existe = this.infra.some(faro =>
            faro.id_terminal?.trim().toLowerCase() === terminalDuplicado
        );

        this.nombreDuplicado = existe;
    }

    onVerificarNombre(event: any) {
        const nombreBuscado = event.target.value.trim().toUpperCase();

        if (!nombreBuscado) {
            this.nombreDuplicado = false;
            return;
        }

        const existe = this.infra.some(faro =>
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

    actualizarMapa(data: { ubicacion_geo: any, geocerca_geo: any }) {
        this.FormRegistro.ubicacion_geo = data.ubicacion_geo;
        this.FormRegistro.geocerca_geo = data.geocerca_geo;
    }

    actualizarUbicacion(data: any) {
        console.log("📍 [Padre] Ubicación recibida del mapa:", data);

        // Verificación de seguridad
        if (data && data.type === 'FeatureCollection') {
            this.FormRegistro.ubicacion_geo = data;
            console.log("✅ [Padre] Ubicación asignada correctamente.");
        } else {
            console.error("❌ [Padre] El dato de ubicación no es válido:", data);
        }
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
        payload.ubicacion_geo = this.FormRegistro.ubicacion_geo ? this.FormRegistro.ubicacion_geo : this.infraestructura.ubicacion_geo
        payload.geocerca_geo = this.FormRegistro.geocerca_geo ? this.FormRegistro.geocerca_geo : this.infraestructura.geocerca_geo
        payload.usuario_cargue = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
        payload.fecha_cargue = new Date().toISOString();
        const data = this.tiposInfra.filter(x => x.id_tipo == this.FormRegistro.id_tipo)[0];
        this.FormRegistro.tipo = data.nombre

        console.log('payload', payload);
        if (this.modoEdicion) {
            this._infraestructuraService.updateInfraestructura(payload).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        console.log('MODIFICAdo Infraestructura', resp.data);
                        form.resetForm()
                        this._swalService.getAlertSuccess(this.translate.instant('MUELLES.CREATESUCCSESSFULLY'))
                        this.router.navigate(['/tablero-control/infraestructuras-panel'])
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
                    this._swalService.getAlertError('No se pudo actualizar el Infraestructura')
                }
            })
        } else {
            console.log('CREAR Infraestructura', payload);
            this._infraestructuraService.saveInfraestructura(payload).subscribe({
                next: (resp: any) => {
                    console.log('resp', resp)
                    if (resp.ok) {
                        form.resetForm()
                        this._swalService.getAlertSuccess(this.translate.instant('MUELLES.UPDATESUCCSESSFULLY'))
                        this.router.navigate(['/tablero-control/infraestructuras-panel'])
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
                    this._swalService.getAlertError('No se pudo crear el Infraestructura')
                }
            })
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/tablero-control/infraestructuras-panel'])
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


