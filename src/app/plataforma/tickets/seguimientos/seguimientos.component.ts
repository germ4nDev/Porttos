/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataTablesModule } from 'angular-datatables';
import { Subscription, tap, catchError, of, Observable, BehaviorSubject, switchMap, combineLatest, startWith, map } from 'rxjs';
import { PTLSeguimientoTKModel } from 'src/app/theme/shared/_helpers/models/PTLSeguimientoTK.model';
import {
    LocalStorageService,
    NavigationService,
    PtllogActividadesService,
    PTLRequerimientosTkService,
    PTLTicketsService,
    SwalAlertService,
    UploadFilesService
} from 'src/app/theme/shared/service';
import { PTLSeguimientosTKService } from 'src/app/theme/shared/service/ptlseguimientos-tk.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { GradientConfig } from 'src/app/app-config';
import { PTLEstadosService } from 'src/app/theme/shared/service/ptlestados.service';
import { PTLRequerimientoTKModel } from 'src/app/theme/shared/_helpers/models/PTLRequerimientoTK.model';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { PTLEstadoModel } from 'src/app/theme/shared/_helpers/models/PTLEstado.model';
import Swal from 'sweetalert2';

import { environment } from 'src/environments/environment';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
const base_url = environment.apiUrl;

@Component({
    selector: 'app-seguimientos',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
    templateUrl: './seguimientos.component.html',
    styleUrl: './seguimientos.component.scss'
})
export class SeguimientosComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>();

    //#region VARIABLES
    subscriptions = new Subscription();
    filtroTicketSubject = new BehaviorSubject<string>('todos');
    filtroRequerimientoSubject = new BehaviorSubject<string>('todos');
    filtroNombreSubject = new BehaviorSubject<string>('');
    filtroDescripcionSubject = new BehaviorSubject<string>('');
    filtroEstadoSubject = new BehaviorSubject<string>('todos');

    registrosTransformados$: Observable<PTLSeguimientoTKModel[]> = of([]);
    registrosFiltrado$: Observable<PTLSeguimientoTKModel[]> = of([]);
    seguimiento: PTLSeguimientoTKModel[] = [];
    registros: PTLSeguimientoTKModel[] = [];

    registrosSub?: Subscription;
    requerimientoSub?: Subscription;
    requerimiento: PTLRequerimientoTKModel[] = [];
    estadosSeguimientoSub?: Subscription;
    estadosSeguimiento: PTLEstadoModel[] = [];
    lang: string = localStorage.getItem('lang') || '';
    tituloPagina: string = '';
    codigoRegistro: string = '';
    codigoTicket: string = '';

    gradientConfig;
    hasFiltersSlot: boolean = false;
    menuItems!: Observable<NavigationItem[]>;
    activeTab: 'menu' | 'filters' | 'main' = 'menu';
    suscPlataforma: string = '';
    tipoEstado: string = '';
    //#endregion VARIABLES

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _seguimientosService: PTLSeguimientosTKService,
        private _requerimientoService: PTLRequerimientosTkService,
        private _ticketsService: PTLTicketsService,
        private _swalService: SwalAlertService,
        private _uploadService: UploadFilesService,
        private _logActividadesService: PtllogActividadesService,
        private _localStorageService: LocalStorageService,
        private _estadosSeguimientoService: PTLEstadosService
    ) {
        this.gradientConfig = GradientConfig;
        this.suscPlataforma = this._localStorageService.getSuscriptorPlataformaLocalStorage();
        const regId = this._localStorageService.getObject<string>('regId') || ''
        this.codigoTicket = this._localStorageService.getObject<string>('tcId') || ''
        if (regId != '') {
            this.filtroRequerimientoSubject.next(regId);
        }
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems = this._navigationService.menuItems$;
        this.hasFiltersSlot = true;
        this.consultarEstadosSeguimiento();
        this.consultarRequerimientos();
        this.consultarRegistros();
        setTimeout(() => {
            this.setupRegistrosStream();
        }, 100);
        this.subscriptions.add(
            this._seguimientosService.cargarRegistros().subscribe(
                () => console.log('Seguimientos cargados y guardados en el servicio'),
                (err) => console.error('Error al cargar Seguimientos:', err)
            )
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    columnasRegistros: ColumnMetadata[] = [
        {
            name: 'fechaSeguimiento',
            header: 'TICKETS.SEGUIMIENTOS.FECHASEGUIMIENTO',
            type: 'date'
        },
        {
            name: 'estadoSeguimiento',
            header: 'TICKETS.SEGUIMIENTOS.STATUS',
            type: 'estado'
        },
        {
            name: 'nombreSeguimiento',
            header: 'TICKETS.SEGUIMIENTOS.NOMBRESEGUIMIENTO',
            type: 'text'
        }
    ];

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'codigoRequerimiento',
            header: 'TICKETS.SEGUIMIENTOS.CODIGOREQUERIMIENTO',
            type: 'text'
        },
        {
            name: 'nomRequerimiento',
            header: 'TICKETS.SEGUIMIENTOS.NOMBREREQUERIMIENTO',
            type: 'text'
        },
        {
            name: 'descripcionSeguimiento',
            header: 'TICKETS.SEGUIMIENTOS.DESCRIPCIONSEGUIMIENTO',
            type: 'text'
        },
        {
            name: 'captura',
            header: 'TICKETS.SEGUIMIENTOS.CAPTURASEGUIMIENTO',
            type: 'capture'
        }
    ];

    consultarRequerimientos() {
        this.registrosSub = this._requerimientoService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        console.log('requerimiento', resp);
                        this.requerimiento = resp.requerimientos;
                        return;
                    }
                }),
                catchError((err) => {
                    console.log('Ha ocurrido un error', err);
                    return of(null);
                })
            )
            .subscribe();
    }

    consultarRegistros() {
        this.subscriptions.add(
            this._seguimientosService.getRegistros().subscribe((resp: any) => {
                if (resp.ok) {
                    this.seguimiento = resp.seguimientos;
                    console.log('Todos los seguimientos', this.seguimiento);
                    return;
                }
            })
        );
    }

    setupRegistrosStream(): void {
        this.suscPlataforma = this._localStorageService.getSuscriptorPlataformaLocalStorage();
        this.registrosTransformados$ = this._seguimientosService.seguimiento$.pipe(
            switchMap((seguimientos: PTLSeguimientoTKModel[]) => {
                if (!seguimientos) return of([]);
                this.seguimiento = seguimientos;
                const transformedApps = seguimientos.map((seguimiento: any) => {
                    console.log('datos del seguimiento', seguimiento);
                    console.log('todos los requerimiento', this.requerimiento);
                    seguimiento.nomRequerimiento =
                        this.requerimiento.filter((x) => x.codigoRequerimiento == seguimiento.codigoRequerimiento)[0].nombreRequerimiento || '';
                    seguimiento.captura = `${base_url}/upload/seguimientos/${seguimiento.capturaSeguimiento}`;
                    return seguimiento as PTLSeguimientoTKModel;
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
            this.filtroRequerimientoSubject,
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([seguimientos, requerimiento, nombre, descripcion, estado]) => {
                // console.log('================== roles 2', seguimientos);
                let filteredRegistros = seguimientos;
                if (requerimiento !== 'todos') {
                    filteredRegistros = filteredRegistros.filter((reg: any) => reg.codigoRequerimiento === requerimiento);
                }
                if (nombre) {
                    filteredRegistros = filteredRegistros.filter((reg) => (reg.nombreSeguimiento?.toString() || '').toLowerCase().includes(nombre));
                }
                if (estado !== 'todos') {
                    filteredRegistros = filteredRegistros.filter((reg) => {
                        // Obtenemos el valor de la base de datos y lo pasamos a minúsculas
                        const estadoReg = (reg.estadoSeguimiento?.toString() || '').toLowerCase();
                        // Pasamos el valor del filtro también a minúsculas para asegurar coincidencia
                        const estadoFiltro = estado.toLowerCase();
                        return estadoReg === estadoFiltro;
                    });
                }
                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase();
                    filteredRegistros = filteredRegistros.filter((reg) => (reg.descripcionSeguimiento || '').toLowerCase().includes(textoFiltro));
                }
                return filteredRegistros;
            })
        );
    }

    consultarEstadosSeguimiento() {
        this.estadosSeguimientoSub = this._estadosSeguimientoService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.estadosSeguimiento = resp.estados;
                        console.log('Estados:', this.estadosSeguimiento);
                    }
                }),
                catchError((err) => {
                    console.error('Error al consultar estados:', err);
                    return of(null);
                })
            )
            .subscribe();
    }

    OnBackRegistroClick() {
        this._localStorageService.setObject('regId', this.codigoTicket)
        this.router.navigate(['/tickets/requerimientos/']);
    }

    OnNuevoRegistroClick() {
        const codigoRequerimientoSeleccionado = this.filtroRequerimientoSubject.value;
        this._localStorageService.setObject('regId', 'nuevo')
        this._localStorageService.setObject('codReq', codigoRequerimientoSeleccionado)
        this.router.navigate(['tickets/gestion-seguimiento']);
    }

    OnEditarRegistroClick(id: string) {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['tickets/gestion-seguimiento']);
    }

    OnEliminarRegistroClick(id: any) {
        const seguimiento = this.seguimiento.filter((x) => x.codigoSeguimiento == id.id)[0];
        Swal.fire({
            title: this.translate.instant('TICKETS.SEGUIMIENTOS.ELIMINARTITULO'),
            //   text: this.translate.instant('TICKETS.SEGUIMIENTOS.ELIMINARTEXTO') + `"${seguimiento.nombreSeguimiento}".`,
            html: `
        <div style="margin-bottom: 10px;">
            ${this.translate.instant('TICKETS.SEGUIMIENTOS.ELIMINARTEXTO')}
        </div>
        <small><b>"${seguimiento.nombreSeguimiento}"</b></small>
        `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then((result: any) => {
            if (result.isConfirmed) {
                this._seguimientosService.deleteEliminarRegistro(id.id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('TICKETS.SEGUIMIENTOS.ELIMINAREXITOSA') + ' ' + resp.mensaje
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        const segui = this.registros.filter((x) => x.codigoSeguimiento == id.id)[0];
                        console.log('========== datos del segui', segui);
                        if (segui.capturaSeguimiento != 'no-imagen.png') {
                            const captura = segui.capturaSeguimiento || '';
                            console.log('========== eliminar captura', captura);
                            //   this._uploadService.deleteFilePath('0', 'seguimientos', captura).subscribe((data: any) => {
                            //     console.log('mensaje', data.mensaje);
                            //   });
                        }
                        this._seguimientosService.cargarRegistros().subscribe(() => {
                            this._swalService.getAlertSuccess(this.translate.instant('TICKETS.SEGUIMIENTOS.ELIMINAREXITOSA'));
                        });
                    },
                    error: (err: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('SEGUIMIENTOS.ELIMINARERROR') + ' ' + err.mensaje
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        this._swalService.getAlertError(this.translate.instant('SEGUIMIENTOS.ELIMINARERROR') + ' ' + err.mensaje);
                        console.error('Error eliminando', err);
                    }
                });
            }
        });
    }

    actualizarEstadoTicket() {
        const segIndice = this.obtenerUltimoEstado(this.registros);
        if (segIndice != -1) {
            const seguimiento = this.registros[segIndice];
            const codigoTicket = seguimiento.codigoTicket || '';
            const estado = seguimiento.estadoTicket || '';
            this._ticketsService.getRegistroById(codigoTicket).subscribe((tic: any) => {
                const ticket = tic.ticket;
                ticket.estadoTicket = estado;
                this._ticketsService.putModificarRegistro(ticket).subscribe(() => console.log('ticket actualizado'));
            });
        }
    }

    obtenerUltimoEstado(regs: PTLSeguimientoTKModel[]): number {
        if (regs.length === 0) {
            return -1;
        }
        const registrosOrdenados = [...regs];
        registrosOrdenados.sort((a, b) => {
            const dateA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : null;
            const dateB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : null;
            if (dateA && dateB) {
                return dateB - dateA;
            }
            if (!dateA && dateB) {
                return 1;
            }
            if (dateA && !dateB) {
                return -1;
            }
            return 0;
        });
        const seguimientoMasReciente = registrosOrdenados[0];
        if (!seguimientoMasReciente.fechaCreacion) {
            return -1;
        }
        const segIndice = this.registros.findIndex((r) => r === seguimientoMasReciente);
        return segIndice;
    }

    onRequerimientoChangeClick(evento: any) {
        const value = evento.target.value;
        this.filtroRequerimientoSubject.next(value);
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

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
