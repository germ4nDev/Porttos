import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataTablesModule } from 'angular-datatables';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import {
    NavigationService,
    PtllogActividadesService,
    SwalAlertService,
    LocalStorageService,
    PTLTicketsService
} from 'src/app/theme/shared/service';
import { environment } from 'src/environments/environment';

const base_url = environment.apiUrl;
import Swal from 'sweetalert2';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of, startWith, Subscription, switchMap, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { GradientConfig } from 'src/app/app-config';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { PTLRequerimientoTKModel } from 'src/app/theme/shared/_helpers/models/PTLRequerimientoTK.model';
import { PTLRequerimientosTkService } from 'src/app/theme/shared/service/ptlrequerimientos-tk.service';
import { PTLTicketAPModel } from 'src/app/theme/shared/_helpers/models/PTLTicketAP.model';

@Component({
    selector: 'app-requerimientos',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, DatatableComponent, NavContentComponent, NavBarComponent],
    templateUrl: './requerimientos.component.html',
    styleUrl: './requerimientos.component.scss'
})
export class RequerimientosComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>();
    //#region VARIABLES

    subscriptions = new Subscription();
    filtroTicketSubject = new BehaviorSubject<string>('todos');
    filtroNombreSubject = new BehaviorSubject<string>('');
    filtroDescripcionSubject = new BehaviorSubject<string>('');
    filtroEstadoSubject = new BehaviorSubject<string>('todos');

    registrosTransformados$: Observable<PTLRequerimientoTKModel[]> = of([]);
    registrosFiltrado$: Observable<PTLRequerimientoTKModel[]> = of([]);
    requerimiento: PTLRequerimientoTKModel[] = [];
    registros: PTLRequerimientoTKModel[] = [];
    ticketSub?: Subscription;
    ticket: PTLTicketAPModel[] = [];
    tcId: string = '';

    lang: string = localStorage.getItem('lang') || '';
    tituloPagina: string = '';
    codigoRegistro: string = '';
    //#endregion VARIABLES
    gradientConfig;
    hasFiltersSlot: boolean = false;
    menuItems$!: Observable<NavigationItem[]>;
    activeTab: 'menu' | 'filters' | 'main' = 'menu';
    suscPlataforma: string = '';

    colorOpcion1 = '#1ab23e';
    letraOpcion1 = 'S';

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _swalService: SwalAlertService,
        private _logActividadesService: PtllogActividadesService,
        private _localStorageService: LocalStorageService,
        private _requerimientoService: PTLRequerimientosTkService,
        private _ticketsService: PTLTicketsService
    ) {
        this.gradientConfig = GradientConfig;
        const regId = this._localStorageService.getObject<string>('regId') || ''
        this.tcId = regId;
        if (regId != '') {
            this.filtroTicketSubject.next(regId);
        }
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems$ = this._navigationService.menuItems$;
        this.hasFiltersSlot = true;
        this.consultarTickets();
        this.consultarRegistros();
        setTimeout(() => {
            this.setupRegistrosStream();
        }, 100);
        this.subscriptions.add(
            this._requerimientoService.cargarRegistros().subscribe(
                () => console.log('requerimientos cargados y guardados en el servicio'),
                (err) => console.error('Error al cargar requerimiento:', err)
            )
        );
    }

    columnasRegistros: ColumnMetadata[] = [
        {
            name: 'nombreRequerimiento',
            header: 'TICKETS.REQUERIMIENTOS.NOMBREREQUERIMIENTO',
            type: 'text'
        },
        {
            name: 'nomEstado',
            header: 'TICKETS.REQUERIMIENTOS.ESTADOREQUERIMIENTO',
            type: 'estado'
        }
    ];
    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'descripcionRequerimiento',
            header: 'TICKETS.REQUERIMIENTOS.DESCRICIONREQUERIMIENTO',
            type: 'text'
        },
        {
            name: 'nomTicket',
            header: 'TICKETS.REQUERIMIENTOS.NOMBRETICKET',
            type: 'text'
        }
    ];

    consultarRegistros() {
        this.subscriptions.add(
            this._requerimientoService.getRegistros().subscribe((resp: any) => {
                if (resp.ok) {
                    this.requerimiento = resp.requerimientos;
                    console.log('Todos los requerimientos', this.requerimiento);
                    return;
                }
            })
        );
    }

    consultarTickets() {
        this.ticketSub = this._ticketsService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.ticket = resp.tickets;
                        console.log('tickets:', this.ticket);
                    }
                }),
                catchError((err) => {
                    console.error('Error al consultar tickets:', err);
                    return of(null);
                })
            )
            .subscribe();
    }

    setupRegistrosStream(): void {
        this.suscPlataforma = this._localStorageService.getSuscriptorPlataformaLocalStorage();
        this.registrosTransformados$ = this._requerimientoService.requerimiento$.pipe(
            switchMap((requerimientos: PTLRequerimientoTKModel[]) => {
                if (!requerimientos) return of([]);
                this.requerimiento = requerimientos;
                const transformedApps = requerimientos.map((requerimiento: any) => {
                    requerimiento.nomEstado = Number(requerimiento.estadoRequerimiento) === 1 ? 'Activo' : 'Inactivo';
                    requerimiento.nomTicket = this.ticket.filter((x) => x.codigoTicket == requerimiento.codigoTicket)[0].nombreTicket || '';
                    return requerimiento as PTLRequerimientoTKModel;
                });
                this.registros = transformedApps;
                return of(transformedApps);
            }),
            catchError((err) => {
                console.error('Error en el stream de aplicaciones:', err);
                return of([]);
            })
        );
        this.registrosFiltrado$ = combineLatest([
            this.registrosTransformados$.pipe(startWith([])), // Usa la fuente de datos transformada
            this.filtroTicketSubject,
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([requerimientos, ticket, nombre, descripcion, estado]) => {
                // console.log('================== FILTROS', requerimientos);
                let filteredRegistros = requerimientos;
                if (ticket !== 'todos') {
                    filteredRegistros = filteredRegistros.filter((reg: any) => reg.codigoTicket === ticket);
                }
                if (nombre) {
                    filteredRegistros = filteredRegistros.filter((reg) => (reg.nombreRequerimiento?.toString() || '').toLowerCase().includes(nombre));
                }
                if (estado !== 'todos') {
                    filteredRegistros = filteredRegistros.filter((reg) => reg.estadoRequerimiento == estado);
                }
                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase();
                    filteredRegistros = filteredRegistros.filter((reg) => (reg.descripcionRequerimiento || '').toLowerCase().includes(textoFiltro));
                }
                return filteredRegistros;
            })
        );
    }

    OnViewRegistroClick(id: any) {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['tickets/gestion-requerimiento']);
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }

    OnNuevoRegistroClick() {
        // const codigoticketSeleccionado = this.filtroTicketSubject.value;
        this._localStorageService.setObject('regId', 'nuevo')
        this._localStorageService.setObject('tcId', this.tcId)
        this.router.navigate(['tickets/gestion-requerimiento']);
        // console.log('+++++ME MANDA EL ID DE NUEVO', codigoticketSeleccionado);
    }

    OnEditarRegistroClick(id: number): void {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['tickets/gestion-requerimiento']);
        // console.log('+++++ME MANDA EL ID', id);
    }

    OnEliminarRegistroClick(id: any): void {
        // console.log('+++ME TRAE EL ID???', id);

        Swal.fire({
            title: this.translate.instant('TICKETS.REQUERIMIENTOS.ELIMINARTITULO'),
            text: this.translate.instant('TICKETS.REQUERIMIENTOS.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then((result) => {
            if (result.isConfirmed) {
                this._requerimientoService.deleteEliminarRegistro(id.id).subscribe({
                    next: (resp: any) => {
                        this._swalService.getAlertSuccess(this.translate.instant('TICKETS.REQUERIMIENTOS.ELIMINAREXITOSA') + ', ' + resp.mensaje);
                        this.subscriptions.add(
                            this._requerimientoService.cargarRegistros().subscribe(
                                () => console.log('Requerimientos cargados y guardados en el servicio'),
                                (err) => console.error('Error al cargar los Requerimientos:', err)
                            )
                        );
                        this.setupRegistrosStream();
                    },
                    error: (err: any) => {
                        this._swalService.getAlertError(this.translate.instant('TICKETS.REQUERIMIENTOS.ELIMINARERROR') + ', ' + err);
                        console.error('Error eliminando', err);
                    }
                });
            }
        });
    }
    onTicketChangeClick(evento: any) {
        const value = evento.target.value;
        this.filtroTicketSubject.next(value);
    }

    onFiltroNombreChangeClick(evento: any) {
        const value = evento.target.value;
        this.filtroNombreSubject.next(value);
    }
    onFiltroDescripcionChangeClick(evento: any) {
        const value = evento.target.value;
        this.filtroDescripcionSubject.next(value);
    }

    onFiltroEstadoChangeClick(evento: any) {
        const value = evento.target.value;
        this.filtroEstadoSubject.next(value);
    }

    OnOption1Click(event: any) {
        console.log('ejecutando opcion 1 seguimientos', event, this.tcId);
        this._localStorageService.setObject('regId', event)
        this._localStorageService.setObject('tcId', this.tcId)
        this.router.navigate(['tickets/seguimientos']);
    }

    OnRegresarClick(event: any) {
        console.log('ejecutando opcion Regresar Requerimiento', event);
        this.router.navigate(['tickets/tickets']);
    }
}
