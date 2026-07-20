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
import Swal from 'sweetalert2'
import { TerminalesService } from 'src/app/theme/shared/service/tablero-control/terminales.service'
import { MapaSelectorComponent } from 'src/app/theme/shared/components/tablero-control/mapa-selector/mapa-selector.component'
import { Terminal } from 'src/app/theme/shared/_helpers/models/tablero-control/terminal.model'
import { Puerto } from 'src/app/theme/shared/_helpers/models/tablero-control/puerto.model'
import { PuertosService } from 'src/app/theme/shared/service/tablero-control/puertos.service'

// import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model';
// import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model';

@Component({
    selector: 'app-gestion-terminal-panel',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent, MapaSelectorComponent],
    templateUrl: './gestion-terminal-panel.component.html',
    styleUrl: './gestion-terminal-panel.component.scss'
})
export class GestionTerminalPanelComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: Terminal = new Terminal()
    terminal: Terminal = new Terminal()
    logActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()
    menuItems$!: Observable<NavigationItem[]>
    puertos: Puerto[] = [];
    gradientConfig: any
    navCollapsed: boolean = false
    navCollapsedMob: boolean = false
    windowWidth: number = 0
    selectedFile: File | null = null
    previewUrl: string | ArrayBuffer | null = null
    userPhotoUrl: string = ''
    fileName: string | null = null
    selectedFileUrl: string | null = null
    // public datosGuardados: any = null;
    form: undefined
    isSubmit: boolean = false
    modoEdicion: boolean = false
    tipoEditorTexto = 'basica'
    lockScreenSubscription: Subscription | undefined
    isLocked: boolean = false
    lockMessage: string = ''
    suscriptor: string = ''
    modoMapa: 'punto' | 'bbox' = 'punto';


    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _localStorageService: LocalStorageService,
        private _logActividadesService: PtllogActividadesService,
        private _terminalesService: TerminalesService,
        private _puertosService: PuertosService,
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
            this._terminalesService.getTerminalByCode(regId).subscribe({
                next: (resp: any) => {
                    console.log('data Terminal', resp);
                    this.terminal = resp.data
                    this.FormRegistro = resp.data
                    this.FormRegistro.geocerca_geo = resp.data.geocerca_geo
                    console.log('data registro', this.FormRegistro);
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo obtener el Terminal', 'error')
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
            // this.FormRegistro.thumbnail_url = 'no-image.png'
            this.FormRegistro.id_puerto = '';
            console.log('FormRegistro loading', this.FormRegistro)
        }
        this.puertos = this._puertosService.getPuertosActuales();
        console.log('todos los puertos', this.puertos)
        console.log('Inicial formregistro', this.FormRegistro)
        // const navSettings = this._localStorageService.getNavSettingsLocalStorage();
        console.log('data del log', this.logActividad)
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

        payload.geocerca_geo = this.FormRegistro.geocerca_geo ? this.FormRegistro.geocerca_geo : this.terminal.geocerca_geo
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

        if (this.modoEdicion) {
            console.log('MODIFICAR Terminal', payload);
            this._terminalesService.updateTerminal(payload).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        form.resetForm()
                        this._swalService.getAlertSuccess(this.translate.instant('TerminalS.CREATESUCCSESSFULLY'))
                        this.router.navigate(['/tablero-control/terminales-panel'])
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('TerminalS.CREATESUCCSESSFULLY')
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalService.getAlertError('No se pudo actualizar el puertto')
                }
            })
        } else {
            console.log('CREAR Terminal', payload);
            this._terminalesService.saveTerminal(payload).subscribe({
                next: (resp: any) => {
                    console.log('resp', resp)
                    if (resp.ok) {
                        form.resetForm()
                        this._swalService.getAlertSuccess(this.translate.instant('TerminalS.UPDATESUCCSESSFULLY'))
                        this.router.navigate(['/tablero-control/terminales-panel'])
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '500',
                        descripcionLog: this.translate.instant('TerminalS.ELIMINAREXITOSA')
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalService.getAlertError('No se pudo crear el Terminal')
                }
            })
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/tablero-control/terminales-panel'])
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
