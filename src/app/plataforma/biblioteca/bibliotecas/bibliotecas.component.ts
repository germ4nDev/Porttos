/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DataTablesModule } from 'angular-datatables'
import { Router } from '@angular/router'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Observable, Subscription, of, BehaviorSubject, combineLatest } from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'
import { GradientConfig } from 'src/app/app-config'

import { PTLBiblioteca } from 'src/app/theme/shared/_helpers/models/PTLBiblioteca.model'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { NavBarComponent } from '../../../theme/layout/admin/nav-bar/nav-bar.component'
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component'
import { PtlBibliotecasService } from 'src/app/theme/shared/service/ptlbibliotecas.service'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'

import Swal from 'sweetalert2'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model'
import { LocalStorageService, PtllogActividadesService, UploadFilesService } from 'src/app/theme/shared/service'
import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'

@Component({
    selector: 'app-biblioteca',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
    templateUrl: './bibliotecas.component.html',
    styleUrl: './bibliotecas.component.scss'
})
export class BibliotecasComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>()
    DataModel: BaseSessionModel = new BaseSessionModel()
    DataLogActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()
    moduloTituloExcel: string = ''
    hasFiltersSlot: boolean = false
    gradientConfig
    lang = localStorage.getItem('lang')
    menuItems$!: Observable<NavigationItem[]>
    activeTab: 'menu' | 'filters' | 'main' = 'menu'

    subscriptions = new Subscription()
    filtroCodigoSubject = new BehaviorSubject<string>('todos')
    filtroNombreSubject = new BehaviorSubject<string>('todos')
    filtroDescripcionSubject = new BehaviorSubject<string>('')
    filtroEstadoSubject = new BehaviorSubject<string>('todos')

    bibliotecaTransformada$: Observable<PTLBiblioteca[]> = of([])
    bibliotecaFiltrada$: Observable<PTLBiblioteca[]> = of([])
    bibliotecas: PTLBiblioteca[] = []
    suscriptor = ''
    colorOpcion1 = '#27ad15'
    letraOpcion1 = 'G'

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _logActividadesService: PtllogActividadesService,
        private _localStorageService: LocalStorageService,
        private _bibliotecaService: PtlBibliotecasService,
        private _uploadService: UploadFilesService
    ) {
        this.gradientConfig = GradientConfig
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
    }

    cargarDatos(): void {
        this.subscriptions.add(
            this._bibliotecaService.cargarBibliotecas().subscribe(
                () => console.log('Datos de Tipos de Galería actualizados'),
                err => console.error('Error al cargar Tipos de Galería:', err)
            )
        )
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        this.hasFiltersSlot = true
        this.setupBibliotecaStream()
        this.cargarDatos()
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe()
    }

    setupBibliotecaStream(): void {
        this.bibliotecaTransformada$ = this._bibliotecaService.biblioteca$.pipe(
            switchMap((libs: PTLBiblioteca[]) => {
                if (!libs) return of([])
                const transformed = libs.map((lib: any) => {
                    lib.nomEstado = lib.estadoBiblioteca ? 'Activo' : 'Inactivo'
                    lib.capture = this._uploadService.getFilePath(this.suscriptor, 'biblioteca', lib.imagenBiblioteca)
                    lib.tipo = 'capture'
                    return lib as PTLBiblioteca
                })
                this.bibliotecas = transformed
                return of(transformed)
            }),
            catchError(err => {
                console.error('Error en el stream de biblioteca:', err)
                return of([])
            })
        )

        this.bibliotecaFiltrada$ = combineLatest([
            this.bibliotecaTransformada$.pipe(startWith([])),
            this.filtroCodigoSubject,
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([libs, codigo, nombre, descripcion, estado]) => {
                let filtered = libs

                if (codigo !== 'todos') {
                    filtered = filtered.filter(lib => lib.codigoBiblioteca === codigo)
                }
                if (nombre !== 'todos') {
                    filtered = filtered.filter(lib => lib.nombreBiblioteca === nombre)
                }
                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true'
                    filtered = filtered.filter(lib => lib.estadoBiblioteca === estadoBoolean)
                }
                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase()
                    filtered = filtered.filter(lib => (lib.descripcionBiblioteca || '').toLowerCase().includes(textoFiltro))
                }
                return filtered
            })
        )
    }

    onFiltroCodigoChangeClick(evento: any): void {
        this.filtroCodigoSubject.next(evento.target.value)
    }
    onFiltroNombreChangeClick(evento: any): void {
        this.filtroNombreSubject.next(evento.target.value)
    }
    onFiltroDescripcionChangeClick(evento: any): void {
        this.filtroDescripcionSubject.next(evento.target.value)
    }
    onFiltroEstadoChangeClick(evento: any): void {
        this.filtroEstadoSubject.next(evento.target.value)
    }

    columnasBiblioteca: ColumnMetadata[] = [
        {
            name: 'capture',
            header: 'BIBLIOTECA.FOTO',
            type: 'image',
            isSortable: false
        },
        { name: 'nombreBiblioteca', header: 'BIBLIOTECA.NAME', type: 'text' },
        { name: 'nomEstado', header: 'BIBLIOTECA.STATUS', type: 'estado' }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        { name: 'codigoAplicacion', header: 'BIBLIOTECA.APLICACION', type: 'text' },
        { name: 'descripcionBiblioteca', header: 'BIBLIOTECA.DESCRIPTION', type: 'text' },
        {
            name: 'capture',
            header: 'BIBLIOTECA.IMAGENINICIO',
            type: 'capture'
        }
    ]

    OnNuevaBibliotecaClick(): void {
        this._localStorageService.setObject('regId', 'nuevo')
        this.router.navigate(['biblioteca/gestion-biblioteca'])
    }

    OnEditarBibliotecaClick(id: string): void {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['biblioteca/gestion-biblioteca'])
    }

    OnOption1Click(id: any) {
        this._localStorageService.setObject('regId', id);
        this.router.navigate(['biblioteca/galeria'])
    }

    OnEliminarBibliotecaClick(id: string): void {
        Swal.fire({
            title: this.translate.instant('BIBLIOTECA.ELIMINARTITULO'),
            text: this.translate.instant('BIBLIOTECA.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then(result => {
            if (result.isConfirmed) {
                this._bibliotecaService.eliminarBiblioteca(id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('BIBLIOTECA.ELIMINAREXITOSA')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire(this.translate.instant('BIBLIOTECA.ELIMINAREXITOSA'), resp.mensaje, 'success')
                        this.cargarDatos()
                    },
                    error: () => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('BIBLIOTECA.ELIMINARERROR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire('Error', this.translate.instant('BIBLIOTECA.ELIMINARERROR'), 'error')
                    }
                })
            }
        })
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
