/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { Router } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { DataTablesModule } from 'angular-datatables'
import { Subscription, tap, catchError, of, Observable, BehaviorSubject, switchMap, combineLatest, startWith, map } from 'rxjs'
import { PTLTicketAPModel } from 'src/app/theme/shared/_helpers/models/PTLTicketAP.model'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { GradientConfig } from 'src/app/app-config'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { PTLModuloAP } from 'src/app/theme/shared/_helpers/models/PTLModuloAP.model'
import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model'
import { PTLUsuarioModel } from 'src/app/theme/shared/_helpers/models/PTLUsuario.model'
import { PTLEstadoModel } from 'src/app/theme/shared/_helpers/models/PTLEstado.model'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import {
    NavigationService,
    PtlAplicacionesService,
    PTLEstadosService,
    PtllogActividadesService,
    SwalAlertService,
    PTLTicketsService,
    PtlSuitesAPService,
    PtlmodulosApService,
    PTLUsuariosService,
    PTLSeguimientosTKService,
    LocalStorageService
} from 'src/app/theme/shared/service'
import { environment } from 'src/environments/environment'

const base_url = environment.apiUrl
import Swal from 'sweetalert2'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { DataLoaderComponent } from 'src/app/theme/shared/components/data-loader/data-loader.component'

@Component({
    selector: 'app-tickets',
    standalone: true,
    imports: [
        CommonModule,
        DataTablesModule,
        SharedModule,
        TranslateModule,
        DatatableComponent,
        NavContentComponent,
        NavBarComponent,
        DataLoaderComponent
    ],
    templateUrl: './tickets.component.html',
    styleUrl: './tickets.component.scss'
})
export class TicketsComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>()

    //#region VARIABLES
    subscriptions = new Subscription()
    filtroAplicacionSubject = new BehaviorSubject<string>('todos')
    filtroSuiteSubject = new BehaviorSubject<string>('todos')
    filtroModuloSubject = new BehaviorSubject<string>('todos')
    filtroSenderSubject = new BehaviorSubject<string>('todos')
    filtroAsignadoSubject = new BehaviorSubject<string>('todos')
    filtroNombreSubject = new BehaviorSubject<string>('')
    filtroDescripcionSubject = new BehaviorSubject<string>('')
    filtroEstadoSubject = new BehaviorSubject<string>('todos')

    registrosTransformados$: Observable<PTLTicketAPModel[]> = of([])
    registrosFiltrado$: Observable<PTLTicketAPModel[]> = of([])
    ticket: PTLTicketAPModel[] = []
    registros: PTLTicketAPModel[] = []

    aplicaciones: PTLAplicacionModel[] = []
    aplicacionesSub?: Subscription
    estadosTicketSub?: Subscription
    estadosTicket: PTLEstadoModel[] = []
    lang: string = localStorage.getItem('lang') || ''
    registrosSub?: Subscription
    suitesSub?: Subscription
    modulosSub?: Subscription
    usuariosSub?: Subscription
    usuarios: PTLUsuarioModel[] = []
    suites: PTLSuiteAPModel[] = []
    modulos: PTLModuloAP[] = []
    tituloPagina: string = ''
    //#endregion VARIABLES
    gradientConfig
    hasFiltersSlot: boolean = false
    menuItems!: Observable<NavigationItem[]>
    activeTab: 'menu' | 'filters' | 'main' = 'menu'
    suscPlataforma: string = ''

    colorOpcion1 = '#6f42c1'
    letraOpcion1 = 'R'

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _ticketsService: PTLTicketsService,
        private _swalService: SwalAlertService,
        private _logActividadesService: PtllogActividadesService,
        private _aplicacionesService: PtlAplicacionesService,
        private _modulosService: PtlmodulosApService,
        private _suitesService: PtlSuitesAPService,
        private _usuariosService: PTLUsuariosService,
        private _seguimientosService: PTLSeguimientosTKService,
        private _localStorageService: LocalStorageService,
        private _estadosTicketService: PTLEstadosService
    ) {
        this.gradientConfig = GradientConfig
        this.suscPlataforma = this._localStorageService.getSuscriptorPlataformaLocalStorage()
    }

    ngOnInit() {
        this._navigationService.getNavigationItems()
        this.menuItems = this._navigationService.menuItems$
        this.hasFiltersSlot = true
        this.consultarEstadosTicket()
        this.consultarAplicaciones()
        this.consultarSuites()
        this.consultarModulos()
        this.consultarUsuarios()
        this.consultarRegistros()
        setTimeout(() => {
            this.setupRegistrosStream()
        }, 100)
        this.subscriptions.add(
            this._ticketsService.cargarRegistros().subscribe(
                () => console.log('Tickets cargados y guardados en el servicio'),
                err => console.error('Error al cargar Ticket:', err)
            )
        )
    }
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe()
    }

    consultarEstadosTicket() {
        this.estadosTicketSub = this._estadosTicketService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.estadosTicket = resp.estados
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

    consultarAplicaciones() {
        this.aplicacionesSub = this._aplicacionesService
            .getAplicaciones()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.aplicaciones = resp.aplicaciones
                    }
                }),
                catchError(err => {
                    console.error(err)
                    return of([])
                })
            )
            .subscribe()
    }

    consultarSuites() {
        this.suitesSub = this._suitesService
            .geSuitesAP()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.suites = resp.suites
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

    consultarModulos() {
        this.modulosSub = this._modulosService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.modulos = resp.modulos.filter((mod: PTLModuloAP) => mod.hijos == true)
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

    consultarUsuarios() {
        this.modulosSub = this._usuariosService
            .getUsuarios()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.usuarios = resp.usuarios
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

    columnasRegistros: ColumnMetadata[] = [
        {
            name: 'color',
            header: 'TICKETS.TICKETS.COLOR',
            type: 'color_chip'
        },
        {
            name: 'fechaTicket',
            header: 'TICKETS.TICKETS.FECHACREACION',
            type: 'date'
        },
        {
            name: 'nombreTicket',
            header: 'TICKETS.TICKETS.NOMBRETICKET',
            type: 'text'
        },
        {
            name: 'nomSender',
            header: 'TICKETS.TICKETS.NOMUSUARIOSENDER',
            type: 'text'
        },
        {
            name: 'prioridad',
            header: 'TICKETS.TICKETS.PRIORIDAD',
            type: 'text'
        },
        {
            name: 'estadoTicket',
            header: 'TICKETS.TICKETS.ESTADOTICKET',
            type: 'estado'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'codigoTicket',
            header: 'TICKETS.TICKETS.CODIGOTICKET',
            type: 'text'
        },
        {
            name: 'nomAplicacion',
            header: 'TICKETS.TICKETS.NOMMAPLICACION',
            type: 'text'
        },
        {
            name: 'nomSuite',
            header: 'TICKETS.TICKETS.NOMBRESUITE',
            type: 'text'
        },
        {
            name: 'nomModulo',
            header: 'TICKETS.TICKETS.NOMBREMODULO',
            type: 'text'
        },
        {
            name: 'fechaAsignacion',
            header: 'TICKETS.TICKETS.FECHAASIGNACION',
            type: 'date'
        },
        {
            name: 'nomAsignado',
            header: 'TICKETS.TICKETS.NOMUSUARIOASIGNADO',
            type: 'text'
        },
        {
            name: 'descripcionTicket',
            header: 'TICKETS.TICKETS.DESCRIPCIONTICKET',
            type: 'text'
        },
        {
            name: 'definicionRequerimiento',
            header: 'TICKETS.TICKETS.DEFINICIONREQUERIMIENTO',
            type: 'text'
        },
        {
            name: 'captura',
            header: 'TICKETS.TICKETS.CAPTURA',
            type: 'capture'
        }
    ]

    consultarRegistros() {
        this.subscriptions.add(
            this._ticketsService.getRegistros().subscribe((resp: any) => {
                if (resp.ok) {
                    this.ticket = resp.tickets
                    //   console.log('Todos los Tickets', this.ticket);
                    return
                }
            })
        )
    }

    setupRegistrosStream(): void {
        this.suscPlataforma = this._localStorageService.getSuscriptorPlataformaLocalStorage()
        this.registrosTransformados$ = this._ticketsService.ticket$.pipe(
            switchMap((tickets: PTLTicketAPModel[]) => {
                if (!tickets) return of([])
                this.ticket = tickets
                const transformedApps = tickets.map((ticket: any) => {
                    ticket.color = ticket.colorPrioridad
                    ticket.captura = `${base_url}/upload/tickets/${ticket.capturaTicket}`
                    ticket.nomAplicacion = this.aplicaciones.filter(x => x.codigoAplicacion == ticket.codigoAplicacion)[0].nombreAplicacion || ''
                    ticket.nomSuite = this.suites.filter(x => x.codigoSuite == ticket.codigoSuite)[0].nombreSuite || ''
                    ticket.nomModulo = this.modulos.filter(x => x.codigoModulo == ticket.codigoModulo)[0].nombreModulo || ''
                    ticket.nomSender = this.usuarios.filter(x => x.codigoUsuario == ticket.codigoUsuarioSender)[0].nombreUsuario || ''
                    ticket.nomAsignado = this.usuarios.filter(x => x.codigoUsuario == ticket.codigoUsuarioAsignado)[0].nombreUsuario || ''
                    return ticket as PTLTicketAPModel
                })
                this.registros = transformedApps
                return of(transformedApps)
            }),
            catchError(err => {
                console.error('Error en el stream de aplicaciones:', err)
                return of([])
            })
        )
        this.registrosFiltrado$ = combineLatest([
            this.registrosTransformados$.pipe(startWith([])), // Usa la fuente de datos transformada
            this.filtroAplicacionSubject,
            this.filtroSuiteSubject,
            this.filtroModuloSubject,
            this.filtroSenderSubject,
            this.filtroAsignadoSubject,
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([tickets, aplicacion, suite, modulo, sender, asignado, nombre, descripcion, estado]) => {
                // console.log('================== roles 2', tickets);
                let filteredRegistros = tickets
                if (aplicacion !== 'todos') {
                    filteredRegistros = filteredRegistros.filter((reg: any) => reg.codigoAplicacion === aplicacion)
                }
                if (suite !== 'todos') {
                    filteredRegistros = filteredRegistros.filter((reg: any) => reg.codigoSuite === suite)
                }
                if (modulo !== 'todos') {
                    filteredRegistros = filteredRegistros.filter((reg: any) => reg.codigoModulo === modulo)
                }
                if (sender !== 'todos') {
                    filteredRegistros = filteredRegistros.filter((reg: any) => reg.codigoUsuarioSender === sender)
                }
                if (asignado !== 'todos') {
                    filteredRegistros = filteredRegistros.filter((reg: any) => reg.codigoUsuarioAsignado === asignado)
                }
                if (nombre) {
                    filteredRegistros = filteredRegistros.filter(reg => (reg.nombreTicket?.toString() || '').toLowerCase().includes(nombre))
                }
                if (estado !== 'todos') {
                    filteredRegistros = filteredRegistros.filter(reg => {
                        // Obtenemos el valor de la base de datos y lo pasamos a minúsculas
                        const estadoReg = (reg.estadoTicket?.toString() || '').toLowerCase()
                        // Pasamos el valor del filtro también a minúsculas para asegurar coincidencia
                        const estadoFiltro = estado.toLowerCase()
                        return estadoReg === estadoFiltro
                    })
                }
                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase()
                    filteredRegistros = filteredRegistros.filter(reg => (reg.descripcionTicket || '').toLowerCase().includes(textoFiltro))
                }
                return filteredRegistros
            })
        )
    }

    onFiltroAplicacionChangeClick(evento: any) {
        const value = evento.target.value
        this.filtroAplicacionSubject.next(value)
    }

    onFiltroSuiteChangeClick(evento: any) {
        const value = evento.target.value
        this.filtroSuiteSubject.next(value)
    }

    onFiltroModuloChangeClick(evento: any) {
        const value = evento.target.value
        this.filtroModuloSubject.next(value)
    }

    onFiltroSenderChangeClick(evento: any) {
        const value = evento.target.value
        this.filtroSenderSubject.next(value)
    }

    onFiltroAsignadoChangeClick(evento: any) {
        const value = evento.target.value
        this.filtroAsignadoSubject.next(value)
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

    OnNuevoRegistroClick() {
        this._localStorageService.setObject('regId', 'nuevo')
        this.router.navigate(['tickets/gestion-ticket'])
    }

    OnEditarRegistroClick(id: any) {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['tickets/gestion-ticket'])
    }

    OnEliminarRegistroClick(id: any) {
        Swal.fire({
            title: this.translate.instant('TICKETS.TICKETS.ELIMINARTITULO'),
            text: this.translate.instant('TICKETS.TICKETS.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then((result: any) => {
            if (result.isConfirmed) {
                console.log('id', id.id)
                const ticket = this.registros.filter(x => x.codigoTicket == id.id)[0]
                this._ticketsService.deleteEliminarRegistro(id.id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('TICKETS.TICKETS.ELIMINAREXITOSA') + ' ' + resp.mensaje
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        if (ticket.capturaTicket != 'no-imagen.png') {
                            //   console.log('esta es la captura del ticket', ticket.capturaTicket);
                            //   const captura = ticket.capturaTicket || '';
                            //   this._uploadService.deleteFilePath('0', 'tickets', captura).subscribe((data: any) => {
                            //     console.log('mensaje', data.mensaje);
                            //   });
                        }
                        this._seguimientosService.getRegistrosByTicket(id.id).subscribe(segs => {
                            if (segs.seguimientos.length > 0) {
                                segs.seguimientos.forEach((segui: any) => {
                                    this._seguimientosService
                                        .deleteEliminarRegistro(segui.codigoSeguimiento)
                                        .subscribe(() => console.log('seguimiento eliminado'))
                                })
                            }
                        })
                        this._ticketsService.cargarRegistros().subscribe(() => {
                            this._swalService.getAlertSuccess(this.translate.instant('TICKETS.TICKETS.ELIMINAREXITOSA'))
                        })
                    },
                    error: (err: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('TICKETS.MODULOS.ELIMINARERROR') + ' ' + err.mensaje
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalService.getAlertError(this.translate.instant('TICKETS.TICKETS.ELIMINARERROR') + ' ' + err.mensaje)
                        console.error('Error eliminando', err)
                    }
                })
            }
        })
    }

    OnViewRegistroClick(id: any) {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['tickets/gestion-ticket'])
    }

    OnOption1Click(event: any) {
        this._localStorageService.setObject('regId', event)
        this.router.navigate(['tickets/requerimientos'])
    }

    OnOption2Click(event: any) {
        console.log('ejecutando opcion 2', event)
    }

    OnOption3Click(event: any) {
        console.log('ejecutando opcion 3', event)
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
