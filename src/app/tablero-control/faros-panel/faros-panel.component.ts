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

import { FaroModel } from 'src/app/theme/shared/_helpers/models/tablero-control/faro.model';
import { FarosService } from 'src/app/theme/shared/service/tablero-control/faros.service'
import { PuertosService } from 'src/app/theme/shared/service/tablero-control/puertos.service'
import { LocalStorageService, PtllogActividadesService, UploadFilesService } from 'src/app/theme/shared/service'

import Swal from 'sweetalert2'
import { Puerto } from 'src/app/theme/shared/_helpers/models/tablero-control/puerto.model';
import { Terminal } from 'src/app/theme/shared/_helpers/models/tablero-control/terminal.model'
import { TerminalesService } from 'src/app/theme/shared/service/tablero-control/terminales.service'

@Component({
    selector: 'app-faros-panel',
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
    templateUrl: './faros-panel.component.html',
    styleUrl: './faros-panel.component.scss'
})
export class FarosPanelComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>()
    farosTransformados$: Observable<FaroModel[]> = of([])
    farosFiltradas$: Observable<FaroModel[]> = of([])
    faros: FaroModel[] = []
    DataModel: BaseSessionModel = new BaseSessionModel()
    DataLogActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()

    ETIPOS_FARO = [
        { id: 'PEAJE', label: 'Peaje', color: '#22c55e' },
        { id: 'PUNTO_CONTROL', label: 'Punto de Control', color: '#facc15' },
        { id: 'ZONA_TERRESTRE', label: 'Zona Terrestre', color: '#f59e0b' },
        { id: 'ZONA_MARITIMA', label: 'Zona Marítima', color: '#dc2626' }
    ];

    moduloTituloExcel: string = ''
    gradientConfig
    lang = localStorage.getItem('lang')
    menuItems$!: Observable<NavigationItem[]>
    hasFiltersSlot: boolean = false
    activeTab: 'menu' | 'filters' | 'main' = 'menu'
    subscriptions = new Subscription()

    filtroNombreSubject = new BehaviorSubject<string>('todos')
    filtroDescripcionSubject = new BehaviorSubject<string>('')
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
        private _farosService: FarosService,
        private _puertosService: PuertosService,
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

        this.subscriptions.add(
            this._farosService.getAllFaros().subscribe({
                next: () => console.log('✅ faros cargados y transmitidos exitosamente'),
                error: (err) => console.error('❌ Error al cargar faros:', err)
            })
        );
        this.setupfarosStream();
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

    setupfarosStream(): void {
        this.farosTransformados$ = this._farosService.faros$.pipe(
            switchMap((frs: FaroModel[]) => {
                if (!frs) return of([])
                // const transformedFaros = frs.map((fr: any) => {
                //     fr.nomEstado = fr.estado ? 'Activo' : 'Inactivo'
                //     fr.nomAlerta = fr.genera_alerta_toast ? 'Con Alerta' : 'Sin Alerta'
                //     fr.nomTipo = this.ETIPOS_FARO.filter(x => x.id == fr.tipo_faro)[0].label
                //     fr.punto = fr.ubicacion_geo.features[0].geometry.coordinates;
                //     fr.coordenadas = fr.geocerca_geo.features[0].geometry.coordinates[0];
                //     return fr as FaroModel
                // })
                const transformedFaros = frs.map((fr: any) => {
                    fr.nomEstado = fr.estado ? 'Activo' : 'Inactivo';
                    fr.nomAlerta = fr.genera_alerta_toast ? 'Con Alerta' : 'Sin Alerta';

                    // Evitar errores si this.ETIPOS_FARO no encuentra coincidencia
                    const tipoFaro = this.ETIPOS_FARO.find(x => x.id == fr.tipo_faro);
                    fr.nomTipo = tipoFaro ? tipoFaro.label : 'Desconocido';

                    // 1. Manejo seguro de ubicacion_geo (El marcador/punto central)
                    const geoUbicacion = fr.ubicacion_geo?.features?.[0]?.geometry;

                    if (geoUbicacion?.type === 'Point') {
                        fr.punto = geoUbicacion.coordinates;
                    } else if (geoUbicacion?.type === 'Polygon') {
                        // Si por error o diseño viene un polígono, puedes extraer el primer punto para usarlo como ancla del marcador
                        fr.punto = geoUbicacion.coordinates[0][0];
                    } else {
                        fr.punto = null; // Manejo por defecto si no hay geometría válida
                    }

                    // 2. Manejo seguro de geocerca_geo (El área/polígono)
                    const geoGeocerca = fr.geocerca_geo?.features?.[0]?.geometry;

                    if (geoGeocerca?.type === 'Polygon') {
                        // Extraemos el primer anillo del polígono
                        fr.coordenadas = geoGeocerca.coordinates[0];
                    } else if (geoGeocerca?.type === 'Point') {
                        // Si la geocerca es solo un punto, la asignamos sin intentar extraer sub-arreglos
                        fr.coordenadas = geoGeocerca.coordinates;
                    } else {
                        fr.coordenadas = null;
                    }

                    return fr as FaroModel;
                });
                this.faros = transformedFaros
                console.log('****** todos los faros', this.faros)
                return of(transformedFaros)
            }),
            catchError(err => {
                console.error('Error en el stream de faros:', err)
                return of([])
            })
        )

        this.farosFiltradas$ = combineLatest([
            this.farosTransformados$.pipe(startWith([])),
            this.filtroNombreSubject,
            this.filtroDescripcionSubject
        ]).pipe(
            map(([frs, nombre, descripcion]) => {
                let filteredfaros = frs

                if (nombre !== 'todos') {
                    filteredfaros = filteredfaros.filter(mll => mll.nombre_faro === nombre)
                }

                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase()
                    filteredfaros = filteredfaros.filter(mll => (mll.descripcion || '').toLowerCase().includes(textoFiltro))
                }
                console.log('**************data de las faros', filteredfaros)

                return filteredfaros
            })
        )
    }

    onFiltroNombreChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroNombreSubject.next(value)
    }

    onFiltroDescripcionChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroDescripcionSubject.next(value)
    }

    columnasAplicaciopnes: ColumnMetadata[] = [
        {
            name: 'nomTipo',
            header: 'FAROS.TIPO',
            type: 'text'
        },
        {
            name: 'nombre_faro',
            header: 'FAROS.NOMBRE',
            type: 'text'
        },
        {
            name: 'radio_metros',
            header: 'FAROS.RADIO_METROS',
            type: 'estado'
        },
        {
            name: 'nomEstado',
            header: 'FAROS.ESTADO',
            type: 'estado'
        },
        {
            name: 'color_ui',
            header: 'FAROS.COLOR',
            type: 'color_chip'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'nomAlerta',
            header: 'FAROS.ALERTA',
            type: 'text'
        },
        {
            name: 'descripcion',
            header: 'FAROS.DESCRIPTION',
            type: 'text'
        },
        {
            name: 'punto',
            header: 'FAROS.DESCRIPTION',
            type: 'array_list'
        },
        {
            name: 'coordenadas',
            header: 'FAROS.DESCRIPTION',
            type: 'array_list'
        }
    ]

    OnNuevaRegistroClick(): void {
        this._localStorageService.setObject('regId', 'nuevo')
        this.router.navigate(['tablero-control/gestion-faro-panel'])
    }

    OnEditarRegistroClick(id: string): void {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['tablero-control/gestion-faro-panel'])
    }

    OnEliminarRegistroClick(id: string): void {
        console.log('id aplicacion', id)
        Swal.fire({
            title: this.translate.instant('faros.ELIMINARTITULO'),
            text: this.translate.instant('faros.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then(result => {
            if (result.isConfirmed) {
                this._farosService.deleteFaro(id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('faros.ELIMINAREXITOSA')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire(this.translate.instant('faros.ELIMINAREXITOSA'), resp.mensaje, 'success')
                        this.setupfarosStream()
                    },
                    error: () => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('faros.ELIMINARERROR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire('Error', this.translate.instant('faros.ELIMINARERROR'), 'error')
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
