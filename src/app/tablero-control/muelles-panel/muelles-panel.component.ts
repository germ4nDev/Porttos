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

import { Muelle } from 'src/app/theme/shared/_helpers/models/tablero-control/muelle.model'
import { MuellesService } from 'src/app/theme/shared/service/tablero-control/muelles.service'
import { LocalStorageService, PtllogActividadesService, UploadFilesService } from 'src/app/theme/shared/service'

import Swal from 'sweetalert2'
import { PuertosService } from 'src/app/theme/shared/service/tablero-control/puertos.service';
import { TerminalesService } from 'src/app/theme/shared/service/tablero-control/terminales.service';
import { Puerto } from 'src/app/theme/shared/_helpers/models/tablero-control/puerto.model';
import { Terminal } from 'src/app/theme/shared/_helpers/models/tablero-control/terminal.model';

@Component({
    selector: 'app-muelles-panel',
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
    templateUrl: './muelles-panel.component.html',
    styleUrl: './muelles-panel.component.scss'
})
export class MuellesPanelComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>()
    muellessTransformados$: Observable<Muelle[]> = of([])
    muellesFiltradas$: Observable<Muelle[]> = of([])
    muelles: Muelle[] = []
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
        private _terminalesService: TerminalesService,
        private _muellesService: MuellesService,
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
        this.terminales = this._terminalesService.getTerminalsActuales();
        console.log('todos los terminales', this.terminales);

        // Dejamos listo el canal de escucha (las tuberías)
        this.setupMuellesStream();

        // 🟢 CORRECCIÓN: Llamamos a cargarMuelles(), que hace el HTTP y actualiza el BehaviorSubject
        this.subscriptions.add(
            this._muellesService.cargarMuelles().subscribe({
                next: () => console.log('✅ Muelles cargados y transmitidos exitosamente'),
                error: (err) => console.error('❌ Error al cargar muelles:', err)
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

    setupMuellesStream(): void {
        this.muellessTransformados$ = this._muellesService.muelles$.pipe(
            switchMap((mlls: Muelle[]) => {
                if (!mlls) return of([])
                const transformedApps = mlls.map((mll: any) => {
                    mll.nomEstado = mll.estado_mantenimiento ? 'Activo' : 'Inactivo'
                    mll.terminal = this.terminales.filter(x => x.id_terminal == mll.id_terminal)[0].id_terminal
                    mll.puerto = this.terminales.filter(x => x.id_terminal == mll.id_terminal)[0].id_puerto

                    return mll as Muelle
                })
                this.muelles = transformedApps
                console.log('****** todos los muelles', this.muelles)
                return of(transformedApps)
            }),
            catchError(err => {
                console.error('Error en el stream de muelles:', err)
                return of([])
            })
        )

        this.muellesFiltradas$ = combineLatest([
            this.muellessTransformados$.pipe(startWith([])), // Usa la fuente de datos transformada
            this.filtroCodigoSubject,
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([mlls, codigo, nombre, descripcion, estado]) => {
                let filteredApps = mlls

                // if (codigo !== 'todos') {
                //     filteredApps = filteredApps.filter(app => app.codigo_widget === codigo)
                // }

                // if (nombre !== 'todos') {
                //     filteredApps = filteredApps.filter(app => app.nombre === nombre)
                // }

                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true'
                    filteredApps = filteredApps.filter(app => app.activo === estadoBoolean)
                }

                // if (descripcion) {
                //     const textoFiltro = descripcion.toLowerCase()
                //     filteredApps = filteredApps.filter(app => (app.descripcion || '').toLowerCase().includes(textoFiltro))
                // }
                console.log('**************data de las muelles', filteredApps)

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
            name: 'puerto',
            header: 'MUELLES.PUERTO',
            type: 'text'
        },
        {
            name: 'terminal',
            header: 'MUELLES.TERMINAL',
            type: 'text'
        },
        {
            name: 'codigo_muelle',
            header: 'MUELLES.CODE',
            type: 'estado'
        },
        {
            name: 'nomEstado',
            header: 'MUELLES.STATUS',
            type: 'estado'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'especialidad',
            header: 'MUELLES.ESPECIALIDAD',
            type: 'text'
        },
        {
            name: 'calado_metros',
            header: 'MUELLES.CALADO',
            type: 'text'
        },
        {
            name: 'estado_mantenimiento',
            header: 'MUELLES.ESTADO',
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
            title: this.translate.instant('MUELLES.ELIMINARTITULO'),
            text: this.translate.instant('MUELLES.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then(result => {
            if (result.isConfirmed) {
                this._muellesService.deleteMuelle(id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('MUELLES.ELIMINAREXITOSA')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire(this.translate.instant('MUELLES.ELIMINAREXITOSA'), resp.mensaje, 'success')
                        this.setupMuellesStream()
                    },
                    error: () => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('MUELLES.ELIMINARERROR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire('Error', this.translate.instant('MUELLES.ELIMINARERROR'), 'error')
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
