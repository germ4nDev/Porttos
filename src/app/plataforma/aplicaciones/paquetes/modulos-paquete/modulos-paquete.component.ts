import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { DataTablesModule } from 'angular-datatables'
import { Subscription, Observable, tap, catchError, of, map, forkJoin, switchMap, BehaviorSubject, combineLatest, startWith } from 'rxjs'
import { GradientConfig } from 'src/app/app-config'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { PTLItemPaquete } from 'src/app/theme/shared/_helpers/models/PTLItemPaquete.model'
import { PTLModuloAP } from 'src/app/theme/shared/_helpers/models/PTLModuloAP.model'
import { DatatablePqComponent } from 'src/app/theme/shared/components/data-table-pq/data-table-pq.component'
import {
    NavigationService,
    SwalAlertService,
    LocalStorageService,
    PtllogActividadesService,
    PtlAplicacionesService,
    PtlSuitesAPService,
    PtlmodulosApService
} from 'src/app/theme/shared/service'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import Swal from 'sweetalert2'
import { PTLModulosPaqueteService } from 'src/app/theme/shared/service/ptlmodulos-paquete.service'
import { PTLModuloPQModel } from 'src/app/theme/shared/_helpers/models/PTLModuloPQ.model'
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component'
import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model'

@Component({
    selector: 'app-modulos-paquete',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
    templateUrl: './modulos-paquete.component.html',
    styleUrl: './modulos-paquete.component.scss'
})
export class ModulosPaqueteComponent {
    @Output() toggleSidebar = new EventEmitter<void>()
    itemsPaqueteSub?: Subscription
    registrosSub?: Subscription
    registros: PTLModuloPQModel[] = []
    registrosFiltrado: PTLModuloPQModel[] = []
    codigoAplicacion: string = ''
    codigoSuite: string = ''
    registroId: string = ''
    modoEdicion: boolean = false
    aplicacionesSub?: Subscription
    aplicaciones: PTLAplicacionModel[] = []
    suitesSub?: Subscription
    modulosSub?: Subscription
    suites: PTLSuiteAPModel[] = []
    modulosPadre: PTLModuloAP[] = []
    suscriptor: string = ''
    moduloTituloExcel: string = ''
    filtroPersonalizado: string = ''
    hasFiltersSlot: boolean = false
    gradientConfig
    lang = localStorage.getItem('lang')
    menuItems$!: Observable<NavigationItem[]>
    activeTab: 'menu' | 'filters' | 'main' = 'menu'

    subscriptions = new Subscription()
    filtroCodigoSubject = new BehaviorSubject<string>('todos')
    filtroNombreSubject = new BehaviorSubject<string>('todos')
    filtroEstadoSubject = new BehaviorSubject<string>('todos')

    modulosPaqueteTransformados$: Observable<PTLModuloPQModel[]> = of([])
    modulosPaqueteFiltrados$: Observable<PTLModuloPQModel[]> = of([])

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _swalService: SwalAlertService,
        private _localStorageService: LocalStorageService,
        private _logActividadesService: PtllogActividadesService,
        private _aplicacionesService: PtlAplicacionesService,
        private _suitesService: PtlSuitesAPService,
        private _modulosService: PtlmodulosApService,
        private _registrosService: PTLModulosPaqueteService
    ) {
        this.gradientConfig = GradientConfig
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
        this.registroId = this._localStorageService.getObject<string>('regId') || ''
        console.log('regId', this.registroId)
        this.registrosFiltrado = []
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        this.hasFiltersSlot = true
        this.moduloTituloExcel = this.lang == 'es' ? 'Listado de Suitees' : 'List of Aplications'
        this.consultarAplicaciones()
        this.consultarSuites()
        this.consultarModulos()
        setTimeout(() => {
            this.setupModulosPaquetesStream()
        }, 100)
        this.subscriptions.add(
            this._registrosService.cargarRegistros().subscribe(
                () => console.log('Modulos cargadas y guardadas en el servicio'),
                err => console.error('Error al cargar aplicaciones:', err)
            )
        )
        // this.consultarRegistros()
    }

    consultarAplicaciones() {
        this.aplicacionesSub = this._aplicacionesService
            .getAplicaciones()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.aplicaciones = resp.aplicaciones
                        console.log('las aplicaciones', this.aplicaciones)
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

    consultarSuites(codapp?: string) {
        this.suitesSub = this._suitesService
            .geSuitesAP()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        if (codapp) {
                            this.suites = resp.suites.filter((x: { codigoAplicacion: string }) => x.codigoAplicacion == codapp)
                        } else {
                            this.suites = resp.suites
                        }
                        console.log('Todos las suites', this.suites)
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

    consultarModulos(codSuite?: string) {
        this.modulosSub = this._modulosService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        console.log('todos los modulos', resp)
                        this.modulosPadre = resp.modulos.filter(
                            (x: { hijos: boolean; estadoModulo: boolean }) => x.hijos == true && x.estadoModulo == true
                        )
                        console.log('Todos las modulos padre', this.modulosPadre)
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

    consultarRegistros(): void {
        this.registrosSub = this._registrosService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        resp.modulosPaquete.forEach((reg: any) => {
                            reg.modulo = this.consultarDataModulo(reg.codigoModulo)
                        })
                        this.registros = resp.modulosPaquete
                        this.registrosFiltrado = resp.modulosPaquete
                        console.log('resp', resp)
                    }
                }),
                catchError(err => {
                    console.error(err)
                    return of([])
                })
            )
            .subscribe()
    }

    consultarDataModulo(codigo: string): Observable<PTLModuloAP> {
        return this._modulosService.getRegistroById(codigo).pipe(
            switchMap((data: any) => {
                const modulo = data.modulo
                modulo.estadoItem ? 'Activo' : 'Inactivo'
                return forkJoin({
                    app: this._aplicacionesService.getAplicacionByCode(modulo.codigoAplicacion),
                    suite: this._suitesService.getSuiteAPById(modulo.codigoSuite)
                }).pipe(
                    map((res: any) => {
                        console.log('resultado del modulo', res)
                        modulo.nomAplicacion = res.app.aplicacion.nombreAplicacion
                        modulo.nomSuite = res.suite.suite.nombreSuite
                        return modulo as PTLModuloAP
                    })
                )
            })
        )
    }

    setupModulosPaquetesStream(): void {
        // const suscriptor = this._localStorageService.getSuscriptorLocalStorage() ? this._localStorageService.getSuscriptorLocalStorage()  : {};
        // if (!suscriptor || !suscriptor.codigoSuscriptor) {
        //   console.error('Error: No se pudo obtener el suscriptor o su código. Operación de carga de registros abortada.');
        //   return;
        // }
        // const codigoSuscriptor = 'e1a8fa99-15db-479b-a0a4-9c2be72273c9'
        this.modulosPaqueteTransformados$ = this._registrosService.modulosPQ$.pipe(
            switchMap((paqs: PTLModuloPQModel[]) => {
                if (!paqs) return of([])
                console.log('todas las items paquetes', paqs)
                const transformedPacks = paqs.map((paq: any) => {
                    paq.nomEstado = paq.estadoModuloPQ ? 'Activo' : 'Inactivo'
                    const app = this.aplicaciones.filter(x => x.codigoAplicacion == paq.codigoAplicacion)[0]
                    const sui = this.suites.filter(x => x.codigoSuite == paq.codigoSuite)[0]
                    const mod = this.modulosPadre.filter(x => x.codigoModulo == paq.codigoModulo)[0]
                    paq.nomAplicacion = app.nombreAplicacion
                    paq.nomSuite = sui.nombreSuite
                    paq.nomModulo = mod.nombreModulo
                    return paq as PTLModuloPQModel
                })
                this.registros = transformedPacks
                console.log('registros', this.registros)
                return of(transformedPacks)
            }),
            catchError(err => {
                console.error('Error en el stream de aplicaciones:', err)
                return of([])
            })
        )

        this.modulosPaqueteFiltrados$ = combineLatest([
            this.modulosPaqueteTransformados$.pipe(startWith([])),
            this.filtroCodigoSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([paqs, codigo, estado]) => {
                let filteredItems = paqs

                if (codigo !== 'todos') {
                    filteredItems = filteredItems.filter(app => app.codigoModuloPQ === codigo)
                }

                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true'
                    filteredItems = filteredItems.filter((mod: any) => mod.estadoModuloPQ === estadoBoolean)
                }

                return filteredItems
            })
        )
    }

    onFiltroCodigoChangeClick(evento: any) {
        const value = evento.target.value
        this.filtroCodigoSubject.next(value)
    }

    onFiltroNombreChangeClick(evento: any) {
        const value = evento.target.value
        this.filtroNombreSubject.next(value)
    }

    onFiltroEstadoChangeClick(evento: any) {
        const value = evento.target.value
        this.filtroEstadoSubject.next(value)
    }

    columnasPaquetes: ColumnMetadata[] = [
        {
            name: 'nomModulo',
            header: 'MODULOSPQ.MODULO',
            type: 'text'
        },
        {
            name: 'nomSuite',
            header: 'MODULOSPQ.SUITE',
            type: 'text'
        },
        {
            name: 'nomAplicacion',
            header: 'MODULOSPQ.APLICACION',
            type: 'text'
        },
        {
            name: 'nomEstado',
            header: 'MODULOSPQ.STATUS',
            type: 'estado'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = []

    getLanguageUrl(): string {
        const lang = this._localStorageService.getLanguage() || 'en'
        return `//cdn.datatables.net/plug-ins/1.10.25/i18n/${lang === 'es' ? 'Spanish' : 'English'}.json`
    }

    OnNuevoRegistroClick(): void {
        this._localStorageService.setObject('regId', 'nuevo')
        this._localStorageService.setObject('regPQ', this.registroId)
        this.router.navigate(['aplicaciones/gestion-modulopq'])
    }

    OnEditarRegistroClick(id: any): void {
        this._localStorageService.setObject('regId', id)
        this._localStorageService.setObject('regPQ', this.registroId)
        this.router.navigate(['aplicaciones/gestion-itempq'])
    }

    OnEliminarRegistroClick(id: any): void {
        const nombreApp = this.registrosFiltrado.filter(x => x.codigoModuloPQ == id)[0]
        Swal.fire({
            title: this.translate.instant('APLICACIONES.ELIMINARTITULO'),
            text: this.translate.instant('APLICACIONES.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then(result => {
            this._registrosService.deleteEliminarRegistro(id).subscribe({
                next: (resp: any) => {
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '201',
                        descripcionLog: this.translate.instant('APLICACIONES.ELIMINAREXITOSA') + ' ' + resp.mensaje
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this.setupModulosPaquetesStream()
                    Swal.fire(this.translate.instant('APLICACIONES.ELIMINAREXITOSA'), resp.mensaje, 'success')
                },
                error: err => {
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('APLICACIONES.ELIMINARERROR') + ' ' + err.mensaje
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    Swal.fire('Error', this.translate.instant('APLICACIONES.ELIMINARERROR'), 'error')
                }
            })
        })
    }

    OnRegresarClick() {
        this.router.navigate(['aplicaciones/paquetes'])
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
