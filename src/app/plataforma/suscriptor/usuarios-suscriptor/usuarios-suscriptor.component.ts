import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, combineLatest, of } from 'rxjs';
import { map, startWith, catchError, tap, switchMap, filter } from 'rxjs/operators';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PTLUsuariosService } from 'src/app/theme/shared/service/ptlusuarios.service';
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { PTLSuscriptorModel } from 'src/app/theme/shared/_helpers/models/PTLSuscriptor.model';
import { GradientConfig } from 'src/app/app-config';
import { LocalStorageService } from 'src/app/theme/shared/service/local-storage.service';
import { DataTablesModule } from 'angular-datatables/src/angular-datatables.module';
import { PTLUsuarioSCModel } from 'src/app/theme/shared/_helpers/models/PTLUsuarioSC.model';
import { PtllogActividadesService } from 'src/app/theme/shared/service/ptllog-actividades.service';
import { SwalAlertService } from 'src/app/theme/shared/service/swal-alert.service';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { PTLSuscriptoresService, PtlusuariosScService } from 'src/app/theme/shared/service';
import { PTLUsuarioModel } from 'src/app/theme/shared/_helpers/models/PTLUsuario.model';

@Component({
    selector: 'app-usuarios-suscriptor',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, DatatableComponent, NavContentComponent, NavBarComponent],
    templateUrl: './usuarios-suscriptor.component.html',
    styleUrl: './usuarios-suscriptor.component.scss'
})
export class UsuariosSuscriptorComponent implements OnInit {

    @Output() toggleSidebar = new EventEmitter<void>();
    subscriptions = new Subscription();
    // Estado de la UI
    gradientConfig;
    hasFiltersSlot: boolean = false;
    menuItems!: Observable<NavigationItem[]>;
    activeTab: 'menu' | 'filters' | 'main' = 'menu';
    suscPlataforma: string = '';
    lang: string = localStorage.getItem('lang') || '';

    // Fuente de datos principal
    private usuariosSubject = new BehaviorSubject<any[]>([]);
    usuariosFiltrados$!: Observable<any[]>;

    // Subjects para filtros
    filtroSuscriptorSubject = new BehaviorSubject<string>('todos');
    filtroNombreSubject = new BehaviorSubject<string>('');
    filtroEstadoSubject = new BehaviorSubject<string>('todos');

    //#region VARIABLES
    registrosTransformados$: Observable<PTLUsuarioSCModel[]> = of([]);
    registrosFiltrado$: Observable<PTLUsuarioSCModel[]> = of([]);
    registros: PTLUsuarioSCModel[] = [];
    usuariosSC: PTLUsuarioSCModel[] = [];
    suscriptoresSub?: Subscription;
    suscriptores: PTLSuscriptorModel[] = [];
    usuarios: PTLUsuarioModel[] = [];
    stId: string = '';
    //#endregion VARIABLES

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _swalService: SwalAlertService,
        private _logActividadesService: PtllogActividadesService,
        private _usuariosService: PTLUsuariosService,
        private _usuariosSCService: PtlusuariosScService,
        private _suscriptoresService: PTLSuscriptoresService,
        private _navigationService: NavigationService,
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
        this.consultarUsuarios();
        this.consultarRegistros();
        setTimeout(() => {
            this.setupRegistrosStream();
        }, 100);
        this.subscriptions.add(
            this._usuariosSCService.cargarRegistros().subscribe(
                () => console.log('UsuariosSC cargados y guardados en el servicio'),
                (err) => console.error('Error al cargar los UsuariosSC:', err)
            )
        );

        // 2. Escuchar cambios en la URL
        // this.route.queryParams.subscribe((params) => {
        //   this.suscriptorId = params['suscriptorId'];
        //   if (this.suscriptorId) {
        //     this.cargarDatos();
        //   }
        // });

        // 3. Configurar el stream de filtrado (Esto corre una sola vez y reacciona a los cambios)
        // this.usuariosFiltrados$ = combineLatest([this.usuariosSubject, this.filtroNombreSubject, this.filtroEstadoSubject]).pipe(
        //   map(([usuarios, nombre, estado]) => {
        //     return usuarios.filter((u) => {
        //       const cumpleNombre = !nombre || (u.colCodigoUsuario || '').toLowerCase().includes(nombre.toLowerCase());
        //       const cumpleEstado = estado === 'todos' || String(u.estadoUsuario) === estado;
        //       return cumpleNombre && cumpleEstado;
        //     });
        //   })
        // );
    }

    columnasRegistros: ColumnMetadata[] = [
        {
            name: 'nomUsuario',
            header: 'SUSCRIPTOR.USUARIOSSUSCRIPTOR.NOMBREUSUARIOSUSCRIPTOR',
            type: 'text'
        },
        {
            name: 'nomEstado',
            header: 'SUSCRIPTOR.USUARIOSSUSCRIPTOR.ESTADOEUSUARIOSUSCRIPTOR',
            type: 'estado'
        }
    ];

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'nomSuscriptor',
            header: 'SUSCRIPTOR.USUARIOSSUSCRIPTOR.CODIGOSUSCRIPTOR',
            type: 'text'
        }
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

    consultarUsuarios() {
        this.subscriptions.add(
            this._usuariosService.getUsuarios().subscribe((resp: any) => {
                if (resp.ok) {
                    this.usuarios = resp.usuarios
                    console.log('Todos las usuarios', this.usuarios);
                    return
                }
            })
        )
    }

    consultarRegistros() {
        this.subscriptions.add(
            this._usuariosSCService.cargarRegistros().subscribe((resp: any) => {
                if (resp.ok) {
                    this.usuariosSC = resp.usuariosSC;
                    console.log('Todos los usuariosSC', this.usuariosSC);
                    return;
                }
            })
        );
    }

    setupRegistrosStream(): void {
        this.suscPlataforma = this._localStorageService.getSuscriptorPlataformaLocalStorage();
        this.registrosTransformados$ = this._usuariosSCService.usuariosSC$.pipe(
            switchMap((usuariosSC: PTLUsuarioSCModel[]) => {
                if (!usuariosSC) return of([]);
                this.usuariosSC = usuariosSC;
                const transformedApps = usuariosSC.map((usurioSC: any) => {
                    usurioSC.nomEstado = usurioSC.estadoUsuarioSC = true ? 'Activo' : 'Inactivo';
                    usurioSC.nomSuscriptor = this.suscriptores.filter((x) => x.codigoSuscriptor == usurioSC.codigoSuscriptor)[0].nombreSuscriptor || '';
                    usurioSC.nomUsuario = this.usuarios.filter((x) => x.codigoUsuario == usurioSC.codigoUsuario)[0].nombreUsuario || '';
                    return usurioSC as PTLUsuarioSCModel;
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
            this.registrosTransformados$.pipe(startWith([])),
            this.filtroSuscriptorSubject,
            this.filtroNombreSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([usurioSC, suscriptor, nombre, estado]) => {
                console.log('================== FILTROS', usurioSC);
                let filteredRegistros = usurioSC;
                if (suscriptor !== 'todos') {
                    filteredRegistros = filteredRegistros.filter((reg: any) => reg.codigoSuscriptor === suscriptor);
                }
                if (nombre) {
                    filteredRegistros = filteredRegistros.filter((reg) => (reg.nombreUsuario?.toString() || '').toLowerCase().includes(nombre));
                }
                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true';
                    filteredRegistros = filteredRegistros.filter((reg) => reg.estadoUsuarioSC === estadoBoolean);
                }
                return filteredRegistros;
            })
        );
    }

    //   cargarDatos() {
    //     this._usuariosService.obtenerUsuariosPorSuscriptor(this.suscriptorId).subscribe({
    //       next: (res: any) => {
    //         // 1. Extraer la lista según la estructura que envía tu API de Node (usualmente res.usuariosSC)
    //         let lista: any[] = [];

    //         if (res && res.ok && Array.isArray(res.usuariosSC)) {
    //           lista = res.usuariosSC;
    //         } else if (Array.isArray(res)) {
    //           lista = res;
    //         }

    //         // 2. Mapeo riguroso hacia la interfaz de la tabla
    //         const datosMapeados = lista.map((u: any) => {
    //           return {
    //             ...u,
    //             // 'idParaTabla' debe ser la llave primaria para que funcionen editar/eliminar
    //             idParaTabla: u.codigoUsuarioSC,

    //             // Mapeo de columnas basado en tu array 'columnasUsuarios'
    //             colCodigoUsuario: u.codigoUsuario,
    //             colCodigoUsuarioSC: u.codigoUsuarioSC,

    //             // Manejo del estado para el pipe/tipo 'estado' de tu datatable
    //             nomEstado: u.estadoUsuario === true || u.estadoUsuario === 1 ? 'Activo' : 'Inactivo'
    //           };
    //         });

    //         this.usuariosSubject.next(datosMapeados);
    //       },
    //       error: (err) => {
    //         console.error('Error al traer usuarios:', err);
    //         this.usuariosSubject.next([]);
    //       }
    //     });
    //   }

    // columnasUsuarios = [
    //     { name: 'colCodigoUsuarioSC', header: 'USUARIOS.CODIGO_SC', type: 'text' },
    //     { name: 'colCodigoUsuario', header: 'USUARIOS.CODIGO_USUARIO', type: 'text' },
    //     { name: 'nomEstado', header: 'PLATAFORMA.STATUS', type: 'estado' }
    // ];

    // --- Eventos de Interfaz ---

    onFiltroSuscriptorChangeClick(evento: any) {
        const value = evento.target.value;
        this.filtroSuscriptorSubject.next(value);
    }

    onFiltroNombreChangeClick(evento: any) {
        const value = evento.target.value;
        this.filtroNombreSubject.next(value);
    }

    onFiltroEstadoChangeClick(evento: any) {
        const value = evento.target.value;
        this.filtroEstadoSubject.next(value);
    }

    OnNuevoRegistroClick() {
        this.router.navigate(['suscriptor/gestion-usuario-suscriptor'], { queryParams: { regId: 'nuevo', stId: this.stId } });
    }

    OnEditarRegistroClick(event: any) {
        const id = event.id || event;
        this.router.navigate(['/suscriptor/gestion-usuario-suscriptor'], { queryParams: { regId: id } });
    }

    OnEliminarRegistroClick(event: any) {
        console.log('Eliminar usuario:', event.id || event);
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }

    OnRegresarClick(event: any) {
        console.log('ejecutando opcion Regresar Suscriptor', event);
        this.router.navigate(['suscriptor/suscriptores']);
    }
}
