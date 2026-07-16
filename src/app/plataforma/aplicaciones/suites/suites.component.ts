/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DataTablesModule } from 'angular-datatables'
import { Router } from '@angular/router'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GradientConfig } from 'src/app/app-config'

import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { NavBarComponent } from '../../../theme/layout/admin/nav-bar/nav-bar.component'
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component'
import { PtlSuitesAPService } from 'src/app/theme/shared/service/ptlsuites-ap.service'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'

import Swal from 'sweetalert2'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { PtlAplicacionesService } from 'src/app/theme/shared/service/ptlaplicaciones.service'
import { LocalStorageService } from 'src/app/theme/shared/service/local-storage.service'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { PtllogActividadesService, UploadFilesService } from 'src/app/theme/shared/service'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model'
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model'
import { Observable, Subscription, of, BehaviorSubject, combineLatest } from 'rxjs' // Importación de BehaviorSubject y combineLatest
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators'

@Component({
    selector: 'app-registros',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
    templateUrl: './suites.component.html',
    styleUrl: './suites.component.scss'
})
export class SuitesComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>()
    DataModel: BaseSessionModel = new BaseSessionModel()
    DataLogActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()
    moduloTituloExcel: string = ''
    hasFiltersSlot: boolean = false
    gradientConfig
    lang = localStorage.getItem('lang')
    menuItems$!: Observable<NavigationItem[]>
    activeTab: 'menu' | 'filters' | 'main' = 'menu'
    suscriptor: string = ''

    subscriptions = new Subscription()
    filtroAplicacionSubject = new BehaviorSubject<string>('todos')
    filtroSuiteSubject = new BehaviorSubject<string>('todos')
    filtroNombreSubject = new BehaviorSubject<string>('todos')
    filtroDescripcionSubject = new BehaviorSubject<string>('')
    filtroEstadoSubject = new BehaviorSubject<string>('todos')

    suitesTransformados$: Observable<PTLSuiteAPModel[]> = of([])
    suitesFiltrados$: Observable<PTLSuiteAPModel[]> = of([])

    aplicaciones: PTLAplicacionModel[] = []
    aplicacionesSub?: Subscription
    suitesSub?: Subscription
    suites: PTLSuiteAPModel[] = []
    filtroPersonalizado: string = ''
    registros: any
    registrosFiltrado: any

    constructor(
        private _router: Router,
        private _translate: TranslateService,
        private _navigationService: NavigationService,
        private _aplicacionesService: PtlAplicacionesService,
        private _registrosService: PtlSuitesAPService,
        private _localStorageService: LocalStorageService,
        private _logActividadesService: PtllogActividadesService,
        private _uploadService: UploadFilesService
    ) {
        this.gradientConfig = GradientConfig
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        this.hasFiltersSlot = true
        this.moduloTituloExcel = this.lang == 'es' ? 'Listado de Suitees' : 'List of Aplications'
        this.consultarAplicacines()
        // this.consultarSuitees();
        setTimeout(() => {
            this.setupRegistrosStream()
        }, 200)
        this.subscriptions.add(
            this._registrosService.cargarRegistros().subscribe(
                () => console.log('Suites cargadas y guardadas en el servicio'),
                err => console.error('Error al cargar suites:', err)
            )
        )
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe()
    }

    getLanguageUrl() {
        return this._localStorageService.getLanguageUrl()
    }

    consultarAplicacines() {
        this.aplicacionesSub = this._aplicacionesService
            .getAplicaciones()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.aplicaciones = resp.aplicaciones
                        console.log('aplicaciones', this.aplicaciones)
                    }
                }),
                catchError(err => {
                    console.error(err)
                    return of([])
                })
            )
            .subscribe()
    }

    consultarSuitees(): void {
        const suscriptor = this._localStorageService.getSuscriptorLocalStorage()
        if (!suscriptor || !suscriptor.codigoSuscriptor) {
            console.error('Error: No se pudo obtener el suscriptor o su código. Operación de carga de registros abortada.')
            return
        }
        this.suitesSub = this._registrosService
            .geSuitesAP()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        resp.suites.forEach((reg: any) => {
                            reg.nomEstado = reg.estadoSuite ? 'Activo' : 'Inactivo'
                            reg.nomAplicacion = this.aplicaciones.filter(x => x.codigoAplicacion == reg.codigoAplicacion)[0].nombreAplicacion
                            reg.imagenInicio = this._uploadService.getFilePath(this.suscriptor, 'suites', reg.imagenInicio)
                        })
                        this.registros = resp.suites
                        this.registrosFiltrado = resp.suites
                    }
                }),
                catchError(err => {
                    console.error(err)
                    return of([])
                })
            )
            .subscribe()
    }

    setupRegistrosStream(): void {
        // const suscriptor = this._localStorageService.getSuscriptorLocalStorage() ? this._localStorageService.getSuscriptorLocalStorage()  : {};
        // if (!suscriptor || !suscriptor.codigoSuscriptor) {
        //   console.error('Error: No se pudo obtener el suscriptor o su código. Operación de carga de registros abortada.');
        //   return;
        // }
        this.suitesTransformados$ = this._registrosService.suites$.pipe(
            switchMap((sts: PTLSuiteAPModel[]) => {
                if (!sts) return of([])
                console.log('todas las modulos', sts)
                const transformedSuites = sts.map((reg: any) => {
                    reg.nomEstado = reg.estadoModulo ? 'Activo' : 'Inactivo'
                    reg.nomAplicacion = this.aplicaciones.filter(x => x.codigoAplicacion == reg.codigoAplicacion)[0].nombreAplicacion
                    reg.imagenInicio = this._uploadService.getFilePath(this.suscriptor, 'suites', reg.imagenInicio)
                    reg.capture = this._uploadService.getFilePath(this.suscriptor, 'suites', reg.imagenInicio)
                    console.log('))))))))))) suite', reg);

                    return reg as PTLSuiteAPModel
                })
                this.suites = transformedSuites
                return of(transformedSuites)
            }),
            catchError(err => {
                console.error('Error en el stream de aplicaciones:', err)
                return of([])
            })
        )

        this.suitesFiltrados$ = combineLatest([
            this.suitesTransformados$.pipe(startWith([])),
            this.filtroAplicacionSubject,
            this.filtroSuiteSubject,
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([sts, aplicacion, suite, nombre, descripcion, estado]) => {
                let filteredSuites = sts

                if (aplicacion !== 'todos') {
                    filteredSuites = filteredSuites.filter((sui: any) => sui.codigoAplicacion === aplicacion)
                }

                if (suite !== 'todos') {
                    filteredSuites = filteredSuites.filter((sui: any) => sui.codigoSuite === suite)
                }

                if (nombre) {
                    const textoFiltro = descripcion.toLowerCase()
                    filteredSuites = filteredSuites.filter((sui: any) => (sui.nombreSuite || '').toLowerCase().includes(textoFiltro))
                }

                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true'
                    filteredSuites = filteredSuites.filter((sui: any) => sui.estadoSuite === estadoBoolean)
                }

                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase()
                    filteredSuites = filteredSuites.filter((sui: any) => (sui.descripcionSuite || '').toLowerCase().includes(textoFiltro))
                }
                console.log('registros filtrados', filteredSuites)
                return filteredSuites
            })
        )
    }

    columnasRegistros: ColumnMetadata[] = [
        {
            name: 'imagenInicio',
            header: 'SUITE.FOTO',
            type: 'image',
            isSortable: false
        },
        {
            name: 'nomAplicacion',
            header: 'SUITES.NAMEAPLICACION',
            type: 'text'
        },
        {
            name: 'nombreSuite',
            header: 'SUITES.NAME',
            type: 'text'
        },
        {
            name: 'nomAplicacion',
            header: 'SUITES.APLICACION',
            type: 'text'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'codigoAplicacion',
            header: 'SUITES.CODE',
            type: 'text'
        },
        {
            name: 'codigoSuite',
            header: 'SUITES.CODE',
            type: 'text'
        },
        {
            name: 'descripcionSuite',
            header: 'SUITES.DESCRIPTION',
            type: 'text'
        },
        {
            name: 'imagenInicio',
            header: 'SUITE.STATUS',
            type: 'capture'
        }
    ]

    onFiltroCodigoAplicacionChangeClick(evento: any) {
        const value = evento.target.value
        this.filtroAplicacionSubject.next(value)
    }

    onFiltroCodigoChangeClick(evento: any) {
        const value = evento.target.value
        this.filtroSuiteSubject.next(value)
    }

    onFiltroNombreChangeClick(evento: any) {
        const value = evento.target.value
        this.filtroNombreSubject.next(value)
    }

    onFiltroDescripcionChangeClick(evento: any) {
        const value = evento.target.value
        this.filtroDescripcionSubject.next(value)
    }

    onFiltroEstadoChangeClick(evento: any) {
        const value = evento.target.value
        this.filtroEstadoSubject.next(value)
    }

    OnNuevoRegistroClick(): void {
        this._localStorageService.setObject('regId', 'nuevo')
        this._router.navigate(['aplicaciones/gestion-suite'])
    }

    OnEditarRegistroClick(id: number): void {
        this._localStorageService.setObject('regId', id)
        this._router.navigate(['aplicaciones/gestion-suite'])
    }

    OnEliminarRegistroClick(id: any): void {
        Swal.fire({
            title: this._translate.instant('SUITES.ELIMINARTITULO'),
            text: this._translate.instant('SUITES.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this._translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this._translate.instant('PLATAFORMA.CANCEL')
        }).then(result => {
            if (result.isConfirmed) {
                this._registrosService.eliminarSuiteAP(id.id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this._translate.instant('MODULOS.ELIMINAREXITOSA') + ' ' + resp.mensaje
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire(this._translate.instant('MODULOS.ELIMINAREXITOSA'), resp.mensaje, 'success')
                        this.setupRegistrosStream()
                    },
                    error: err => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this._translate.instant('MODULOS.ELIMINARERROR') + ' ' + err.mensaje
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire('Error', this._translate.instant('MODULOS.ELIMINARERROR'), 'error')
                    }
                })
            }
        })
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
