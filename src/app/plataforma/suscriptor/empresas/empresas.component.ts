/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataTablesModule } from 'angular-datatables';
import { Subscription, tap, catchError, of, Observable, BehaviorSubject, startWith, combineLatest, switchMap, map } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { GradientConfig } from 'src/app/app-config';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { PTLUsuarioModel } from 'src/app/theme/shared/_helpers/models/PTLUsuario.model';
import {
    NavigationService,
    PtllogActividadesService,
    SwalAlertService,
    LocalStorageService,
    PTLSuscriptoresService,
    PtlEmpresasScService
} from 'src/app/theme/shared/service';
import { environment } from 'src/environments/environment';

const base_url = environment.apiUrl;
import Swal from 'sweetalert2';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { PTLEmpresaSCModel } from 'src/app/theme/shared/_helpers/models/PTLEmpresaSC.model';
import { PTLSuscriptorModel } from '../../../theme/shared/_helpers/models/PTLSuscriptor.model';

@Component({
    selector: 'app-empresas',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, DatatableComponent, NavContentComponent, NavBarComponent],
    templateUrl: './empresas.component.html',
    styleUrl: './empresas.component.scss'
})
export class EmpresasComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>();

    subscriptions = new Subscription();
    // Subjects para filtros
    filtroSuscriptorSubject = new BehaviorSubject<string>('todos');
    filtroNombreSubject = new BehaviorSubject<string>('');
    filtroDescripcionSubject = new BehaviorSubject<string>('');
    filtroEstadoSubject = new BehaviorSubject<string>('todos');

    //#region VARIABLES
    registrosTransformados$: Observable<PTLEmpresaSCModel[]> = of([]);
    registrosFiltrado$: Observable<PTLEmpresaSCModel[]> = of([]);
    empresaSC: PTLEmpresaSCModel[] = [];
    registros: PTLEmpresaSCModel[] = [];
    lang: string = localStorage.getItem('lang') || '';
    registrosSub?: Subscription;
    usuariosSub?: Subscription;
    suscriptoresSub?: Subscription;
    suscriptores: PTLSuscriptorModel[] = [];
    usuarios: PTLUsuarioModel[] = [];
    tituloPagina: string = '';
    stId: string = '';
    //#endregion VARIABLES
    gradientConfig;
    hasFiltersSlot: boolean = false;
    menuItems!: Observable<NavigationItem[]>;
    activeTab: 'menu' | 'filters' | 'main' = 'menu';
    suscPlataforma: string = '';

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _swalService: SwalAlertService,
        private _logActividadesService: PtllogActividadesService,
        private _empresasScService: PtlEmpresasScService,
        private _suscriptoresService: PTLSuscriptoresService,
        private _localStorageService: LocalStorageService
    ) {
        this.gradientConfig = GradientConfig;
        this.route.queryParams.subscribe((params) => {
            const regId = params['regId'];
            this.stId = regId;
            if (regId) {
                this.filtroSuscriptorSubject.next(regId);
            }
        });
        this.suscPlataforma = this._localStorageService.getSuscriptorPlataformaLocalStorage();
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems = this._navigationService.menuItems$;
        this.hasFiltersSlot = true;
        this.consultarSuscriptores();
        this.consultarRegistros();
        setTimeout(() => {
            this.setupRegistrosStream();
        }, 100);
        this.subscriptions.add(
            this._empresasScService.cargarRegistros().subscribe(
                () => console.log('Empresas cargadas y guardadas en el servicio'),
                (err) => console.error('Error al cargar la Empresa:', err)
            )
        );
    }

    columnasRegistros: ColumnMetadata[] = [
        {
            name: 'nombreEmpresa',
            header: 'SUSCRIPTOR.EMPRESAS.NOMBREEMPRESA',
            type: 'text'
        },
        {
            name: 'nomEstado',
            header: 'SUSCRIPTOR.EMPRESAS.ESTADOEMPRESA',
            type: 'estado'
        }
    ];

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'codigoEmpresaSC',
            header: 'SUSCRIPTOR.EMPRESAS.CODIGOEMPRESA',
            type: 'text'
        },
        {
            name: 'nomSuscriptor',
            header: 'SUSCRIPTOR.EMPRESAS.CODIGOSUSCRIPTOR',
            type: 'text'
        },
        {
            name: 'descripcionEmpresa',
            header: 'SUSCRIPTOR.EMPRESAS.DESCRIPCION',
            type: 'text'
        },
    ];

    consultarSuscriptores() {
        this.suscriptoresSub = this._suscriptoresService
            .getSuscriptores()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.suscriptores = resp.suscriptores;
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
            this._empresasScService.getTodasEmpresaById().subscribe((resp: any) => {
                if (resp.ok) {
                    this.empresaSC = resp.empresasSC;
                    console.log('Todos las empresasSC', this.empresaSC);
                    return;
                }
            })
        );
    }

    setupRegistrosStream(): void {
        this.suscPlataforma = this._localStorageService.getSuscriptorPlataformaLocalStorage();
        this.registrosTransformados$ = this._empresasScService.empresasSC$.pipe(
            switchMap((empresas: PTLEmpresaSCModel[]) => {
                if (!empresas) return of([]);
                this.empresaSC = empresas;
                const transformedApps = empresas.map((empresa: any) => {
                    empresa.nomEstado = empresa.estadoEmpresa = true ? 'Activo' : 'Inactivo';
                    empresa.nomSuscriptor = this.suscriptores.filter((x) => x.codigoSuscriptor == empresa.codigoSuscriptor)[0].nombreSuscriptor || '';
                    return empresa as PTLEmpresaSCModel;
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
            this.filtroSuscriptorSubject,
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([empresas, suscriptor, nombre, descripcion, estado]) => {
                console.log('================== FILTROS', empresas);
                let filteredRegistros = empresas;
                if (suscriptor !== 'todos') {
                    filteredRegistros = filteredRegistros.filter((reg: any) => reg.codigoSuscriptor === suscriptor);
                }
                if (nombre) {
                    filteredRegistros = filteredRegistros.filter((reg) => (reg.nombreEmpresa?.toString() || '').toLowerCase().includes(nombre));
                }
                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase();
                    filteredRegistros = filteredRegistros.filter((reg) => (reg.descripcionEmpresa || '').toLowerCase().includes(textoFiltro));
                }
                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true';
                    filteredRegistros = filteredRegistros.filter((reg) => reg.estadoEmpresa === estadoBoolean);
                }
                return filteredRegistros;
            })
        );
    }

    onFiltroSuscriptorChangeClick(evento: any) {
        const value = evento.target.value;
        this.filtroSuscriptorSubject.next(value);
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

    OnNuevoRegistroClick() {
        this.router.navigate(['suscriptor/gestion-empresa'], { queryParams: { regId: 'nuevo', stId: this.stId } });
        // console.log('+++++ME MANDA EL ID en NUEVO', { queryParams: { regId: 'nuevo', stId: this.stId }});
    }

    OnEditarRegistroClick(id: number) {
        this.router.navigate(['suscriptor/gestion-empresa'], { queryParams: { regId: id } });
        // console.log('+++++ME MANDA EL ID', id);
    }

    OnEliminarRegistroClick(id: any) {
        const empresa = this.empresaSC.filter((x) => x.codigoEmpresaSC == id.id)[0];
        console.log('empresa', empresa);
        const titulo = this.translate.instant('SUSCRIPTOR.EMPRESAS.ELIMINARTITULO');
        const confirmText = this.translate.instant('PLATAFORMA.DELETE');
        const cancelText = this.translate.instant('PLATAFORMA.CANCEL');
        const htmlBody = `
        <div style="margin-bottom: 10px;">
            ${this.translate.instant('SUSCRIPTOR.EMPRESAS.ELIMINARTEXTO')}
        </div>
        <small><b>"${empresa?.nombreEmpresa}"</b></small>
    `;
        // this._swalService.getAlertConfirmDelete(titulo, htmlBody, confirmText, cancelText)
        //     .then((confirmado) => {
        //         if (confirmado) {
        //             console.log('id', id.id);
        //             this._empresasScService.eliminarEmpresa(empresa.codigoEmpresaSC || '').subscribe({
        //                 next: (resp: any) => {
        //                     const logData = {
        //                         codigoTipoLog: '',
        //                         codigoRespuesta: '201',
        //                         descripcionLog: this.translate.instant('SUSCRIPTOR.EMPRESAS.ELIMINAREXITOSA') + ' ' + resp.mensaje
        //                     };
        //                     this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
        //                     this._swalService.getAlertSuccess(this.translate.instant('SUSCRIPTOR.EMPRESAS.ELIMINAREXITOSA') + ' ' + resp.mensaje);
        //                     this.subscriptions.add(
        //                     this._empresasScService.cargarRegistros().subscribe(
        //                             () => console.log('Empresas cargadas y guardadas en el servicio'),
        //                             (err) => console.error('Error al cargar las Empresas:', err)
        //                         )
        //                     );
        //                 },
        //                 error: (err: any) => {
        //                     const logData = {
        //                         codigoTipoLog: '',
        //                         codigoRespuesta: '501',
        //                         descripcionLog: this.translate.instant('SUSCRIPTOR.EMPRESAS.ELIMINARERROR') + ' ' + err.mensaje
        //                     };
        //                     this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
        //                     this._swalService.getAlertError(this.translate.instant('SUSCRIPTOR.EMPRESAS.ELIMINARERROR') + ' ' + err.mensaje);
        //                     console.error('Error eliminando', err);
        //                 }
        //             });
        //         }
        //     });
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }

    OnRegresarClick(event: any) {
        console.log('ejecutando opcion Regresar Suscriptor', event);
        this.router.navigate(['suscriptor/suscriptores']);
    }
}
