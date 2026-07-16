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
    LocalStorageService
} from 'src/app/theme/shared/service';
import { environment } from 'src/environments/environment';

const base_url = environment.apiUrl;
import Swal from 'sweetalert2';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of, startWith, Subscription, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { GradientConfig } from 'src/app/app-config';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { PTLClaseTicketModel } from 'src/app/theme/shared/_helpers/models/PTLClaseTicket.model';
import { PtlclasesticketService } from 'src/app/theme/shared/service/ptlclasesticket.service';


@Component({
    selector: 'app-clases-ticket',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, DatatableComponent, NavContentComponent, NavBarComponent],
    templateUrl: './clases-ticket.component.html',
    styleUrl: './clases-ticket.component.scss'
})
export class ClasesTicketComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>();
    //#region VARIABLES

    subscriptions = new Subscription();
    filtroNombreSubject = new BehaviorSubject<string>('');
    filtroDescripcionSubject = new BehaviorSubject<string>('');
    filtroEstadoSubject = new BehaviorSubject<string>('todos');

    registrosTransformados$: Observable<PTLClaseTicketModel[]> = of([]);
    registrosFiltrado$: Observable<PTLClaseTicketModel[]> = of([]);
    clasesTicket: PTLClaseTicketModel[] = [];
    registros: PTLClaseTicketModel[] = [];

    lang: string = localStorage.getItem('lang') || '';
    tituloPagina: string = '';
    codigoRegistro: string = '';
    //#endregion VARIABLES
    gradientConfig;
    hasFiltersSlot: boolean = false;
    menuItems$!: Observable<NavigationItem[]>;
    activeTab: 'menu' | 'filters' | 'main' = 'menu';
    suscPlataforma: string = '';

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _swalService: SwalAlertService,
        private _logActividadesService: PtllogActividadesService,
        private _localStorageService: LocalStorageService,
        private _clasesTicket: PtlclasesticketService
    ) {
        this.gradientConfig = GradientConfig;
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems$ = this._navigationService.menuItems$;
        this.hasFiltersSlot = true;
        this.consultarRegistros();
        setTimeout(() => {
            this.setupRegistrosStream();
        }, 100);
        this.subscriptions.add(
            this._clasesTicket.cargarRegistros().subscribe(
                () => console.log('clasesTickets cargados y guardados en el servicio'),
                (err) => console.error('Error al cargar clasesTicket:', err)
            )
        );
    }
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    columnasRegistros: ColumnMetadata[] = [
        {
            name: 'claseTicket',
            header: 'TICKETS.CLASESTICKET.NOMBRECLASE',
            type: 'text'
        },
        {
            name: 'descripcionClase',
            header: 'TICKETS.CLASESTICKET.DESCRIPCIONCLASE',
            type: 'text'
        },
        {
            name: 'estadoClase',
            header: 'TICKETS.CLASESTICKET.ESTADOCLASE',
            type: 'estado'
        }
    ];
    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'descripcionClase',
            header: 'TICKETS.CLASESTICKET.DESCRIPCIONCLASE',
            type: 'text'
        },
    ];

    consultarRegistros() {
        this.subscriptions.add(
            this._clasesTicket.getRegistros().subscribe((resp: any) => {
                if (resp.ok) {
                    this.clasesTicket = resp.clasesTicket;
                    console.log('Todos las clasesTicket', this.clasesTicket);
                    return;
                }
            })
        );
    }

    setupRegistrosStream(): void {
        this.suscPlataforma = this._localStorageService.getSuscriptorPlataformaLocalStorage();
        this.registrosTransformados$ = this._clasesTicket.clasesTicket$.pipe(
            switchMap((clasesTickets: PTLClaseTicketModel[]) => {
                if (!clasesTickets) return of([]);
                this.clasesTicket = clasesTickets;
                const transformedApps = clasesTickets.map((clasesTicket: any) => {
                    return clasesTicket as PTLClaseTicketModel;
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
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([clasesTickets, nombre, descripcion, estado]) => {
                // console.log('================== roles 2', clasesTickets);
                let filteredRegistros = clasesTickets;
                if (nombre) {
                    filteredRegistros = filteredRegistros.filter((reg) => (reg.claseTicket?.toString() || '').toLowerCase().includes(nombre));
                }
                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true';
                    filteredRegistros = filteredRegistros.filter((reg) => reg.estadoClase === estadoBoolean);
                }
                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase();
                    filteredRegistros = filteredRegistros.filter((reg) => (reg.descripcionClase || '').toLowerCase().includes(textoFiltro));
                }
                return filteredRegistros;
            })
        );
    }

    OnViewRegistroClick(id: any) {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['tickets/gestion-clases-ticket']);
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }

    OnNuevoRegistroClick() {
        this.router.navigate(['tickets/gestion-clases-ticket']);

    }

    OnEditarRegistroClick(id: number): void {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['tickets/gestion-clases-ticket']);
        // console.log('+++++ME MANDA EL ID', id);

    }

    OnEliminarRegistroClick(id: any): void {
        // console.log('+++ME TRAE EL ID???', id);

        Swal.fire({
            title: this.translate.instant('TICKETS.CLASESTICKET.ELIMINARTITULO'),
            text: this.translate.instant('TICKETS.CLASESTICKET.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then((result) => {
            if (result.isConfirmed) {
                this._clasesTicket.deleteEliminarRegistro(id.id).subscribe({
                    next: (resp: any) => {
                        this._swalService.getAlertSuccess(this.translate.instant('TICKETS.CLASESTICKET.ELIMINAREXITOSA') + ', ' + resp.mensaje);
                        this.subscriptions.add(
                            this._clasesTicket.cargarRegistros().subscribe(
                                () => console.log('Clases cargados y guardados en el servicio'),
                                (err) => console.error('Error al cargar las clases:', err)
                            )
                        );
                        this.setupRegistrosStream();
                    },
                    error: (err: any) => {
                        this._swalService.getAlertError(this.translate.instant('TICKETS.CLASESTICKET.ELIMINARERROR') + ', ' + err);
                        console.error('Error eliminando', err);
                    }
                });
            }
        });
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
}
