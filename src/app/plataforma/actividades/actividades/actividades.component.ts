/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DataTablesModule } from 'angular-datatables'
import { Router } from '@angular/router'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Observable, Subscription, of, BehaviorSubject, combineLatest } from 'rxjs' // Importación de BehaviorSubject y combineLatest
import { catchError, map, startWith, switchMap } from 'rxjs/operators'
import { GradientConfig } from 'src/app/app-config'

import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { NavBarComponent } from '../../../theme/layout/admin/nav-bar/nav-bar.component'
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component'
import { PtlActividadesService } from 'src/app/theme/shared/service/ptlactividades.service'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model'
import {
    LocalStorageService,
    PtlAplicacionesService,
    PtllogActividadesService,
    PtlmodulosApService,
    PtlSuitesAPService
} from 'src/app/theme/shared/service'
import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import Swal from 'sweetalert2'
import { PTLActividadModel } from 'src/app/theme/shared/_helpers/models/PTLActividades.model'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model'
import { PTLModuloAP } from 'src/app/theme/shared/_helpers/models/PTLModuloAP.model'

@Component({
    selector: 'app-actividades',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
    templateUrl: './actividades.component.html',
    styleUrl: './actividades.component.scss'
})
export class ActividadesComponent implements OnInit, OnDestroy {
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
    filtroCodigoAplicacionSubject = new BehaviorSubject<string>('todos')
    filtroCodigoSuiteSubject = new BehaviorSubject<string>('todos')
    filtroCodigoModuloSubject = new BehaviorSubject<string>('todos')
    filtroActividadSubject = new BehaviorSubject<string>('')
    filtroDescripcionSubject = new BehaviorSubject<string>('')
    filtroEstadoSubject = new BehaviorSubject<string>('')

    actividadesTransformadas$: Observable<PTLActividadModel[]> = of([])
    actividadesFiltradas$: Observable<PTLActividadModel[]> = of([])
    actividades: PTLActividadModel[] = []
    aplicaciones: PTLAplicacionModel[] = []
    suites: PTLSuiteAPModel[] = []
    modulos: PTLModuloAP[] = []

    colorOpcion1 = '#28a745'
    letraOpcion1 = 'R'

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _aplicacionesService: PtlAplicacionesService,
        private _suitesService: PtlSuitesAPService,
        private _modulosService: PtlmodulosApService,
        private _logActividadesService: PtllogActividadesService,
        private _localStorageService: LocalStorageService,
        private _actividadesService: PtlActividadesService
    ) {
        this.gradientConfig = GradientConfig
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        this.hasFiltersSlot = true
        this.consultarAplicaciones()
        this.consultarSuites()
        this.consultarModulos()
        setTimeout(() => {
            this.setupActividadesStream()
        }, 500)
        this.subscriptions.add(
            this._actividadesService.cargarRegistros().subscribe(
                () => console.log('Actividades cargadas y guardadas en el servicio'),
                err => console.error('Error al cargar actividades:', err)
            )
        )
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe()
    }

    consultarAplicaciones() {
        this.subscriptions.add(
            this._aplicacionesService.cargarAplicaciones().subscribe((resp: any) => {
                if (resp.length >= 0) {
                    this.aplicaciones = resp
                    console.log('Todos las aplicaciones', this.aplicaciones)
                    return
                }
            })
        )
    }

    consultarSuites() {
        this.subscriptions.add(
            this._suitesService.cargarRegistros().subscribe((resp: any) => {
                if (resp.length >= 0) {
                    this.suites = resp
                    console.log('Todos las suites', this.suites)
                    return
                }
            })
        )
    }

    consultarModulos() {
        this.subscriptions.add(
            this._modulosService.cargarRegistros().subscribe((resp: any) => {
                if (resp.length >= 0) {
                    this.modulos = resp.filter((mod: PTLModuloAP) => mod.codigoPadre !== '0')
                    console.log('************todos los modulos hijos', this.modulos)
                    return
                }
            })
        )
    }

    setupActividadesStream(): void {
        this.actividadesTransformadas$ = this._actividadesService.actividades$.pipe(
            switchMap((acts: PTLActividadModel[]) => {
                if (!acts) return of([])
                const transformedActs = acts.map((act: any) => {
                    act.nomEstado = act.estadoActividad ? 'Activo' : 'Inactivo'
                    act.nomAplicacion = this.aplicaciones.find(app => app.codigoAplicacion === act.codigoAplicacion)?.nombreAplicacion || ''
                    act.nomSuite = this.suites.find(suite => suite.codigoSuite === act.codigoSuite)?.nombreSuite || ''
                    act.nomModulo = this.modulos.find(mod => mod.codigoModulo === act.codigoModulo)?.nombreModulo || ''
                    return act as PTLActividadModel
                })
                this.actividades = transformedActs
                return of(transformedActs)
            }),
            catchError(err => {
                console.error('Error en el stream de actividades:', err)
                return of([])
            })
        )

        this.actividadesFiltradas$ = combineLatest([
            this.actividadesTransformadas$.pipe(startWith([])),
            this.filtroCodigoAplicacionSubject,
            this.filtroCodigoSuiteSubject,
            this.filtroCodigoModuloSubject,
            this.filtroActividadSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([acts, codigoAplicacion, codigoSuite, codigoModulo, descripcion, estado]) => {
                let filteredActs = acts
                if (codigoAplicacion !== 'todos') {
                    filteredActs = filteredActs.filter(act => act.codigoAplicacion === codigoAplicacion)
                }

                if (codigoSuite !== 'todos') {
                    filteredActs = filteredActs.filter(act => act.codigoSuite === codigoSuite)
                }

                if (codigoModulo !== 'todos') {
                    filteredActs = filteredActs.filter(act => act.codigoModulo === codigoModulo)
                }

                if (estado) {
                    const estadoBoolean = estado === 'true'
                    filteredActs = filteredActs.filter(act => act.estadoActividad === estadoBoolean)
                }

                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase()
                    filteredActs = filteredActs.filter(act => (act.descripcion || '').toLowerCase().includes(textoFiltro))
                }
                return filteredActs
            })
        )
    }

    onFiltroCodigoAplicacionChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroCodigoAplicacionSubject.next(value)
    }

    onFiltroCodigoSuiteChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroCodigoSuiteSubject.next(value)
    }

    onFiltroCodigoModuloChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroCodigoModuloSubject.next(value)
    }

    onFiltroNombreChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroCodigoSuiteSubject.next(value)
    }

    onFiltroDescripcionChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroCodigoModuloSubject.next(value)
    }

    onFiltroEstadoChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroEstadoSubject.next(value)
    }

    columnasAplicaciopnes: ColumnMetadata[] = [
        {
            name: 'actividad',
            header: 'ACTIVIDADES.ACTIVIDAD',
            type: 'text'
        },
        {
            name: 'nomModulo',
            header: 'ACTIVIDADES.NOMMODULO',
            type: 'text'
        },
        {
            name: 'nomSuite',
            header: 'ACTIVIDADES.NOMSUITE',
            type: 'text'
        },
        {
            name: 'nomAplicacion',
            header: 'ACTIVIDADES.NOMAPLICACION',
            type: 'text',
            isSortable: false
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'codigoActividad',
            header: 'ACTIVIDADES.CODIGOACTIVIDAD',
            type: 'text'
        },
        {
            name: 'nomEstado',
            header: 'ACTIVIDADES.NOMESTADO',
            type: 'text'
        },
        {
            name: 'descripcion',
            header: 'ACTIVIDADES.DESCRIPCION',
            type: 'text'
        }
    ]

    OnNuevoRegistroClick(): void {
        this._localStorageService.setObject('regId', 'nuevo')
        this.router.navigate(['actividades/gestion-actividad'])
    }

    OnEditarRegistroClick(id: string): void {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['actividades/gestion-actividad'])
    }

    OnEliminarRegistroClick(id: string): void {
        console.log('id aplicacion', id)
        Swal.fire({
            title: this.translate.instant('ACTIVIDADES.ELIMINARTITULO'),
            text: this.translate.instant('ACTIVIDADES.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then(result => {
            if (result.isConfirmed) {
                this._actividadesService.deleteEliminarRegistro(id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('ACTIVIDADES.ELIMINAREXITOSA')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire(this.translate.instant('ACTIVIDADES.ELIMINAREXITOSA'), resp.mensaje, 'success')
                        // Nota: Aquí el servicio PtlAplicacionesService debería emitir el nuevo listado actualizado
                        // Asumiendo que el servicio hace esto, el stream se actualizará automáticamente.
                    },
                    error: () => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('ACTIVIDADES.ELIMINARERROR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire('Error', this.translate.instant('ACTIVIDADES.ELIMINARERROR'), 'error')
                    }
                })
            }
        })
    }

    OnViewRegistroClick(id: any) {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['actividades/gestion-actividad'])
    }

    OnOption1Click(id: any) {
        console.log('ejecutando opcion 1 Seguimientos', event)
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['actividades/gestion-actividad'])
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
