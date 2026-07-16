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

import { Widget } from 'src/app/theme/shared/_helpers/models/tablero-control/widget.model'
import { WidgetsService } from 'src/app/theme/shared/service/tablero-control/widgets.service'
import { LocalStorageService, PtllogActividadesService, UploadFilesService } from 'src/app/theme/shared/service'
import { VideoPlayerComponent } from 'src/app/theme/shared/components/video-player/video-player.component'

import Swal from 'sweetalert2'

@Component({
    selector: 'app-widgets-panel',
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
    templateUrl: './widgets-panel.component.html',
    styleUrl: './widgets-panel.component.scss'
})
export class WidgetsPanelComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>()
    widgetssTransformados$: Observable<Widget[]> = of([])
    wodgetssFiltradas$: Observable<Widget[]> = of([])
    widgets: Widget[] = []
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
        private _widgetsService: WidgetsService,
        private _uploadService: UploadFilesService
    ) {
        this.gradientConfig = GradientConfig
        this.suscriptor = 'torre-control'
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems();
        this.menuItems$ = this._navigationService.menuItems$;
        this.hasFiltersSlot = true;

        // Dejamos listo el canal de escucha (las tuberías)
        this.setupWidgetsStream();

        // 🟢 CORRECCIÓN: Llamamos a cargarWidgets(), que hace el HTTP y actualiza el BehaviorSubject
        this.subscriptions.add(
            this._widgetsService.cargarWidgets().subscribe({
                next: () => console.log('✅ Widgets cargados y transmitidos exitosamente'),
                error: (err) => console.error('❌ Error al cargar widgets:', err)
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
        if (imageExts.includes(extension)) return 'capture'
        return 'desconocido'
    }

    setupWidgetsStream(): void {
        this.widgetssTransformados$ = this._widgetsService.widgets$.pipe(
            switchMap((wdgts: Widget[]) => {
                if (!wdgts) return of([])
                const transformedApps = wdgts.map((wdgt: any) => {
                    console.log('&&&&&&& datos del widget', wdgt);

                    wdgt.nomEstado = wdgt.activo ? 'Activo' : 'Inactivo'
                    wdgt.capture = this._uploadService.getFilePath(this.suscriptor, 'widgets', wdgt.thumbnail_url)
                    wdgt.imagen = this._uploadService.getFilePath(this.suscriptor, 'widgets', wdgt.thumbnail_url)
                    wdgt.tipo = 'capture'
                    console.log('wdgt captura', wdgt.capture)
                    return wdgt as Widget
                })
                this.widgets = transformedApps
                console.log('****** todos los widgets', this.widgets)
                return of(transformedApps)
            }),
            catchError(err => {
                console.error('Error en el stream de widgets:', err)
                return of([])
            })
        )

        this.wodgetssFiltradas$ = combineLatest([
            this.widgetssTransformados$.pipe(startWith([])), // Usa la fuente de datos transformada
            this.filtroCodigoSubject,
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([wdgts, codigo, nombre, descripcion, estado]) => {
                let filteredApps = wdgts

                if (codigo !== 'todos') {
                    filteredApps = filteredApps.filter(app => app.codigo_widget === codigo)
                }

                if (nombre !== 'todos') {
                    filteredApps = filteredApps.filter(app => app.nombre === nombre)
                }

                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true'
                    filteredApps = filteredApps.filter(app => app.activo === estadoBoolean)
                }

                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase()
                    filteredApps = filteredApps.filter(app => (app.descripcion || '').toLowerCase().includes(textoFiltro))
                }
                console.log('**************data de las widgets', filteredApps)

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
            name: 'imagen',
            header: 'WIDGETS.FOTO',
            type: 'image',
            isSortable: false
        },
        {
            name: 'codigo_widget',
            header: 'WIDGETS.CODE',
            type: 'text'
        },
        {
            name: 'nombre',
            header: 'WIDGETS.NAME',
            type: 'text'
        },
        {
            name: 'nomEstado',
            header: 'WIDGETS.STATUS',
            type: 'estado'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'descripcion',
            header: 'WIDGETS.DESCRIPTION',
            type: 'text'
        },
        {
            name: 'capture',
            header: 'WIDGETS.IMAGENINICIO',
            type: 'capture'
        }
    ]

    OnNuevaWidgetClick(): void {
        this._localStorageService.setObject('regId', 'nuevo')
        this.router.navigate(['tablero-control/gestion-widget'])
    }

    OnEditarWidgetClick(id: string): void {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['tablero-control/gestion-widget'])
    }

    OnEliminarWidgetClick(id: string): void {
        console.log('id aplicacion', id)
        Swal.fire({
            title: this.translate.instant('WIDGETS.ELIMINARTITULO'),
            text: this.translate.instant('WIDGETS.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then(result => {
            if (result.isConfirmed) {
                this._widgetsService.deleteWidget(id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('WIDGETS.ELIMINAREXITOSA')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire(this.translate.instant('WIDGETS.ELIMINAREXITOSA'), resp.mensaje, 'success')
                        this.setupWidgetsStream()
                    },
                    error: () => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('WIDGETS.ELIMINARERROR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire('Error', this.translate.instant('WIDGETS.ELIMINARERROR'), 'error')
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


// {
//     id: 'viales-clusters',
//     type: 'circle',
//     source: 'alertas-viales-source',
//     filter: ['has', 'point_count'],
//     paint: {
//         'circle-color': '#ef4444',
//         'circle-radius': 15,
//         'circle-stroke-width': 2,
//         'circle-stroke-color': '#ffffff'
//     }
// },
// // 2. Segundo el Texto (Debe ir después para que no quede tapado)
// {
//     id: 'viales-cluster-count',
//     type: 'symbol',
//     source: 'alertas-viales-source',
//     filter: ['has', 'point_count'],
//     layout: {
//         // Usamos una expresión para convertir el número a string de forma segura
//         'text-field': ['to-string', ['get', 'point_count']],
//         'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
//         'text-size': 12,
//         'text-allow-overlap': true
//     },
//     paint: {
//         'text-color': '#ffffff'
//     }
// },
// // 3. Puntos individuales
// {
//     id: 'viales-individual',
//     type: 'circle',
//     source: 'alertas-viales-source',
//     filter: ['!', ['has', 'point_count']],
//     paint: {
//         'circle-color': ['case', ['==', ['get', 'afectaPeaje'], true], '#b91c1c', '#ef4444'],
//         'circle-radius': 6,
//         'circle-stroke-width': 2,
//         'circle-stroke-color': '#fee2e2'
//     }
// },




//             private suscribirseADatos() {
//     this.subs.add(this._mapaService.gemeloDigital$.subscribe(data => {
//         if (!data) return;
//         if (data.CAPA_INFRAESTRUCTURA) this.actualizarFuente('infra-source', this.procesarInfraestructuraWkt(data.CAPA_INFRAESTRUCTURA));
//         if (data.CAPA_TERRESTRE) this.actualizarFuente('terrestre-source', data.CAPA_TERRESTRE);
//         if (data.CAPA_CLIMA) this.actualizarFuente('clima-source', data.CAPA_CLIMA);
//         if (data.CAPA_VIAS) this.actualizarFuente('vias-source', data.CAPA_VIAS);
//     }));

//     this.subs.add(this._mapaService.naves$.subscribe(data => { if (data) this.actualizarFuente('naves-source', data); }));

//     // Aquí ya estamos llamando a procesarRelacionIncidentePeaje()
//     this.subs.add(this._mapaService.accidentes$.subscribe(data => {
//         this.ultimosIncidentes = data;
//         this.procesarRelacionIncidentePeaje();
//     }));

//     // 🟢 AJUSTE AQUÍ: Mapear la visibilidad de los clusters
//     this.subs.add(this._mapaService.visibilidad$.subscribe(vis => {
//         if (!this.map || !this.map.isStyleLoaded()) return;

//         const mapping = [
//             { id: 'vias-layer', visible: vis['vias'] },
//             { id: 'naves-layer', visible: vis['naves'] },
//             { id: 'capa-infra-fill', visible: vis['infra'] },
//             { id: 'capa-infra-line', visible: vis['infra'] },
//             { id: 'capa-infra-point', visible: vis['infra'] },
//             { id: 'terrestre-clusters', visible: vis['terrestre'] },
//             { id: 'terrestre-cluster-count', visible: vis['terrestre'] },
//             { id: 'terrestre-individual', visible: vis['terrestre'] },
//             { id: 'clima-layer', visible: vis['clima'] },
//             // 🟢 AJUSTE: Mapear las 3 capas nuevas de los clusters de accidentes
//             { id: 'viales-clusters', visible: vis['accidentes'] },
//             { id: 'viales-cluster-count', visible: vis['accidentes'] },
//             { id: 'viales-individual', visible: vis['accidentes'] },
//             { id: 'puerto-fill', visible: vis['infra'] },
//             { id: 'puerto-line', visible: vis['infra'] },
//             { id: 'peajes-layer', visible: vis['peajes'] !== false },
//             { id: 'geocercas-layer', visible: vis['peajes'] !== false },
//             { id: 'geocercas-line-layer', visible: vis['peajes'] !== false }
//         ];

//         mapping.forEach(m => {
//             if (this.map.getLayer(m.id)) {
//                 this.map.setLayoutProperty(m.id, 'visibility', m.visible ? 'visible' : 'none');
//             }
//         });
//     }));
// }
