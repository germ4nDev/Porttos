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

import { Terminal } from 'src/app/theme/shared/_helpers/models/tablero-control/terminal.model'
import { TerminalesService } from 'src/app/theme/shared/service/tablero-control/terminales.service'
import { PuertosService } from 'src/app/theme/shared/service/tablero-control/puertos.service'
import { LocalStorageService, PtllogActividadesService, UploadFilesService } from 'src/app/theme/shared/service'

import Swal from 'sweetalert2'
import { Puerto } from 'src/app/theme/shared/_helpers/models/tablero-control/puerto.model';

@Component({
    selector: 'app-terminales-panel',
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
    templateUrl: './terminales-panel.component.html',
    styleUrl: './terminales-panel.component.scss'
})
export class TerminalesPanelComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>()
    terminalesTransformados$: Observable<Terminal[]> = of([])
    terminalesFiltradas$: Observable<Terminal[]> = of([])
    terminales: Terminal[] = []
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
        private _terminalesService: TerminalesService,
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
        this.puertos = this._puertosService.getPuertosActuales();
        console.log('todos los puertos', this.puertos);

        // this.cargarDataPuertos();
        // Dejamos listo el canal de escucha (las tuberías)
        this.setupTerminalsStream();

        // 🟢 CORRECCIÓN: Llamamos a cargarTerminals(), que hace el HTTP y actualiza el BehaviorSubject
        this.subscriptions.add(
            this._terminalesService.cargarTerminals().subscribe({
                next: () => console.log('✅ Terminals cargados y transmitidos exitosamente'),
                error: (err) => console.error('❌ Error al cargar terminales:', err)
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

    cargarDataPuertos() {
        this._puertosService.cargarPuertos().subscribe((data: any) => {
            // this.puertos = data;
        })
    }

    setupTerminalsStream(): void {
        this.terminalesTransformados$ = this._terminalesService.terminales$.pipe(
            switchMap((trmls: Terminal[]) => {
                if (!trmls) return of([])
                const transformedApps = trmls.map((trml: any) => {
                    trml.puerto = this.puertos.filter(x => x.id_puerto == trml.id_puerto)[0].id_puerto
                    console.log('trml captura', trml.id_puerto)
                    return trml as Terminal
                })
                this.terminales = transformedApps
                console.log('****** todos los terminales', this.terminales)
                return of(transformedApps)
            }),
            catchError(err => {
                console.error('Error en el stream de terminales:', err)
                return of([])
            })
        )

        this.terminalesFiltradas$ = combineLatest([
            this.terminalesTransformados$.pipe(startWith([])), // Usa la fuente de datos transformada
            this.filtroNombreSubject,
            this.filtroDescripcionSubject
        ]).pipe(
            map(([trmls, nombre, descripcion]) => {
                let filteredApps = trmls

                if (nombre !== 'todos') {
                    filteredApps = filteredApps.filter(app => app.nombre === nombre)
                }

                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase()
                    filteredApps = filteredApps.filter(app => (app.descripcion || '').toLowerCase().includes(textoFiltro))
                }
                console.log('**************data de las terminales', filteredApps)

                return filteredApps
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
            name: 'puerto',
            header: 'TERMINALES.CODE',
            type: 'text'
        },
        {
            name: 'nombre',
            header: 'TERMINALES.NAME',
            type: 'text'
        },
        {
            name: 'subtitulo',
            header: 'TERMINALES.SUBTITULO',
            type: 'text'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'descripcion',
            header: 'TERMINALES.DESCRIPTION',
            type: 'text'
        },
        {
            name: 'unidad_medida',
            header: 'TERMINALES.UNIDAD',
            type: 'text'
        },
        {
            name: 'capacidad_reefer',
            header: 'TERMINALES.CAPACIDAD',
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
            title: this.translate.instant('TERMINALES.ELIMINARTITULO'),
            text: this.translate.instant('TERMINALES.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then(result => {
            if (result.isConfirmed) {
                this._terminalesService.deleteTerminal(id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('TERMINALES.ELIMINAREXITOSA')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire(this.translate.instant('TERMINALES.ELIMINAREXITOSA'), resp.mensaje, 'success')
                        this.setupTerminalsStream()
                    },
                    error: () => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('TERMINALES.ELIMINARERROR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire('Error', this.translate.instant('TERMINALES.ELIMINARERROR'), 'error')
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
