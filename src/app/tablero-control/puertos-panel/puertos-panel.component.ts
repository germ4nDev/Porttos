import { escape } from './../../../../../ClaudeAPI2.0/node_modules/parse5/node_modules/entities/src/escape';
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
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { DataLoaderComponent } from 'src/app/theme/shared/components/data-loader/data-loader.component'
import { ExcelUploaderComponent } from 'src/app/theme/shared/components/excel-loader/excel-loader.component'
import { NavBarComponent } from '../../theme/layout/admin/nav-bar/nav-bar.component';
import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model'

import { Puerto } from 'src/app/theme/shared/_helpers/models/tablero-control/puerto.model'
import { PuertosService } from 'src/app/theme/shared/service/tablero-control/puertos.service'
import { LocalStorageService, PtllogActividadesService, UploadFilesService } from 'src/app/theme/shared/service'
import { VideoPlayerComponent } from 'src/app/theme/shared/components/video-player/video-player.component'

import Swal from 'sweetalert2'

@Component({
    selector: 'app-puertos-panel',
    standalone: true,
    imports: [
        CommonModule,
        DataTablesModule,
        SharedModule,
        TranslateModule,
        NavContentComponent,
        DatatableComponent,
        DataLoaderComponent,
        ExcelUploaderComponent,
        NavBarComponent
    ],
    templateUrl: './puertos-panel.component.html',
    styleUrl: './puertos-panel.component.scss'
})
export class PuertosPanelComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>()
    puertosTransformados$: Observable<Puerto[]> = of([])
    puertosFiltradas$: Observable<Puerto[]> = of([])
    puertos: Puerto[] = []
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
        private _puertosService: PuertosService,
        private _uploadService: UploadFilesService
    ) {
        this.gradientConfig = GradientConfig
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems();
        this.menuItems$ = this._navigationService.menuItems$;
        this.hasFiltersSlot = true;

        // Dejamos listo el canal de escucha (las tuberías)
        this.setupPuertosStream();

        // 🟢 CORRECCIÓN: Llamamos a cargarPuertos(), que hace el HTTP y actualiza el BehaviorSubject
        this.subscriptions.add(
            this._puertosService.cargarPuertos().subscribe({
                next: () => console.log('✅ Puertos cargados y transmitidos exitosamente'),
                error: (err) => console.error('❌ Error al cargar puertos:', err)
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe()
    }

    getFileType(url: string): 'capture' | 'video' | 'documento' | 'desconocido' {
        if (!url) return 'desconocido'

        const cleanUrl = url.split(/[#?]/)[0]
        const extension = cleanUrl.split('.').pop()?.toLowerCase() || ''

        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp']
        // const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv']
        // const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']

        if (imageExts.includes(extension)) return 'capture'
        // if (videoExts.includes(extension)) return 'video'
        // if (docExts.includes(extension)) return 'documento'

        return 'desconocido'
    }

    setupPuertosStream(): void {
        this.puertosTransformados$ = this._puertosService.puertos$.pipe(
            switchMap((puets: Puerto[]) => {
                if (!puets) return of([])
                const transformedApps = puets.map((pts: any) => {
                    pts.nomEstado = pts.estado ? 'Activo' : 'Inactivo'
                    console.log('pts captura', pts.capture)
                    return pts as Puerto
                })
                this.puertos = transformedApps
                console.log('****** todos los puertos', this.puertos)
                return of(transformedApps)
            }),
            catchError(err => {
                console.error('Error en el stream de puertos:', err)
                return of([])
            })
        )

        this.puertosFiltradas$ = combineLatest([
            this.puertosTransformados$.pipe(startWith([])), // Usa la fuente de datos transformada
            this.filtroCodigoSubject,
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([puets, codigo, nombre, descripcion, estado]) => {
                let filteredApps = puets

                if (codigo !== 'todos') {
                    filteredApps = filteredApps.filter(app => app.id_puerto === codigo)
                }

                if (nombre !== 'todos') {
                    filteredApps = filteredApps.filter(app => app.nombre === nombre)
                }

                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true'
                    filteredApps = filteredApps.filter(app => app.estado === estadoBoolean)
                }

                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase()
                    filteredApps = filteredApps.filter(app => (app.descripcion || '').toLowerCase().includes(textoFiltro))
                }
                console.log('**************data de las puertos', filteredApps)

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
            name: 'id_puerto',
            header: 'PUERTOS.ID',
            type: 'text'
        },
        {
            name: 'nombre',
            header: 'PUERTOS.NAME',
            type: 'text'
        },
        {
            name: 'region',
            header: 'PUERTOS.REGION',
            type: 'text'
        },
        {
            name: 'nomEstado',
            header: 'PUERTOS.STATUS',
            type: 'estado'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'url_fuente_scraping',
            header: 'PUERTOS.DESCRIPTION',
            type: 'text'
        },
        {
            name: 'bbox_lat_sur',
            header: 'PUERTOS.BBOX_SUR',
            type: 'capture'
        },
        {
            name: 'bbox_lon_oeste',
            header: 'PUERTOS.BBOX_OESTE',
            type: 'capture'
        },
        {
            name: 'bbox_lat_norte',
            header: 'PUERTOS.BBOX_NORTE',
            type: 'capture'
        },
        {
            name: 'bbox_lon_este',
            header: 'PUERTOS.BBOX_ESTE',
            type: 'capture'
        }
    ]

    OnNuevaRegistroClick(): void {
        this._localStorageService.setObject('regId', 'nuevo')
        this.router.navigate(['tablero-control/gestion-puerto-panel'])
    }

    OnEditarRegistroClick(id: string): void {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['tablero-control/gestion-puerto-panel'])
    }

    OnEliminarRegistroClick(id: string): void {
        console.log('id aplicacion', id)
        Swal.fire({
            title: this.translate.instant('PUERTOS.ELIMINARTITULO'),
            text: this.translate.instant('PUERTOS.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then(result => {
            if (result.isConfirmed) {
                this._puertosService.deletePuerto(id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PUERTOS.ELIMINAREXITOSA')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire(this.translate.instant('PUERTOS.ELIMINAREXITOSA'), resp.mensaje, 'success')
                        this.setupPuertosStream()
                    },
                    error: () => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('PUERTOS.ELIMINARERROR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire('Error', this.translate.instant('PUERTOS.ELIMINARERROR'), 'error')
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
