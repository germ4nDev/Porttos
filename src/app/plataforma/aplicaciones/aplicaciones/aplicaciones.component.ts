/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DataTablesModule } from 'angular-datatables'
import { Router } from '@angular/router'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Observable, Subscription, of, BehaviorSubject, combineLatest } from 'rxjs' // Importación de BehaviorSubject y combineLatest
import { catchError, map, startWith, switchMap } from 'rxjs/operators'
import { GradientConfig } from 'src/app/app-config'

import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { NavBarComponent } from '../../../theme/layout/admin/nav-bar/nav-bar.component'
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component'
import { PtlAplicacionesService } from 'src/app/theme/shared/service/ptlaplicaciones.service'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'

import Swal from 'sweetalert2'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model'
import { LocalStorageService, PtllogActividadesService, UploadFilesService } from 'src/app/theme/shared/service'
import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { VideoPlayerComponent } from 'src/app/theme/shared/components/video-player/video-player.component'
import { DataLoaderComponent } from 'src/app/theme/shared/components/data-loader/data-loader.component'
import { ExcelUploaderComponent } from 'src/app/theme/shared/components/excel-loader/excel-loader.component'

@Component({
    selector: 'app-aplicaciones',
    standalone: true,
    imports: [
        CommonModule,
        DataTablesModule,
        SharedModule,
        TranslateModule,
        NavBarComponent,
        NavContentComponent,
        DatatableComponent,
        DataLoaderComponent,
        ExcelUploaderComponent
    ],
    templateUrl: './aplicaciones.component.html',
    styleUrl: './aplicaciones.component.scss'
})
export class AplicacionesComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>()
    aplicacionesTransformadas$: Observable<PTLAplicacionModel[]> = of([])
    aplicacionesFiltradas$: Observable<PTLAplicacionModel[]> = of([])
    aplicaciones: PTLAplicacionModel[] = []

    DataModel: BaseSessionModel = new BaseSessionModel()
    DataLogActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()
    moduloTituloExcel: string = ''
    gradientConfig
    lang = localStorage.getItem('lang')
    menuItems$!: Observable<NavigationItem[]>
    hasFiltersSlot: boolean = false
    activeTab: 'menu' | 'filters' | 'main' = 'menu'
    subscriptions = new Subscription()
    filtroCodigoSubject = new BehaviorSubject<string>('todos')
    filtroNombreSubject = new BehaviorSubject<string>('todos')
    filtroDescripcionSubject = new BehaviorSubject<string>('')
    filtroEstadoSubject = new BehaviorSubject<string>('todos')
    suscriptor: string = ''
    tipoMedia: string = ''
    video: string = ''
    urlSubidaUsuarios: string = ''

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _logActividadesService: PtllogActividadesService,
        private _localStorageService: LocalStorageService,
        private _aplicacionesService: PtlAplicacionesService,
        private _uploadService: UploadFilesService
    ) {
        this.gradientConfig = GradientConfig
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        this.hasFiltersSlot = true
        this.setupAplicacionesStream()
        this.subscriptions.add(
            this._aplicacionesService.cargarAplicaciones().subscribe(
                () => console.log('Aplicaciones cargadas y guardadas en el servicio'),
                err => console.error('Error al cargar aplicaciones:', err)
            )
        )
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe()
    }

    getFileType(url: string): 'capture' | 'video' | 'documento' | 'desconocido' {
        if (!url) return 'desconocido'

        const cleanUrl = url.split(/[#?]/)[0]
        const extension = cleanUrl.split('.').pop()?.toLowerCase() || ''

        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp']
        const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv']
        const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']

        if (imageExts.includes(extension)) return 'capture'
        if (videoExts.includes(extension)) return 'video'
        if (docExts.includes(extension)) return 'documento'

        return 'desconocido'
    }

    setupAplicacionesStream(): void {
        // const suscriptor = this._localStorageService.getSuscriptorLocalStorage() ? this._localStorageService.getSuscriptorLocalStorage()  : {};
        // if (!suscriptor || !suscriptor.codigoSuscriptor) {
        //   console.error('Error: No se pudo obtener el suscriptor o su código. Operación de carga de registros abortada.');
        //   return;
        // }
        this.aplicacionesTransformadas$ = this._aplicacionesService.aplicaciones$.pipe(
            switchMap((apps: PTLAplicacionModel[]) => {
                if (!apps) return of([])
                const transformedApps = apps.map((app: any) => {
                    app.nomEstado = app.estadoAplicacion ? 'Activo' : 'Inactivo'
                    this.tipoMedia = this.getFileType(this._uploadService.getFilePath(this.suscriptor, 'aplicaciones', app.imagenInicio))
                    if (this.tipoMedia == 'video') {
                        app.capture = this._uploadService.getFilePath(this.suscriptor, 'aplicaciones', app.imagenInicio)
                        app.imagenInicio = this._uploadService.getFilePath(this.suscriptor, 'galeria', 'video_pyr.png')
                        app.tipo = 'video'
                        console.log('app captura', app.capture)
                    } else if (this.tipoMedia == 'capture') {
                        app.capture = this._uploadService.getFilePath(this.suscriptor, 'aplicaciones', app.imagenInicio)
                        app.imagenInicio = this._uploadService.getFilePath(this.suscriptor, 'aplicaciones', app.imagenInicio)
                        app.tipo = 'capture'
                        console.log('app captura', app.capture)
                    }
                    console.log('tipo media', this.tipoMedia)
                    return app as PTLAplicacionModel
                })
                this.aplicaciones = transformedApps
                console.log('todas las aplicaciones', this.aplicaciones)
                return of(transformedApps)
            }),
            catchError(err => {
                console.error('Error en el stream de aplicaciones:', err)
                return of([])
            })
        )

        this.aplicacionesFiltradas$ = combineLatest([
            this.aplicacionesTransformadas$.pipe(startWith([])), // Usa la fuente de datos transformada
            this.filtroCodigoSubject,
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([apps, codigo, nombre, descripcion, estado]) => {
                let filteredApps = apps

                if (codigo !== 'todos') {
                    filteredApps = filteredApps.filter(app => app.codigoAplicacion === codigo)
                }

                if (nombre !== 'todos') {
                    filteredApps = filteredApps.filter(app => app.nombreAplicacion === nombre)
                }

                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true'
                    filteredApps = filteredApps.filter(app => app.estadoAplicacion === estadoBoolean)
                }

                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase()
                    filteredApps = filteredApps.filter(app => (app.descripcionAplicacion || '').toLowerCase().includes(textoFiltro))
                }
                console.log('**************data de las aplicaciones', filteredApps)

                return filteredApps
            })
        )
    }

    onFiltroCodigoChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroCodigoSubject.next(value)
    }

    onFiltroNombreChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroNombreSubject.next(value)
    }

    onFiltroDescripcionChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroDescripcionSubject.next(value)
    }

    onFiltroEstadoChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroEstadoSubject.next(value)
    }

    columnasAplicaciopnes: ColumnMetadata[] = [
        {
            name: 'imagenInicio',
            header: 'APLICACIONES.FOTO',
            type: 'image',
            isSortable: false
        },
        {
            name: 'codigoAplicacion',
            header: 'APLICACIONES.CODE',
            type: 'text'
        },
        {
            name: 'nombreAplicacion',
            header: 'APLICACIONES.NAME',
            type: 'text'
        },
        {
            name: 'nomEstado',
            header: 'APLICACIONES.STATUS',
            type: 'estado'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'descripcionAplicacion',
            header: 'APLICACIONES.DESCRIPTION',
            type: 'text'
        },
        {
            name: 'capture',
            header: 'APLICACIONES.IMAGENINICIO',
            type: 'capture'
        }
    ]

    OnNuevaAplicaicionClick(): void {
        this._localStorageService.setObject('regId', 'nuevo')
        this.router.navigate(['aplicaciones/gestion-aplicacion'])
    }

    OnEditarAplicaicionClick(id: string): void {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['aplicaciones/gestion-aplicacion'])
    }

    OnEliminarAplicaicionClick(id: string): void {
        console.log('id aplicacion', id)
        Swal.fire({
            title: this.translate.instant('APLICACIONES.ELIMINARTITULO'),
            text: this.translate.instant('APLICACIONES.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then(result => {
            if (result.isConfirmed) {
                this._aplicacionesService.eliminarAplicacion(id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('APLICACIONES.ELIMINAREXITOSA')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire(this.translate.instant('APLICACIONES.ELIMINAREXITOSA'), resp.mensaje, 'success')
                        this.setupAplicacionesStream()
                    },
                    error: () => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('APLICACIONES.ELIMINARERROR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire('Error', this.translate.instant('APLICACIONES.ELIMINARERROR'), 'error')
                    }
                })
            }
        })
    }

    mapeoColumnasExcel = {
        'Cédula': 'identificacionUsuario',
        'Nombres Completos': 'nombreUsuario',
        'Correo Electrónico': 'emailUsuario',
        'Clave Temporal': 'claveUsuario'
    };

    datosAdicionales = {
        estadoUsuario: true,
        usuarioCreacion: 'admin-sistema'
    };

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
