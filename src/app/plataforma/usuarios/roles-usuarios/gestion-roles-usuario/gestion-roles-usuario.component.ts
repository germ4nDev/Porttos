/* eslint-disable @typescript-eslint/no-explicit-any */
//#region IMPORTS
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PTLRoleAPModel } from '../../../../theme/shared/_helpers/models/PTLRoleAP.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PTLRolesAPService } from 'src/app/theme/shared/service/ptlroles-ap.service';
import { PtlAplicacionesService } from 'src/app/theme/shared/service/ptlaplicaciones.service';
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model';
import { PtlSuitesAPService } from 'src/app/theme/shared/service/ptlsuites-ap.service';
import { catchError, Observable, of, Subscription, tap } from 'rxjs';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { v4 as uuidv4 } from 'uuid';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component';
import { PTLUsuarioRoleAPModel } from 'src/app/theme/shared/_helpers/models/PTLUsuarioRole.model';
import {
    LocalStorageService,
    PtllogActividadesService,
    PtlusuariosRolesApService,
    SwalAlertService,
    PTLUsuariosService
} from 'src/app/theme/shared/service';
import { PTLUsuarioModel } from 'src/app/theme/shared/_helpers/models/PTLUsuario.model';
import { LoadingService } from 'src/app/theme/shared/service/loading.service';

//#endregion IMPORTS

@Component({
    selector: 'app-gestion-roles-usuario',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent],
    templateUrl: './gestion-roles-usuario.component.html',
    styleUrl: './gestion-roles-usuario.component.scss'
})
export class GestionRolesUsuarioComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>();
    menuItems!: Observable<NavigationItem[]>;
    lockScreenSubscription: Subscription | undefined;
    isLocked: boolean = false;
    lockMessage: string = '';
    tipoRolSeleccionado: string = '';

    FormRegistro: PTLUsuarioRoleAPModel = new PTLUsuarioRoleAPModel();
    aplicaciones: PTLAplicacionModel[] = [];
    usuarios: PTLUsuarioModel[] = [];
    registrosSub?: Subscription;
    suitesSub?: Subscription;
    suites: any[] = [];
    suitesApp: any[] = [];
    roleSub?: Subscription;
    roles: PTLRoleAPModel[] = [];
    roleApp: any[] = [];
    form: undefined;
    isSubmit: boolean = false;
    modoEdicion: boolean = false;
    codeRole = uuidv4();
    tipoEditorTexto = 'basica';
    codigoUsuarioSC: string = '';
    codigoAplicacion: string = '';
    codigoSuite: string = '';

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _logActividadesService: PtllogActividadesService,
        private _navigationService: NavigationService,
        private _rolesService: PTLRolesAPService,
        private _aplicacionesService: PtlAplicacionesService,
        private _suitesService: PtlSuitesAPService,
        private _localStorageService: LocalStorageService,
        private _swalAlertService: SwalAlertService,
        private _registrosService: PtlusuariosRolesApService,
        private _usuariosService: PTLUsuariosService,
        private _loadingService: LoadingService,
    ) {
        this.isSubmit = false;
        this.route.queryParams.subscribe((params) => {
            const registroId = params['regId'];
            if (registroId) {
                // console.log('me llena el Id', registroId);
                this.modoEdicion = true;
                this._registrosService.getRegistroById(registroId).subscribe({
                    next: (resp: any) => {
                        // console.log('resp', resp);
                        this.FormRegistro = resp.role;
                        // Lógica para que el Radio Button aparezca seleccionado
                        if (this.FormRegistro.codigoAplicacion) {
                            this.tipoRolSeleccionado = 'suscriptor';
                            const app = this.aplicaciones.find((x) => x.codigoAplicacion === this.FormRegistro.codigoAplicacion);
                            if (app) {
                                this.suitesApp = this.suites.filter((x) => x.aplicacionId === app.aplicacionId);
                            }
                        } else {
                            this.tipoRolSeleccionado = 'plataforma';
                        }

                        // console.log('Modo edición detectado para:', this.tipoRolSeleccionado);
                        // console.log('datos del FormRegistro', this.FormRegistro);
                    },
                    error: (err) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO') + err.mensaje
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOEXISTE') + err);
                    }
                });
            } else {
                this.modoEdicion = false;
            }
        });
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems = this._navigationService.menuItems$;
        this.consultarAplicaciones();
        this.consultarRoles();
        this.consultarUsuarios();
        this.lockScreenSubscription = this._navigationService.lockScreenEvent$.subscribe({
            next: (message: string) => {
                this._localStorageService.setFormRegistro(this.FormRegistro);
                this.isLocked = true;
                this.lockMessage = message;
            },
            error: (err) => console.error('Error al suscribirse al evento de bloqueo:', err)
        });
        const form = this._localStorageService.getFormRegistro();
        if (form != undefined) {
            this.FormRegistro = form;
            this._localStorageService.removeFormRegistro();
        }
        if (!this.modoEdicion) {
            this.FormRegistro.codigoAplicacion = '';
            this.FormRegistro.codigoSuite = '';
            this.FormRegistro.codigoRole = '';
            this.FormRegistro.codigoUsuarioSC = '';
        }
    }

    consultarAplicaciones() {
        this.registrosSub = this._aplicacionesService
            .getAplicaciones()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.aplicaciones = resp.aplicaciones;
                        return;
                    }
                }),
                catchError((err) => {
                    //   console.log('Ha ocurrido un error', err);
                    return of(null);
                })
            )
            .subscribe();
    }

    consultarSuites(codapp?: string) {
        this.suitesSub = this._suitesService
            .geSuitesAP()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        if (codapp) {
                            this.suites = resp.suites.filter((x: { codigoAplicacion: string }) => x.codigoAplicacion == codapp);
                        } else {
                            this.suites = resp.suites;
                        }
                        // console.log('Todos las suites', this.suites);
                        return;
                    }
                }),
                catchError((err) => {
                    //   console.log('Ha ocurrido un error', err);
                    return of(null);
                })
            )
            .subscribe();
    }

    consultarRoles() {
        this.roleSub = this._rolesService
            .getRoles()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.roles = resp.roles;
                        // console.log('Todos los roles', this.roles);
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
        this.registrosSub = this._usuariosService
            .getUsuarios()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.usuarios = resp.usuarios;
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

    onTipoRolChange() {
        this.limpiarCampos();

        if (this.tipoRolSeleccionado === 'plataforma') {
            this.consultarRolesGlobales();
        } else {
            this.consultarAplicaciones();
        }
    }

    limpiarCampos() {
        this.FormRegistro.codigoAplicacion = '';
        this.FormRegistro.codigoSuite = '';
        this.FormRegistro.codigoRole = '';
        this.suites = [];
        this.roles = [];
    }

    consultarRolesGlobales() {
        this._rolesService.getRoles().subscribe({
            next: (resp: any) => {
                if (resp.ok) {
                    this.roles = resp.roles
                        .filter((r: any) => !r.codigoAplicacion)
                        .map((r: any) => ({ ...r, checked: false }));
                    //   console.log('Roles cargados:', this.roles);
                }
            }
        });
    }

    onAplicacionchangeClick(event: any) {
        const codApp = event.target.value;
        this.FormRegistro.codigoAplicacion = codApp;
        this.FormRegistro.codigoSuite = '';
        this.FormRegistro.codigoRole = '';
        this.roles = [];
        this.suites = [];

        if (codApp) {
            this.consultarSuites(codApp);
        }
    }

    onSuiteChangeClick(event: any) {
        const codSuite = event.target.value;
        this.FormRegistro.codigoSuite = codSuite;
        this.FormRegistro.codigoRole = '';

        if (codSuite) {
            this.consultarRolesPorFiltro(this.FormRegistro.codigoAplicacion ?? '', codSuite);
        }
    }

    consultarRolesPorFiltro(codApp: string, codSuite: string) {
        this._rolesService.getRoles().subscribe({
            next: (resp: any) => {
                if (resp.ok) {
                    this.roles = resp.roles
                        .filter((r: any) => r.codigoAplicacion === codApp && r.codigoSuite === codSuite)
                        .map((r: any) => ({ ...r, checked: false }));
                }
            }
        });
    }

    btnAsociarTodosClick() {
        const todosSeleccionados = this.roles.every((rol) => rol.checked);
        this.roles.forEach((rol) => (rol.checked = !todosSeleccionados));
    }

    onRolCheckChange(event: any, rol: any) {
        console.log(`Rol ${rol.nombreRole} cambiado a: ${rol.checked}`);
    }

    //   onAplicacionchangeClick(event: any) {
    //     const value = event.target.value;
    //     const app = this.aplicaciones.filter((x) => x.codigoAplicacion == value)[0];
    //     this.FormRegistro.codigoAplicacion = value;
    //     this.suitesApp = this.suites.filter((x) => x.aplicacionId == app.aplicacionId);
    //   }

    //   onSuiteChangeClick(event: any) {
    //     const value = event.target.value;
    //     const suite = this.suites.filter((x) => x.codigoSuite == value)[0];
    //     this.FormRegistro.codigoSuite = suite.codigoSuite || '';
    //   }

    btnGestionarRegistroClick(form: any) {
        this.isSubmit = true;
        if (!form.valid) {
            return;
        }

        const rolesSeleccionados = this.roles.filter((r) => (r as any).checked);

        if (rolesSeleccionados.length === 0) {
            this._swalAlertService.getAlertConfirmWarning('Debe seleccionar al menos un rol.');
            return;
        }

        rolesSeleccionados.forEach((rolSeleccionado, index) => {
            const registroData: PTLUsuarioRoleAPModel = { ...form.value };

            // Asignamos los valores específicos del rol actual
            registroData.codigoRole = rolSeleccionado.codigoRole;

            if (this.tipoRolSeleccionado === 'plataforma') {
                registroData.codigoAplicacion = '';
                registroData.codigoSuite = '';
            }

            this._loadingService.show();

            if (this.modoEdicion) {
                // console.log('1.0 modificar usuario', this.FormRegistro);
                registroData.tipoRol = this.tipoRolSeleccionado;
                registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
                registroData.fechaModificacion = new Date().toISOString();
                this._registrosService.putModificarRegistro(registroData).subscribe({
                    next: (resp: any) => {
                        if (resp.ok) {
                            const logData = {
                                codigoTipoLog: '',
                                codigoRespuesta: '201',
                                descripcionLog: this.translate.instant('PLATAFORMA.INSERTAR')
                            };
                            this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                            this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.INSERTAR'));
                            this.router.navigate(['/usuarios/roles-usuarios']);
                        } else {
                            const logData = {
                                codigoTipoLog: '',
                                codigoRespuesta: '501',
                                descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO') + resp.mensaje
                            };
                            this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                            this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOMODIFICO'));
                        }
                    },
                    error: (err: any) => {
                        console.error(err);
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO') + err.mensaje
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOMODIFICO') + err);
                    }
                });
            } else {
                console.log('formResgistro', this.FormRegistro);
                // --- MEJORA PARA EVITAR DUPLICADOS ---
                const rolesFinal: any[] = [];
                // Usamos un Set para rastrear IDs ya agregados en este ciclo
                const rolesAgregados = new Set();

                rolesSeleccionados.forEach(rol => {
                    if (!rolesAgregados.has(rol.codigoRole)) {
                        const registroData = new PTLUsuarioRoleAPModel();
                        registroData.codigoRole = rol.codigoRole;
                        registroData.codigoUsuarioSC = this.FormRegistro.codigoUsuarioSC;
                        registroData.codigoEmpresaSC = '';
                        registroData.tipoRol = this.tipoRolSeleccionado;
                        registroData.codigoAplicacion = this.tipoRolSeleccionado === 'plataforma' ? '' : this.FormRegistro.codigoAplicacion;
                        registroData.codigoSuite = this.tipoRolSeleccionado === 'plataforma' ? '' : this.FormRegistro.codigoSuite;
                        registroData.estadoUsuarioRole = this.FormRegistro.estadoUsuarioRole;
                        registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
                        registroData.fechaCreacion = new Date().toISOString();

                        rolesFinal.push(registroData);
                        rolesAgregados.add(rol.codigoRole);
                    }
                });

                const dataCrear: PTLUsuarioRoleAPModel = {
                    tipoRol: this.tipoRolSeleccionado,
                    codigoUsuarioSC: this.FormRegistro.codigoUsuarioSC,
                    codigoAplicacion: this.tipoRolSeleccionado === 'suscriptor' ? this.FormRegistro.codigoAplicacion : '',
                    codigoSuite: this.tipoRolSeleccionado === 'suscriptor' ? this.FormRegistro.codigoSuite : '',
                    // roles: rolesFinal
                };

                // console.log('QUE TRAE CREAAARR', dataCrear);
                this._registrosService.postUsuarioRole(dataCrear).subscribe({

                    next: (resp: any) => {
                        if (resp.ok) {
                            const logData = {
                                codigoTipoLog: '',
                                codigoRespuesta: '201',
                                descripcionLog: this.translate.instant('PLATAFORMA.INSERTAR')
                            };
                            this._logActividadesService.postCrearRegistro(logData).subscribe();
                            this._swalAlertService.getAlertConfirmSuccess(this.translate.instant('PLATAFORMA.INSERTAR'));
                            this._loadingService.hide();
                            this.router.navigate(['/usuarios/roles-usuarios']);
                        }
                    },
                    error: (err: any) => {
                        this._loadingService.hide();
                        console.error(err);
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('PLATAFORMA.NOINSERTO') + ', ' + err.message
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe();
                        this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOINSERTO'));
                    }
                });
            }
        });
    }

    btnRegresarClick() {
        this.router.navigate(['/usuarios/roles-usuarios']);
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
