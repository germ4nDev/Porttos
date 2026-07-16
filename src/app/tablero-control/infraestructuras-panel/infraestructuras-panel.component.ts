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

import { Infraestructura } from 'src/app/theme/shared/_helpers/models/tablero-control/infraestructura.model'
import { InfraestructuraPortuariaService } from 'src/app/theme/shared/service/tablero-control/infraestructura-portuaria.service'
import { TerminalesService } from 'src/app/theme/shared/service/tablero-control/terminales.service';
import { LocalStorageService, PtllogActividadesService, UploadFilesService } from 'src/app/theme/shared/service'
import { VideoPlayerComponent } from 'src/app/theme/shared/components/video-player/video-player.component'

import Swal from 'sweetalert2'
import { Terminal } from 'src/app/theme/shared/_helpers/models/tablero-control/terminal.model';

@Component({
    selector: 'app-infraestructuras-panel',
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
    templateUrl: './infraestructuras-panel.component.html',
    styleUrl: './infraestructuras-panel.component.scss'
})
export class InfraestructurasPanelComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>()
    infraestructurasTransformados$: Observable<Infraestructura[]> = of([])
    infraestructurasFiltradas$: Observable<Infraestructura[]> = of([])
    infraestructuras: Infraestructura[] = []
    DataModel: BaseSessionModel = new BaseSessionModel()
    DataLogActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()
    terminales: Terminal[] = []

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
        private _infraestructurasService: InfraestructuraPortuariaService,
        private _terminalesService: TerminalesService,
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
        this.setupInfraestructurasStream();
        this.terminales = this._terminalesService.getTerminalsActuales();
        console.log('todos los terminales', this.terminales);

        // 🟢 CORRECCIÓN: Llamamos a cargarInfraestructuras(), que hace el HTTP y actualiza el BehaviorSubject
        this.subscriptions.add(
            this._infraestructurasService.cargarInfraestructuras().subscribe({
                next: () => console.log('✅ Infraestructuras cargados y transmitidos exitosamente'),
                error: (err) => console.error('❌ Error al cargar infraestructuras:', err)
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

    setupInfraestructurasStream(): void {
        this.infraestructurasTransformados$ = this._infraestructurasService.infraestructuras$.pipe(
            switchMap((infrs: Infraestructura[]) => {
                if (!infrs) return of([])
                const transformedApps = infrs.map((infr: any) => {
                    infr.terminal = this.terminales.filter(x => x.id_terminal == infr.id_terminal)[0].id_terminal
                    return infr as Infraestructura
                })
                this.infraestructuras = transformedApps
                console.log('****** todos los infraestructuras', this.infraestructuras)
                return of(transformedApps)
            }),
            catchError(err => {
                console.error('Error en el stream de infraestructuras:', err)
                return of([])
            })
        )

        this.infraestructurasFiltradas$ = combineLatest([
            this.infraestructurasTransformados$.pipe(startWith([])), // Usa la fuente de datos transformada
            this.filtroCodigoSubject,
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([infrs, codigo, nombre, descripcion, estado]) => {
                let filteredApps = infrs

                if (nombre !== 'todos') {
                    filteredApps = filteredApps.filter(app => app.nombre === nombre)
                }

                console.log('**************data de las infraestructuras', filteredApps)

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
            name: 'terminal',
            header: 'INFRAESTRUCTURAS.TERMINAL',
            type: 'text'
        },
        {
            name: 'tipo',
            header: 'INFRAESTRUCTURAS.TIPO',
            type: 'text'
        },
        {
            name: 'nombre',
            header: 'INFRAESTRUCTURAS.NAME',
            type: 'text'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'latitud',
            header: 'INFRAESTRUCTURAS.LATITUD',
            type: 'text'
        },
        {
            name: 'longitud',
            header: 'INFRAESTRUCTURAS.LONGITUD',
            type: 'text'
        }
    ]

    OnNuevaAplicaicionClick(): void {
        this._localStorageService.setObject('regId', 'nuevo')
        this.router.navigate(['tablero-control/gestion-widget'])
    }

    OnEditarAplicaicionClick(id: string): void {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['tablero-control/gestion-widget'])
    }

    OnEliminarAplicaicionClick(id: string): void {
        console.log('id aplicacion', id)
        Swal.fire({
            title: this.translate.instant('INFRAESTRUCTURAS.ELIMINARTITULO'),
            text: this.translate.instant('INFRAESTRUCTURAS.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then(result => {
            if (result.isConfirmed) {
                this._infraestructurasService.deleteInfraestructura(id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('INFRAESTRUCTURAS.ELIMINAREXITOSA')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire(this.translate.instant('INFRAESTRUCTURAS.ELIMINAREXITOSA'), resp.mensaje, 'success')
                        this.setupInfraestructurasStream()
                    },
                    error: () => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('INFRAESTRUCTURAS.ELIMINARERROR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire('Error', this.translate.instant('INFRAESTRUCTURAS.ELIMINARERROR'), 'error')
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
