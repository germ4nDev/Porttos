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
import {
  LocalStorageService,
  PtllogActividadesService,
  PtlusuariosRolesApService,
  PTLUsuariosService,
  SwalAlertService
} from 'src/app/theme/shared/service';
import { PTLUsuarioModel } from 'src/app/theme/shared/_helpers/models/PTLUsuario.model';
import { PTLUsuarioRoleAPModel } from 'src/app/theme/shared/_helpers/models/PTLUsuarioRole.model';
//#endregion IMPORTS

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
  templateUrl: './gestion-roles.component.html',
  styleUrl: './gestion-roles.component.scss'
})
export class GestionRolesComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  menuItems!: Observable<NavigationItem[]>;
  lockScreenSubscription: Subscription | undefined;
  isLocked: boolean = false;
  lockMessage: string = '';
  tipoRolSeleccionado: string = '';

  FormRegistro: PTLRoleAPModel = new PTLRoleAPModel();
  usuarios: PTLUsuarioModel[] = [];
  aplicaciones: PTLAplicacionModel[] = [];
  registrosSub?: Subscription;
  suitesSub?: Subscription;
  suites: any[] = [];
  suitesApp: any[] = [];
  form: undefined;
  isSubmit: boolean = false;
  modoEdicion: boolean = false;
  codeRole = uuidv4();
  tipoEditorTexto = 'basica';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private _logActividadesService: PtllogActividadesService,
    private _navigationService: NavigationService,
    private _registrosService: PTLRolesAPService,
    private _aplicacionesService: PtlAplicacionesService,
    private _suitesService: PtlSuitesAPService,
    private _usuariosService: PTLUsuariosService,
    private _usuariosRolesService: PtlusuariosRolesApService,
    private _localStorageService: LocalStorageService,
    private _swalAlertService: SwalAlertService
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
            if (this.FormRegistro.codigoAplicacion) {
              this.tipoRolSeleccionado = 'suscriptor';
              this.filtrarSuitesPorApp(this.FormRegistro.codigoAplicacion);
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

  filtrarSuitesPorApp(codigoApp: string) {
    const app = this.aplicaciones.find((x) => x.codigoAplicacion === codigoApp);
    if (app) {
      this.suitesApp = this.suites.filter((x) => x.aplicacionId === app.aplicacionId);
    }
  }
  ngOnInit() {
    this._navigationService.getNavigationItems();
    this.menuItems = this._navigationService.menuItems$;
    this.consultarAplicaciones();
    this.consultarSuites();
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
      this.FormRegistro.codigoRole = uuidv4();
      this.FormRegistro.nombreRole = '';
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
          console.log('Ha ocurrido un error', err);
          return of(null);
        })
      )
      .subscribe();
  }

  consultarSuites() {
    this.suitesSub = this._suitesService
      .geSuitesAP()
      .pipe(
        tap((resp: any) => {
          if (resp.ok) {
            this.suites = resp.suites;
            // console.log('Todos las suites', this.suites);
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
    this._usuariosService.getUsuarios().subscribe((resp: any) => {
      if (resp.ok) {
        // 1. Cargamos la lista completa de usuarios
        this.usuarios = resp.usuarios.map((u: any) => ({
          ...u,
          checked: false
        }));

        if (this.modoEdicion && this.FormRegistro.codigoRole) {
          this.cargarUsuariosAsociados(this.FormRegistro.codigoRole);
        }
      }
    });
  }

  cargarUsuariosAsociados(codigoRole: string) {
    this._usuariosRolesService.getRegistroByCodigoRol(codigoRole).subscribe({
      next: (resp: any) => {
        if (resp.ok && Array.isArray(resp.usuarioRole)) {
          this.usuarios.forEach((u) => {
            u.checked = resp.usuarioRole.some((asociado: any) => asociado.codigoUsuarioSC === u.codigoUsuario);
          });
        }
      }
    });
  }

  btnAsociarTodosUsuariosClick() {
    // Verificamos si todos los usuarios actuales ya están marcados
    const todosSeleccionados = this.usuarios.every((u: any) => u.checked);

    // Si todos están marcados, los desmarcamos. Si no, los marcamos todos.
    this.usuarios.forEach((u: any) => (u.checked = !todosSeleccionados));
  }

  onAplicacionchangeClick(event: any) {
    const value = event.target.value;
    const app = this.aplicaciones.filter((x) => x.codigoAplicacion == value)[0];
    this.FormRegistro.codigoAplicacion = value;
    this.suitesApp = this.suites.filter((x) => x.codigoAplicacion == app.codigoAplicacion);
  }

  onSuiteChangeClick(event: any) {
    const value = event.target.value;
    const suite = this.suites.filter((x) => x.codigoSuite == value)[0];
    this.FormRegistro.codigoSuite = suite.codigoSuite || '';
  }

  actualizarDescripcionVersion(nuevoContenido: string): void {
    this.FormRegistro.descripcionRole = nuevoContenido;
    // console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionRole);
  }

  btnGestionarRegistroClick(form: any) {
    this.isSubmit = true;

    // const usuariosSeleccionados = this.usuarios.filter((u) => u.checked);
    const usuariosAProcesar = this.usuarios.filter((u) => u.checked);
    // console.log('------------QUE ME TRAE USUARIO A PROCESAR------', usuariosAProcesar);


    if (!form.valid) return;

    if (usuariosAProcesar.length === 0) {
      this._swalAlertService.getAlertError('Debe seleccionar al menos un usuario.');
      return;
    }

    const registroData = form.value as PTLRoleAPModel;

    if (this.tipoRolSeleccionado === 'plataforma') {
      registroData.codigoAplicacion = '';
      registroData.codigoSuite = '';
    }
    const datosParaRelacion = {
        ...registroData,
        tipoRol: this.tipoRolSeleccionado // <-- Aquí garantizamos que no sea null
    };

    if (this.modoEdicion) {
      registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
      registroData.fechaModificacion = new Date().toISOString();

      this._registrosService.putModificarRegistro(registroData).subscribe({
        next: (resp: any) => {
          if (resp.ok) {
            // this.procesarRelaciones(registroData.codigoRole!);
            this.procesarRelaciones(registroData.codigoRole!, usuariosAProcesar, datosParaRelacion);
            const logData = {
              codigoTipoLog: '',
              codigoRespuesta: '201',
              descripcionLog: this.translate.instant('PLATAFORMA.INSERTAR')
            };
            this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
            this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.INSERTAR'));
            this.router.navigate(['/usuarios/roles']);
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
      // --- LÓGICA DE CREACIÓN ---
      registroData.codigoRole = uuidv4();
      registroData.nombreRole = this.FormRegistro.nombreRole;
      registroData.descripcionRole = this.FormRegistro.descripcionRole;
      registroData.estadoRole = this.FormRegistro.estadoRole;
      registroData.fechaCreacion = new Date().toISOString();
      registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;

      this._registrosService.postCrearRegistro(registroData).subscribe({
        next: (resp: any) => {
            if (resp.ok) {
            // this.procesarRelaciones(registroData.codigoRole || '');
            this.procesarRelaciones(registroData.codigoRole || '', usuariosAProcesar, datosParaRelacion);
            const logData = {
              codigoTipoLog: '',
              codigoRespuesta: '201',
              descripcionLog: this.translate.instant('PLATAFORMA.MODIFICAR')
            };
            this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
            this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.INSERTAR'));
            form.resetForm();
            this.isSubmit = false;
            this.router.navigate(['/usuarios/roles']);
          }
        },
        error: (err: any) => {
          const logData = {
            codigoTipoLog: '',
            codigoRespuesta: '501',
            descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO')
          };
          this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado error'));
          this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOMODIFICO') + err);
        }
      });
    }
  }

  procesarRelaciones(codigoRole: string, usuariosSeleccionados: any[], datosCompletos: any) {
    this._usuariosRolesService.deleteTodosUsuarioRole(codigoRole).subscribe({
      next: (resp: any) => {
        // console.log('++++++QUEMETRAEEUSAURIOSESELECCIONADOS++++', usuariosSeleccionados)
        usuariosSeleccionados.forEach((usuario) => {
          const nuevaRelacion = {
            codigoUsuarioSC: usuario.codigoUsuario,
            codigoEmpresaSC: '',
            codigoRole: codigoRole,
            codigoAplicacion: datosCompletos.codigoAplicacion || '',
            codigoSuite: datosCompletos.codigoSuite || '',
            tipoRol: datosCompletos.tipoRol,
            estadoUsuarioRole: true,
            // Auditoría
            codigoUsuarioCreacion: this._localStorageService.getUsuarioLocalStorage().codigoUsuario,
            fechaCreacion: new Date().toISOString(),
            codigoUsuarioModificacion: this._localStorageService.getUsuarioLocalStorage().codigoUsuario,
            fechaModificacion: new Date().toISOString()
          };

          // Enviamos la inserción al servicio
          this._usuariosRolesService.postUsuarioRole(nuevaRelacion).subscribe({
            next: () => console.log(`Usuario ${usuario.nombreUsuario} asociado correctamente`),
            error: (err) => console.error('Error asociando usuario', err)
          });
        });
      },
      error: (err) => {
        console.error('Error al intentar limpiar relaciones previas', err);
      }
    });
  }

  btnRegresarClick() {
    this.router.navigate(['/usuarios/roles']);
  }

  toggleNav(): void {
    this.toggleSidebar.emit();
  }
}
