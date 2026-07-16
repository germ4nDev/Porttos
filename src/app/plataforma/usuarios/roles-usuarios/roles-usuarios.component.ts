/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
//#region IMPORTS
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GradientConfig } from 'src/app/app-config'
import { Router } from '@angular/router'
import { BehaviorSubject, catchError, combineLatest, map, Observable, startWith, switchMap } from 'rxjs'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { TranslateModule } from '@ngx-translate/core'
import { TranslateService } from '@ngx-translate/core'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import {
    NavigationService,
    PtlAplicacionesService,
    LanguageService,
    PtlusuariosRolesApService,
    PtlSuitesAPService,
    PTLUsuariosService
} from 'src/app/theme/shared/service'
import { of, Subscription } from 'rxjs'
import Swal from 'sweetalert2'
import { PtllogActividadesService, PTLRolesAPService, SwalAlertService } from 'src/app/theme/shared/service'
import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model'
import { PTLRoleAPModel } from 'src/app/theme/shared/_helpers/models/PTLRoleAP.model'
import { PTLUsuarioModel } from 'src/app/theme/shared/_helpers/models/PTLUsuario.model'
import { PTLUsuarioRoleAPModel } from 'src/app/theme/shared/_helpers/models/PTLUsuarioRole.model'
import { DataLoaderComponent } from 'src/app/theme/shared/components/data-loader/data-loader.component'
//#endregion IMPORTS

@Component({
    selector: 'app-roles',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent, DataLoaderComponent],
    templateUrl: './roles-usuarios.component.html',
    styleUrl: './roles-usuarios.component.scss'
})
export class RolesUsuariosComponent implements OnInit {
    //#region VARIABLES
    @Output() toggleSidebar = new EventEmitter<void>()
    DataModel: BaseSessionModel = new BaseSessionModel()
    DataLogActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()
    moduloTituloExcel: string = ''
    hasFiltersSlot: boolean = false
    gradientConfig
    lang = localStorage.getItem('lang')
    menuItems$!: Observable<NavigationItem[]>
    activeTab: 'menu' | 'filters' | 'main' = 'menu'
    tituloPagina: string = ''

    subscriptions = new Subscription()
    filtroCodigoRoleSubject = new BehaviorSubject<string>('todos')
    filtroCodigoUsuariosRolesSubject = new BehaviorSubject<string>('todos')
    filtroEstadoSubject = new BehaviorSubject<string>('todos')
    filtroTipoRolSubject = new BehaviorSubject<string>('todos')

    registrosTransformados$: Observable<PTLUsuarioRoleAPModel[]> = of([])
    registrosFiltrado$: Observable<PTLUsuarioRoleAPModel[]> = of([])
    usuariosRoles: PTLUsuarioRoleAPModel[] = []
    roles: PTLRoleAPModel[] = []
    usuarios: PTLUsuarioModel[] = []
    registros: PTLUsuarioRoleAPModel[] = []
    aplicaciones: PTLAplicacionModel[] = []
    suites: PTLSuiteAPModel[] = []
    //#endregion VARIABLES

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _aplicacionesService: PtlAplicacionesService,
        private _usuariosRolesService: PtlusuariosRolesApService,
        private _usuariosService: PTLUsuariosService,
        private _rolesAPService: PTLRolesAPService,
        private _suitesService: PtlSuitesAPService,
        private _logActividadesService: PtllogActividadesService,
        private _swalService: SwalAlertService,
        private _languageService: LanguageService
    ) {
        this.gradientConfig = GradientConfig
    }

    ngOnInit() {
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        this.hasFiltersSlot = true
        this.consultarAplicaciones()
        this.consultarSuites()
        this.consultarUsuarios()
        this.consultarRoles()
        setTimeout(() => {
            this.setupRolesStream()
        }, 100)
        this.subscriptions.add(
            this._usuariosRolesService.cargarRegistros().subscribe(
                () => console.log('Roles cargados y guardados en el servicio'),
                err => console.error('Error al cargar roles:', err)
            )
        )
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe()
    }

    consultarUsuarios() {
        this.subscriptions.add(
            this._usuariosService.getUsuarios().subscribe((resp: any) => {
                if (resp.ok) {
                    this.usuarios = resp.usuarios
                    //   console.log('Todos las usuarios', this.usuarios);
                    return
                }
            })
        )
    }

    consultarAplicaciones() {
        this.subscriptions.add(
            this._aplicacionesService.getAplicaciones().subscribe((resp: any) => {
                if (resp.ok) {
                    this.aplicaciones = resp.aplicaciones
                    //   console.log('Todos las aplicaciones', this.aplicaciones);
                    return
                }
            })
        )
    }

    consultarSuites() {
        this.subscriptions.add(
            this._suitesService.geSuitesAP().subscribe((resp: any) => {
                if (resp.ok) {
                    this.suites = resp.suites
                    // console.log('Todos los suite', this.suites);
                    return
                }
            })
        )
    }

    consultarRoles() {
        this.subscriptions.add(
            this._rolesAPService.getRoles().subscribe((resp: any) => {
                if (resp.ok) {
                    this.roles = resp.roles
                    //    console.log('Todos los roles', this.roles);
                    return
                }
            })
        )
    }

    columnasRegistros: ColumnMetadata[] = [
        {
            name: 'nomUsuario',
            header: 'USUARIOS.USUARIOSROLES.NOMBREUSUARIO',
            type: 'text'
        },
        {
            name: 'nomRole',
            header: 'USUARIOS.USUARIOSROLES.NOMBREROL',
            type: 'text'
        },
        {
            name: 'tipoRol',
            header: 'USUARIOS.USUARIOSROLES.TIPOROLE',
            type: 'text'
        },
        {
            name: 'nomEstado',
            header: 'USUARIOS.USUARIOSROLES.ESTADOROLE',
            type: 'estado'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'nomAplicacion',
            header: 'USUARIOS.USUARIOSROLES.NOMBREAPLICACION',
            type: 'text'
        },
        {
            name: 'nomSuite',
            header: 'USUARIOS.USUARIOSROLES.NOMBRESUITE',
            type: 'text'
        }
    ]

    setupRolesStream(): void {
        this.registrosTransformados$ = this._usuariosRolesService._usuariosRoles$.pipe(
            switchMap((usuariosRoles: PTLUsuarioRoleAPModel[]) => {
                //  console.log('================== roles 1', usuariosRoles);
                if (!usuariosRoles) return of([])
                this.usuariosRoles = usuariosRoles
                const transformedApps = usuariosRoles.map((usuarioRole: any) => {
                    usuarioRole.nomEstado = usuarioRole.estadoUsuarioRole ? 'Activo' : 'Inactivo'

                    const appEncontrada = usuarioRole.codigoAplicacion
                        ? this.aplicaciones.find(x => x.codigoAplicacion === usuarioRole.codigoAplicacion)
                        : null
                    usuarioRole.nomAplicacion = appEncontrada ? appEncontrada.nombreAplicacion : 'N/A'

                    const suiteEncontrada = usuarioRole.codigoSuite ? this.suites.find(x => x.codigoSuite === usuarioRole.codigoSuite) : null
                    usuarioRole.nomSuite = suiteEncontrada ? suiteEncontrada.nombreSuite : 'N/A'

                    usuarioRole.nomUsuario = this.usuarios.filter(x => x.codigoUsuario == usuarioRole.codigoUsuarioSC)[0].nombreUsuario || ''
                    usuarioRole.nomRole = this.roles.filter(x => x.codigoRole == usuarioRole.codigoRole)[0].nombreRole || ''

                    usuarioRole.tipoRol = usuarioRole.codigoAplicacion ? 'Suscriptor' : 'Plataforma'
                    return usuarioRole as PTLUsuarioRoleAPModel
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
            this.filtroCodigoRoleSubject,
            this.filtroCodigoUsuariosRolesSubject,
            this.filtroEstadoSubject,
            this.filtroTipoRolSubject
        ]).pipe(
            map(([usuariosRoles, codigoRol, codigoUsuario, estado, tipoRol]) => {
                // console.log('================== roles 2', usuariosRoles);
                let filteredRegistros = usuariosRoles

                if (tipoRol !== 'todos') {
                    filteredRegistros = filteredRegistros.filter(reg => {
                        const esSuscriptor = reg.codigoAplicacion && reg.codigoAplicacion !== ''
                        return tipoRol === 'suscriptor' ? esSuscriptor : !esSuscriptor
                    })
                }
                if (codigoRol !== 'todos') {
                    filteredRegistros = filteredRegistros.filter(reg => reg.codigoRole === codigoRol)
                }
                if (codigoUsuario !== 'todos') {
                    filteredRegistros = filteredRegistros.filter(reg => reg.codigoUsuarioSC === codigoUsuario)
                }
                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true'
                    filteredRegistros = filteredRegistros.filter(reg => reg.estadoUsuarioRole === estadoBoolean)
                }
                return filteredRegistros
            })
        )
    }

    onFiltroTipoRolChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroTipoRolSubject.next(value)
    }

    onFiltroCodigoUsuariosRolesChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroCodigoUsuariosRolesSubject.next(value)
    }

    onFiltroCodigoRoleChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroCodigoRoleSubject.next(value)
    }

    onFiltroEstadoChangeClick(evento: any): void {
        const value = evento.target.value
        this.filtroEstadoSubject.next(value)
    }

    OnNuevoRegistroClick() {
        this.router.navigate(['usuarios/gestion-roles-usuario'])
    }

    OnEditarRegistroClick(id: number) {
        this.router.navigate(['usuarios/gestion-roles-usuario'], { queryParams: { regId: id } })
    }

    OnEliminarRegistroClick(id: any) {
        // const nombre = this.registros.filter((x) => x.codigoRole == id.id)[0];
        Swal.fire({
            title: this.translate.instant('ROLES.ELIMINARTITULO'),
            text: this.translate.instant('ROLES.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then((result: any) => {
            if (result.isConfirmed) {
                this._usuariosRolesService.deleteEliminarRegistro(id.id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('ROLES.ELIMINAREXITOSA') + ' ' + resp.mensaje
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalService.getAlertSuccess(this.translate.instant('ROLES.ELIMINAREXITOSA') + ' ' + resp.mensaje)
                    },
                    error: (err: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('ROLES.ELIMINARERROR') + ' ' + err.mensaje
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalService.getAlertSuccess(this.translate.instant('ROLES.ELIMINARERROR') + ' ' + err.mensaje)
                        this.setupRolesStream()
                        console.error('Error eliminando', err)
                    }
                })
            }
        })
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
