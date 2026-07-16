/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DataTablesModule } from 'angular-datatables'
import { Router } from '@angular/router'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { BehaviorSubject, Observable, Subscription, combineLatest, of } from 'rxjs'
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators'
import { GradientConfig } from 'src/app/app-config'

import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { NavBarComponent } from '../../../theme/layout/admin/nav-bar/nav-bar.component'
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { PtlAplicacionesService } from 'src/app/theme/shared/service/ptlaplicaciones.service'
import { PtlSuitesAPService } from 'src/app/theme/shared/service/ptlsuites-ap.service'
import { PtlmodulosApService } from 'src/app/theme/shared/service/ptlmodulos-ap.service'
import { PTLBiblioteca } from 'src/app/theme/shared/_helpers/models/PTLBiblioteca.model'

import Swal from 'sweetalert2'
import { PTLModuloAP } from 'src/app/theme/shared/_helpers/models/PTLModuloAP.model'
import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { LocalStorageService, PtlBibliotecasService, PtllogActividadesService, UploadFilesService } from 'src/app/theme/shared/service'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model'
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model'
import { DataLoaderComponent } from 'src/app/theme/shared/components/data-loader/data-loader.component'

@Component({
    selector: 'app-modulos',
    standalone: true,
    imports: [
        CommonModule,
        DataTablesModule,
        SharedModule,
        TranslateModule,
        NavBarComponent,
        NavContentComponent,
        DatatableComponent,
        DataLoaderComponent
    ],
    templateUrl: './modulos.component.html',
    styleUrl: './modulos.component.scss'
})
export class ModulosComponent implements OnInit, OnDestroy {
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
    filtroAplicacionSubject = new BehaviorSubject<string>('todos')
    filtroSuiteSubject = new BehaviorSubject<string>('todos')
    filtroModuloSubject = new BehaviorSubject<string>('todos')
    filtroDescripcionSubject = new BehaviorSubject<string>('')
    filtroEstadoSubject = new BehaviorSubject<string>('todos')

    modulosTransformados$: Observable<PTLModuloAP[]> = of([])
    modulosFiltrados$: Observable<PTLModuloAP[]> = of([])
    modulos: PTLModuloAP[] = []
    bibliotecasSub?: Subscription
    listBibliotecas: PTLBiblioteca[] = []

    aplicaciones: PTLAplicacionModel[] = []
    aplicacionesSub?: Subscription
    suites: PTLSuiteAPModel[] = []
    suitesSub?: Subscription
    modulosSub?: Subscription
    modulosPadre: PTLModuloAP[] = []
    filtroPersonalizado: string = ''

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _aplicacionesService: PtlAplicacionesService,
        private _logActividadesService: PtllogActividadesService,
        private _localStorageService: LocalStorageService,
        private _biblioecasService: PtlBibliotecasService,
        private _suitesService: PtlSuitesAPService,
        private _registrosService: PtlmodulosApService,
        private _uploadService: UploadFilesService
    ) {
        this.gradientConfig = GradientConfig
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        this.hasFiltersSlot = true
        this.consultarAplicacines()
        this.consultarSuites()
        this.consultarModulosPadre()
        this.consultarRegistros()
        this.consultarBibliotecas()
        setTimeout(() => {
            this.setupModulosStream()
        }, 100)
        this.subscriptions.add(
            this._registrosService.cargarRegistros().subscribe(
                () => console.log('Modulos cargadas y guardadas en el servicio'),
                err => console.error('Error al cargar aplicaciones:', err)
            )
        )
        // this.moduloTituloExcel = this.lang == 'es' ? 'Listado de Suitees' : 'List of Aplications';
        // this.consultarRegistros();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe()
    }

    consultarAplicacines() {
        this.subscriptions.add(
            this._aplicacionesService
                .getAplicaciones()
                .pipe(
                    tap((resp: any) => {
                        if (resp.ok) {
                            this.aplicaciones = resp.aplicaciones
                            // console.log('aplicaciones 1', this.aplicaciones);
                        }
                    }),
                    catchError(err => {
                        console.error(err)
                        return of([])
                    })
                )
                .subscribe()
        )
    }

    consultarSuites(codApp?: string): void {
        this.subscriptions.add(
            this._suitesService
                .geSuitesAP()
                .pipe(
                    tap((resp: any) => {
                        if (resp.ok) {
                            if (codApp) {
                                this.suites = resp.suites.filter((x: { codigoAplicacion: string }) => x.codigoAplicacion == codApp)
                            } else {
                                this.suites = resp.suites
                            }
                            // console.log('suites 1', this.suites);
                        }
                    }),
                    catchError(err => {
                        console.error(err)
                        return of([])
                    })
                )
                .subscribe()
        )
    }

    consultarModulosPadre() {
        this.subscriptions.add(
            this._registrosService
                .getRegistros()
                .pipe(
                    tap((resp: any) => {
                        if (resp.ok) {
                            this.modulosPadre = resp.modulos.filter((x: { hijos: boolean }) => x.hijos == true)
                            // console.log('modulosPadre 1', this.modulosPadre);
                        }
                    }),
                    catchError(err => {
                        console.error(err)
                        return of([])
                    })
                )
                .subscribe()
        )
    }

    consultarRegistros() {
        this.subscriptions.add(
            this._registrosService.getRegistros().subscribe((resp: any) => {
                if (resp.ok) {
                    this.modulos = resp.modulos
                    console.log('Todos las modulos', this.modulos)
                    return
                }
            })
        )
    }

    consultarBibliotecas() {
        this.bibliotecasSub = this._biblioecasService
            .getBibliotecas()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.listBibliotecas = resp.bibliotecas.filter((x: { estadoBiblioteca: boolean }) => x.estadoBiblioteca == true)
                        console.log('Todos las bibliotecas padre', this.listBibliotecas)
                        return
                    }
                }),
                catchError(err => {
                    console.log('Ha ocurrido un error', err)
                    return of(null)
                })
            )
            .subscribe()
    }

    setupModulosStream(): void {
        // const suscriptor = this._localStorageService.getSuscriptorLocalStorage() ? this._localStorageService.getSuscriptorLocalStorage()  : {};
        // if (!suscriptor || !suscriptor.codigoSuscriptor) {
        //   console.error('Error: No se pudo obtener el suscriptor o su código. Operación de carga de registros abortada.');
        //   return;
        // }
        const codigoSuscriptor = this._localStorageService.getObject<string>('codigoSuscriptor') || ''
        this.modulosTransformados$ = this._registrosService.modulos$.pipe(
            switchMap((mods: PTLModuloAP[]) => {
                if (!mods) return of([])
                const transformedModulos = mods.map((mod: any) => {
                    mod.nomEstado = mod.estadoModulo ? 'Activo' : 'Inactivo'
                    mod.nomHijos = mod.hijos ? 'Con Hijos' : 'Sin Hijos'
                    mod.nomAplicacion = this.aplicaciones.filter(x => x.codigoAplicacion == mod.codigoAplicacion)[0].nombreAplicacion || ''
                    mod.nomSuite = this.suites.filter(x => x.codigoSuite == mod.codigoSuite)[0].nombreSuite || ''
                    console.log('listBibliotecas', this.listBibliotecas)
                    const biblioteca = this.listBibliotecas.filter(x => x.codigoModulo == mod.codigoModulo)[0]
                    mod.codigoBiblioteca = biblioteca != undefined ? biblioteca.codigoBiblioteca : ''
                    mod.nomBiblioteca = biblioteca != undefined ? biblioteca.nombreBiblioteca : ''
                    mod.nomPadre = mod.codigoPadre != '0' ? this.modulosPadre.filter(x => x.codigoModulo == mod.codigoPadre)[0].nombreModulo : ''
                    return mod as PTLModuloAP
                })
                this.modulos = transformedModulos
                console.log('todas las modulos', this.modulos)
                return of(transformedModulos)
            }),
            catchError(err => {
                console.error('Error en el stream de aplicaciones:', err)
                return of([])
            })
        )

        this.modulosFiltrados$ = combineLatest([
            this.modulosTransformados$.pipe(startWith([])),
            this.filtroAplicacionSubject,
            this.filtroSuiteSubject,
            this.filtroModuloSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([mods, aplicacion, suite, modulo, descripcion, estado]) => {
                let filteredmodulos = mods

                if (aplicacion !== 'todos') {
                    filteredmodulos = filteredmodulos.filter((mod: any) => mod.codigoAplicacion === aplicacion)
                }

                if (suite !== 'todos') {
                    filteredmodulos = filteredmodulos.filter((mod: any) => mod.codigoSuite === suite)
                }

                if (modulo !== 'todos') {
                    filteredmodulos = filteredmodulos.filter((mod: any) => mod.codigoModulo === modulo)
                }

                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true'
                    filteredmodulos = filteredmodulos.filter((mod: any) => mod.estadoModulo === estado)
                }

                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase()
                    filteredmodulos = filteredmodulos.filter((mod: any) => (mod.descripcionModulo || '').toLowerCase().includes(textoFiltro))
                }

                return filteredmodulos
            })
        )
    }

    columnasRegistros: ColumnMetadata[] = [
        {
            name: 'nombreModulo',
            header: 'MODULOS.NAME',
            type: 'text'
        },
        {
            name: 'nomPadre',
            header: 'MODULOS.PADRE',
            type: 'text'
        },
        {
            name: 'nomHijos',
            header: 'MODULOS.HIJOS',
            type: 'estado'
        },
        {
            name: 'nomEstado',
            header: 'MODULOS.STATUS',
            type: 'estado'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'codigoModulo',
            header: 'MODULOS.CODE',
            type: 'text'
        },
        {
            name: 'nomAplicacion',
            header: 'MODULOS.NOMBREAPLICACION',
            type: 'text'
        },
        {
            name: 'nomSuite',
            header: 'MODULOS.NOMBRESUITE',
            type: 'text'
        },
        {
            name: 'precioModulo',
            header: 'MODULOS.PRECIO',
            type: 'price'
        },
        {
            name: 'descripcionModulo',
            header: 'MODULOS.DESCRIPTION',
            type: 'text'
        }
    ]

    getLanguageUrl(): string {
        const lang = localStorage.getItem('lang') || 'en'
        return `//cdn.datatables.net/plug-ins/1.10.25/i18n/${lang === 'es' ? 'Spanish' : 'English'}.json`
    }

    onFiltroCodigoAplicacionChangeClick(evento: any) {
        // console.log('filtrar el codigo ', evento.target.value);
        const value = evento.target.value
        this.filtroAplicacionSubject.next(value)
    }

    onFiltroCodigoSuiteChangeClick(evento: any) {
        // console.log('filtrar el codigo ', evento.target.value);
        const value = evento.target.value
        this.filtroSuiteSubject.next(value)
    }

    onFiltroCodigoModuloChangeClick(evento: any) {
        // console.log('filtrar el codigo ', evento.target.value);
        const value = evento.target.value
        this.filtroModuloSubject.next(value)
    }

    onFiltroDescripcionChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroDescripcionSubject.next(value)
    }

    onFiltroEstadoChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroEstadoSubject.next(value)
    }

    OnNuevoRegistroClick(): void {
        this._localStorageService.setObject('regId', 'nuevo')
        this.router.navigate(['aplicaciones/gestion-modulo'])
    }

    OnEditarRegistroClick(id: number): void {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['aplicaciones/gestion-modulo'])
    }

    OnEliminarRegistroClick(id: any): void {
        Swal.fire({
            title: this.translate.instant('MODULOS.ELIMINARTITULO'),
            text: this.translate.instant('MODULOS.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then(result => {
            if (result.isConfirmed) {
                this._registrosService.deleteEliminarRegistro(id.id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('MODULOS.ELIMINAREXITOSA') + ' ' + resp.mensaje
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire(this.translate.instant('MODULOS.ELIMINAREXITOSA'), resp.mensaje, 'success')
                        this.setupModulosStream()
                    },
                    error: err => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('MODULOS.ELIMINARERROR') + ' ' + err.mensaje
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire('Error', this.translate.instant('MODULOS.ELIMINARERROR'), 'error')
                    }
                })
            }
        })
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
