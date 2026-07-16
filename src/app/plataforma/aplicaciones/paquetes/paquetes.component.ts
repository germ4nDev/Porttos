import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DataTablesModule } from 'angular-datatables'
import { Router } from '@angular/router'
import { PTLAplicacionModel } from './../../../theme/shared/_helpers/models/PTLAplicacion.model'
import { PtlAplicacionesService } from './../../../theme/shared/service/ptlaplicaciones.service'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { NavBarComponent } from '../../../theme/layout/admin/nav-bar/nav-bar.component'
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { PTLPaqueteModel } from 'src/app/theme/shared/_helpers/models/PTLPaquete.model'
import { PTLPaquetesService } from 'src/app/theme/shared/service/ptlpaquetes.service'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { LocalStorageService, SwalAlertService } from 'src/app/theme/shared/service'
import { BehaviorSubject, Observable, Subscription, combineLatest, of } from 'rxjs'
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators'
import { GradientConfig } from 'src/app/app-config'
import { PtllogActividadesService } from 'src/app/theme/shared/service/ptllog-actividades.service'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model'
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model'
import Swal from 'sweetalert2'

@Component({
    selector: 'app-paquetes',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
    templateUrl: './paquetes.component.html',
    styleUrl: './paquetes.component.scss'
})
export class PaquetesComponent implements OnInit, OnDestroy {
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
    filtroNombreSubject = new BehaviorSubject<string>('todos')
    filtroDescripcionSubject = new BehaviorSubject<string>('')
    filtroEstadoSubject = new BehaviorSubject<string>('todos')

    paquetesTransformados$: Observable<PTLPaqueteModel[]> = of([])
    paquetesFiltrados$: Observable<PTLPaqueteModel[]> = of([])
    paquetes: PTLPaqueteModel[] = []
    registrosSub?: Subscription

    colorOpcion1 = '#6f42c1'
    letraOpcion1 = 'M'
    colorOpcion2 = '#4279c1'
    letraOpcion2 = 'I'

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _localStorageService: LocalStorageService,
        private _logActividadesService: PtllogActividadesService,
        private _registrosService: PTLPaquetesService,
        private _aplicacionesService: PtlAplicacionesService
    ) {
        this.gradientConfig = GradientConfig
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        this.hasFiltersSlot = true
        this.moduloTituloExcel = this.lang == 'es' ? 'Listado de Suitees' : 'List of Aplications'
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
        setTimeout(() => {
            this.setupPaquetesStream()
        }, 100)
        this.subscriptions.add(
            this._registrosService.cargarRegistros().subscribe(
                () => console.log('Modulos cargadas y guardadas en el servicio'),
                err => console.error('Error al cargar aplicaciones:', err)
            )
        )
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe()
    }

    consultarRegistros(): void {
        this.registrosSub = this._registrosService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        resp.paquetes.forEach((reg: any) => {
                            reg.nomEstado = reg.estadoPaquete ? 'Activo' : 'Inactivo'
                            reg.nomPromocion = reg.promocion ? 'Si' : 'No'
                        })
                        console.log('todos los paquetes', resp)
                        this.paquetes = resp.paquetes
                    }
                }),
                catchError(err => {
                    console.error(err)
                    return of([])
                })
            )
            .subscribe()
    }

    setupPaquetesStream(): void {
        // const suscriptor = this._localStorageService.getSuscriptorLocalStorage() ? this._localStorageService.getSuscriptorLocalStorage()  : {};
        // if (!suscriptor || !suscriptor.codigoSuscriptor) {
        //   console.error('Error: No se pudo obtener el suscriptor o su código. Operación de carga de registros abortada.');
        //   return;
        // }
        const codigoSuscriptor = 'e1a8fa99-15db-479b-a0a4-9c2be72273c9'
        this.paquetesTransformados$ = this._registrosService.paquetes$.pipe(
            switchMap((paqs: PTLPaqueteModel[]) => {
                if (!paqs) return of([])
                console.log('todas las paquetes', paqs)
                const transformedPacks = paqs.map((paq: any) => {
                    paq.nomEstado = paq.estadoPaquete ? 'Activo' : 'Inactivo'
                    paq.nomPromocion = paq.promocion ? 'Si' : 'No'
                    return paq as PTLPaqueteModel
                })
                this.paquetes = transformedPacks
                return of(transformedPacks)
            }),
            catchError(err => {
                console.error('Error en el stream de aplicaciones:', err)
                return of([])
            })
        )

        this.paquetesFiltrados$ = combineLatest([
            this.paquetesTransformados$.pipe(startWith([])),
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([paqs, nombre, descripcion, estado]) => {
                let filteredpaquetes = paqs

                if (nombre) {
                    const textoFiltro = descripcion.toLowerCase()
                    filteredpaquetes = filteredpaquetes.filter((mod: any) => (mod.nombrePaquete || '').toLowerCase().includes(textoFiltro))
                }

                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true'
                    filteredpaquetes = filteredpaquetes.filter((mod: any) => mod.estadoPaquete === estadoBoolean)
                }

                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase()
                    filteredpaquetes = filteredpaquetes.filter((mod: any) => (mod.descripcionPaquete || '').toLowerCase().includes(textoFiltro))
                }

                return filteredpaquetes
            })
        )
    }

    columnasPaquetes: ColumnMetadata[] = [
        {
            name: 'nombrePaquete',
            header: 'PAQUETES.NAME',
            type: 'text'
        },
        {
            name: 'costoPaquete',
            header: 'PAQUETES.COSTE',
            type: 'price'
        },
        {
            name: 'precioPaquete',
            header: 'PAQUETES.PRECIO',
            type: 'price'
        },
        {
            name: 'nomPromocion',
            header: 'PAQUETES.PROMOCION',
            type: 'estado'
        },
        {
            name: 'nomEstado',
            header: 'PAQUETES.STATUS',
            type: 'estado'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'codigoPaquete',
            header: 'PAQUETES.CODE',
            type: 'text'
        },
        {
            name: 'precioPromocion',
            header: 'PAQUETES.PRECIOPROMOCION',
            type: 'price'
        },
        {
            name: 'descripcionPaquete',
            header: 'PAQUETES.DESCRIPTION',
            type: 'text'
        },
        {
            name: 'acuerdoLicencia',
            header: 'PAQUETES.ACUERDOLICENCIA',
            type: 'text'
        },
        {
            name: 'iconoPaquete',
            header: 'PAQUETES.ICONO',
            type: 'avatar'
        },
        {
            name: 'imagenPaquete',
            header: 'PAQUETES.IMAGEN',
            type: 'image'
        }
    ]

    getLanguageUrl(): string {
        const lang = this._localStorageService.getLanguage() || 'en'
        return `//cdn.datatables.net/plug-ins/1.10.25/i18n/${lang === 'es' ? 'Spanish' : 'English'}.json`
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
        this._localStorageService.setObject('regId', 'nuevo');
        this.router.navigate(['aplicaciones/gestion-paquete'])
    }

    OnEditarRegistroClick(id: number): void {
        this._localStorageService.setObject('regId', id);
        this.router.navigate(['aplicaciones/gestion-paquete'])
    }

    OnEliminarRegistroClick(id: string): void {
        const nombrePaq = this.paquetes.filter(x => x.codigoPaquete == id)[0]
        Swal.fire({
            title: this.translate.instant('APLICACIONES.ELIMINARTITULO'),
            text: this.translate.instant('APLICACIONES.ELIMINARTEXTO') + `"${nombrePaq.nombrePaquete}".`,
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
                        this.setupPaquetesStream()
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

    OnOption1Click(id: any) {
        this._localStorageService.setObject('regId', id);
        this.router.navigate(['aplicaciones/modulos-paquete'])
    }

    OnOption2Click(id: any) {
        this._localStorageService.setObject('regId', id);
        this.router.navigate(['aplicaciones/items-paquete'])
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
