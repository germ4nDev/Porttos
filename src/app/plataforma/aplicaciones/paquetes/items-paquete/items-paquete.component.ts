import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { DataTablesModule } from 'angular-datatables'
import { Subscription, Observable, tap, catchError, of, BehaviorSubject, switchMap, combineLatest, startWith, map } from 'rxjs'
import { GradientConfig } from 'src/app/app-config'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { PTLItemPaquete } from 'src/app/theme/shared/_helpers/models/PTLItemPaquete.model'
import { PTLPaqueteModel } from 'src/app/theme/shared/_helpers/models/PTLPaquete.model'
import {
    NavigationService,
    SwalAlertService,
    LocalStorageService,
    PtllogActividadesService,
    PTLPaquetesService,
    PtlAplicacionesService,
    PtltiposItemsService,
    PtlvaloresUnitariosService,
} from 'src/app/theme/shared/service'
import { PtlItemsPaqueteService } from 'src/app/theme/shared/service/ptlitems-paquete.service'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import Swal from 'sweetalert2'
import { DatatablePqComponent } from 'src/app/theme/shared/components/data-table-pq/data-table-pq.component'
import { PTLModulosPaqueteService } from '../../../../theme/shared/service/ptlmodulos-paquete.service'
import { PTLTipoItemModel } from '../../../../theme/shared/_helpers/models/PTLTipoItem.model';
import { PTLItems } from 'src/app/theme/shared/_helpers/models/PTLItem.model'
import { DatatableComponent } from "src/app/theme/shared/components/data-table/data-table.component";

@Component({
    selector: 'app-items-paquete',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
    templateUrl: './items-paquete.component.html',
    styleUrl: './items-paquete.component.scss'
})
export class ItemsPaqueteComponent {
    @Output() toggleSidebar = new EventEmitter<void>()
    itemsPaqueteSub?: Subscription
    registrosSub?: Subscription
    registros: PTLItemPaquete[] = []
    registrosFiltrado: PTLItemPaquete[] = []
    aplicaciones: PTLAplicacionModel[] = []
    registroId: string = ''
    modoEdicion: boolean = false

    moduloTituloExcel: string = ''
    filtroPersonalizado: string = ''
    hasFiltersSlot: boolean = false
    gradientConfig
    lang = localStorage.getItem('lang')
    menuItems$!: Observable<NavigationItem[]>
    activeTab: 'menu' | 'filters' | 'main' = 'menu'
    tiposValorSub?: Subscription
    tiposValor: PTLTipoItemModel[] = []
    listaPreciosSub?: Subscription
    listaPrecios: PTLItems[] = []
    suscriptor: string = ''

    subscriptions = new Subscription()
    filtroValorSubject = new BehaviorSubject<string>('todos')
    filtroNombreSubject = new BehaviorSubject<string>('todos')
    filtroDescripcionSubject = new BehaviorSubject<string>('')
    filtroEstadoSubject = new BehaviorSubject<string>('todos')

    itemsPaqueteTransformados$: Observable<PTLItemPaquete[]> = of([])
    itemsPaqueteFiltrados$: Observable<PTLItemPaquete[]> = of([])

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _swalService: SwalAlertService,
        private _localStorageService: LocalStorageService,
        private _logActividadesService: PtllogActividadesService,
        private _registrosService: PtlItemsPaqueteService,
        private _tiposItemsService: PtltiposItemsService,
        private _listaPreciosService: PtlvaloresUnitariosService
    ) {
        this.gradientConfig = GradientConfig
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
        this.registroId = this._localStorageService.getObject<string>('regId') || '';
        console.log('regId', this.registroId)
        this.registrosFiltrado = [];
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        this.hasFiltersSlot = true
        this.moduloTituloExcel = this.lang == 'es' ? 'Listado de Suitees' : 'List of Aplications'
        this.consultarTiposValor();
        setTimeout(() => {
            this.setupItemsPaquetesStream()
        }, 100)
        this.subscriptions.add(
            this._registrosService.cargarRegistros().subscribe(
                () => console.log('Modulos cargadas y guardadas en el servicio'),
                err => console.error('Error al cargar aplicaciones:', err)
            )
        )
    }

    consultarTiposValor() {
        this.tiposValorSub = this._tiposItemsService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.tiposValor = resp.tiposValor.filter((x: { estadoTipo: boolean }) => x.estadoTipo == true)
                        console.log('las tiposValor', this.tiposValor)
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

    onTipoValorChangeClick(evento: any) {
        console.log('evento', evento.target.value);
        const tipo = this.tiposValor.findIndex(x => x.codigoTipoItem == evento.target.value);
        const tipoValor = this.tiposValor[tipo];
        this.consultarListaPrecios(tipoValor.codigoTipoItem || '');
    }

    consultarListaPrecios(tipoId: string) {
        this.listaPreciosSub = this._listaPreciosService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        const activos = resp.valoresUnitarios.filter((x: { estadoValor: boolean }) => x.estadoValor == true)
                        this.listaPrecios = activos.filter((x: { codigoTipo: string }) => x.codigoTipo == tipoId)
                        console.log('las listaPrecios', this.listaPrecios)
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
                        resp.itemsPaquete.forEach((reg: any) => {
                            reg.nomEstado = reg.estadoItem ? 'Activo' : 'Inactivo'
                        })
                        this.registros = resp.itemsPaquete
                        this.registrosFiltrado = resp.itemsPaquete
                    }
                }),
                catchError(err => {
                    console.error(err)
                    return of([])
                })
            )
            .subscribe()
    }

    setupItemsPaquetesStream(): void {
        // const suscriptor = this._localStorageService.getSuscriptorLocalStorage() ? this._localStorageService.getSuscriptorLocalStorage()  : {};
        // if (!suscriptor || !suscriptor.codigoSuscriptor) {
        //   console.error('Error: No se pudo obtener el suscriptor o su código. Operación de carga de registros abortada.');
        //   return;
        // }
        // const codigoSuscriptor = 'e1a8fa99-15db-479b-a0a4-9c2be72273c9'
        this.itemsPaqueteTransformados$ = this._registrosService.itemsPaquetes$.pipe(
            switchMap((paqs: PTLItemPaquete[]) => {
                if (!paqs) return of([])
                console.log('todas las items paquetes', paqs)
                const transformedPacks = paqs.map((paq: any) => {
                    paq.nomEstado = paq.estadoItem ? 'Activo' : 'Inactivo'
                    return paq as PTLItemPaquete
                })
                this.registros = transformedPacks
                return of(transformedPacks)
            }),
            catchError(err => {
                console.error('Error en el stream de aplicaciones:', err)
                return of([])
            })
        )

        this.itemsPaqueteFiltrados$ = combineLatest([
            this.itemsPaqueteTransformados$.pipe(startWith([])),
            this.filtroValorSubject,
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([paqs, codigo, nombre, descripcion, estado]) => {
                let filteredItems = paqs

                if (codigo !== 'todos') {
                    filteredItems = filteredItems.filter(app => app.codigoValor === codigo)
                }

                if (nombre) {
                    const textoFiltro = descripcion.toLowerCase()
                    filteredItems = filteredItems.filter((mod: any) => (mod.nombreItem || '').toLowerCase().includes(textoFiltro))
                }

                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true'
                    filteredItems = filteredItems.filter((mod: any) => mod.estadoItem === estadoBoolean)
                }

                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase()
                    filteredItems = filteredItems.filter((mod: any) => (mod.descripcionItem || '').toLowerCase().includes(textoFiltro))
                }

                return filteredItems
            })
        )
    }

    onFiltroValorChangeClick(evento: any) {
        const value = evento.target.value
        this.filtroValorSubject.next(value)
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

    columnasPaquetes: ColumnMetadata[] = [
        {
            name: 'nombreItem',
            header: 'ITEMS.NAME',
            type: 'text'
        },
        {
            name: 'cantidad',
            header: 'ITEMS.CANTIDAD',
            type: 'number'
        },
        {
            name: 'valorUnitario',
            header: 'ITEMS.VALOR',
            type: 'price'
        },
        {
            name: 'valoresAdicionales',
            header: 'ITEMS.ADICIONALES',
            type: 'price'
        },
        {
            name: 'valorTotal',
            header: 'ITEMS.TOTAL',
            type: 'price'
        },
        {
            name: 'nomEstado',
            header: 'ITEMS.STATUS',
            type: 'estado'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'codigoItem',
            header: 'ITEMS.CODE',
            type: 'text'
        },
        {
            name: 'codigoPaquete',
            header: 'ITEMS.CODEPAQUETE',
            type: 'text'
        },
        {
            name: 'codigoValor',
            header: 'ITEMS.CODEVALOR',
            type: 'text'
        },
        {
            name: 'descripcionItem',
            header: 'ITEMS.DESCRIPCION',
            type: 'text'
        }
    ]

    getLanguageUrl(): string {
        const lang = this._localStorageService.getLanguage() || 'en'
        return `//cdn.datatables.net/plug-ins/1.10.25/i18n/${lang === 'es' ? 'Spanish' : 'English'}.json`
    }

    onFiltroNombreCodigoClick(evento: any) {
        console.log('filtrar el codigo ', evento.target.value)
        if (evento.target.value == 'todos') {
            this.registrosFiltrado = this.registros
        } else {
            this.registrosFiltrado = this.registrosFiltrado.filter(x => (x.codigoPaquete = evento.target.value))
        }
    }

    OnNuevoRegistroClick(): void {
        this._localStorageService.setObject('regId', 'nuevo');
        this._localStorageService.setObject('regPQ', this.registroId);
        this.router.navigate(['aplicaciones/gestion-itempq'])
    }

    OnEditarRegistroClick(id: number): void {
        this._localStorageService.setObject('regId', id);
        this._localStorageService.setObject('regPQ', this.registroId);
        this.router.navigate(['aplicaciones/gestion-itempq'])
    }

    OnEliminarRegistroClick(id: string): void {
        const nombreApp = this.registrosFiltrado.filter(x => x.codigoItem == id)[0]
        Swal.fire({
            title: this.translate.instant('APLICACIONES.ELIMINARTITULO'),
            text: this.translate.instant('APLICACIONES.ELIMINARTEXTO') + `"${nombreApp.nombreItem}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then(result => {
            if (result.isConfirmed) {
                this._registrosService.deleteEliminarRegistro(id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('APLICACIONES.ELIMINAREXITOSA') + ' ' + resp.mensaje
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire(this.translate.instant('APLICACIONES.ELIMINAREXITOSA'), resp.mensaje, 'success')
                        this.setupItemsPaquetesStream();
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
            }
        })
    }

    OnRegresarClick() {
        this.router.navigate(['aplicaciones/paquetes'])
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
