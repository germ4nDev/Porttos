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
import { PuertosService } from 'src/app/theme/shared/service/tablero-control/puertos.service'
import { Puerto } from 'src/app/theme/shared/_helpers/models/tablero-control/puerto.model'
import { MapaSelectorComponent } from 'src/app/theme/shared/components/tablero-control/mapa-selector/mapa-selector.component'

// import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model';
// import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model';

@Component({
    selector: 'app-gestion-aplicacion',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent, MapaSelectorComponent],
    templateUrl: './gestion-pueerto-panel.component.html',
    styleUrl: './gestion-pueerto-panel.component.scss'
})
export class GestionPueertoPanelComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: Puerto = new Puerto()
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
            this._puertosService.getPuertoByCode(regId).subscribe({
                next: (resp: any) => {
                    console.log('data puerto', resp);
                    this.FormRegistro = resp
                    // this.selectedFileUrl = this._uploadService.getFilePath(this.suscriptor, 'widgets', resp.aplicacion.imagenInicio)
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo obtener el puerto', 'error')
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
            // this.FormRegistro.thumbnail_url = 'no-image.png'
            console.log('FormRegistro loading', this.FormRegistro)
        }
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

    // manejarCambioGeografico(event: any) {
    //     if (event.modo === 'punto') {
    //         // Actualizamos solo el punto
    //         this.FormRegistro.latitud_central = event.coordenadas.lat;
    //         this.FormRegistro.longitud_central = event.coordenadas.lon;
    //     }
    //     else if (event.modo === 'bbox') {
    //         // Actualizamos los 4 límites del BBOX
    //         const coords = event.coordenadas;
    //         this.FormRegistro.bbox_lat_sur = coords.bbox_lat_sur;
    //         this.FormRegistro.bbox_lon_oeste = coords.bbox_lon_oeste;
    //         this.FormRegistro.bbox_lat_norte = coords.bbox_lat_norte;
    //         this.FormRegistro.bbox_lon_este = coords.bbox_lon_este;
    //     }
    // }

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

        // Verificación de seguridad:
        // Si 'data' es el formulario completo, algo anda muy mal en la comunicación.
        // Si 'data' es la FeatureCollection, entonces la asignación es correcta.
        if (data && data.type === 'FeatureCollection') {
            this.FormRegistro.geocerca_geo = data;
            console.log("✅ [Padre] Geocerca asignada correctamente.");
        } else {
            console.error("❌ [Padre] El dato recibido no es una FeatureCollection válida:", data);
        }
    }

    // btnGestionarRegistroClick(form: any) {
    //     // 1. Auditoría QPLUS
    //     this.FormRegistro.usuario_cargue = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
    //     this.FormRegistro.fecha_cargue = new Date().toISOString();

    //     // 2. Ejecutar Guardado
    //     // Como 'FormRegistro' ya contiene los objetos GeoJSON (ubicacion y geocerca),
    //     // solo enviamos el objeto completo al servicio.
    //     this._puertosService.savePuerto(this.FormRegistro).subscribe({
    //         next: (resp: any) => {
    //             if (resp.ok) {
    //                 this._swalService.getAlertSuccess(this.translate.instant('PUERTOS.UPDATESUCCSESSFULLY'));
    //                 this.router.navigate(['/tablero-control/puertos-panel']);
    //             }
    //         },
    //         error: (err: any) => {
    //             console.error(err);
    //             this._swalService.getAlertError('No se pudo guardar el puerto');
    //         }
    //     });
    // }

    btnGestionarRegistroClick(form: any) {
        const payload = { ...this.FormRegistro };

        // 2. Extraemos la geometría real de las propiedades anidadas
        // (Ajustamos la estructura a lo que espera el DTO del backend)
        payload.ubicacion_geo = this.FormRegistro.ubicacion_geo?.ubicacion ? {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [this.FormRegistro.ubicacion_geo.ubicacion.lon, this.FormRegistro.ubicacion_geo.ubicacion.lat]
                },
                properties: {}
            }]
        } : null;

        payload.geocerca_geo = this.FormRegistro.geocerca_geo?.geocerca ? {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: this.FormRegistro.geocerca_geo.geocerca,
                properties: {}
            }]
        } : null;

        // 3. Auditoría QPLUS
        payload.usuario_cargue = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
        payload.fecha_cargue = new Date().toISOString();

        if (this.modoEdicion) {
            console.log('MODIFICAR PUERTO', payload);
            this._puertosService.savePuerto(payload).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PUERTOS.CREATESUCCSESSFULLY')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalService.getAlertSuccess(this.translate.instant('PUERTOS.CREATESUCCSESSFULLY'))
                        form.resetForm()
                        // this.isSubmit = false;
                        this.router.navigate(['/torre-control/puertos-panel'])
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('PUERTOS.CREATESUCCSESSFULLY')
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalService.getAlertError('No se pudo actualizar el puertto')
                }
            })
        } else {
            console.log('CREAR PUERTO', payload);
            this._puertosService.savePuerto(payload).subscribe({
                next: (resp: any) => {
                    console.log('resp', resp)
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PUERTOS.ELIMINAREXITOSA')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalService.getAlertSuccess(this.translate.instant('PUERTOS.UPDATESUCCSESSFULLY'))
                        form.resetForm()
                        // this.isSubmit = false;
                        this.router.navigate(['/torre-control/puertos-panel'])
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '500',
                        descripcionLog: this.translate.instant('PUERTOS.ELIMINAREXITOSA')
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalService.getAlertError('No se pudo crear el puerto')
                }
            })
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/tablero-control/puertos-panel'])
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
