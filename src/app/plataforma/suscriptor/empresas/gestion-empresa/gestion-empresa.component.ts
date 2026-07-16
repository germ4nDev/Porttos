/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, tap, catchError, of, Observable } from 'rxjs';
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model';
import {
  PtlAplicacionesService,
  NavigationService,
  LocalStorageService,
  PtlmodulosApService,
  PtlSuitesAPService,
  PTLEstadosService,
  UploadFilesService,
  SwalAlertService,
  PtllogActividadesService,
  PTLSuscriptoresService,
  PtlEmpresasScService
} from 'src/app/theme/shared/service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component';
import { PTLModuloAP } from 'src/app/theme/shared/_helpers/models/PTLModuloAP.model';
import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model';
import { PtlusuariosScService } from 'src/app/theme/shared/service/ptlusuarios-sc.service';
import { PTLUsuariosService } from 'src/app/theme/shared/service/ptlusuarios.service';
import { PTLUsuarioModel } from 'src/app/theme/shared/_helpers/models/PTLUsuario.model';
import { PTLEstadoModel } from 'src/app/theme/shared/_helpers/models/PTLEstado.model';
import { PTLClaseTicketModel } from 'src/app/theme/shared/_helpers/models/PTLClaseTicket.model';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { PTLSuscriptorModel } from 'src/app/theme/shared/_helpers/models/PTLSuscriptor.model';
import { PTLEmpresaSCModel } from 'src/app/theme/shared/_helpers/models/PTLEmpresaSC.model';

@Component({
  selector: 'app-gestion-empresa',
  standalone: true,
  imports: [CommonModule, SharedModule, NavBarComponent, NavContentComponent, TextEditorComponent],
  templateUrl: './gestion-empresa.component.html',
  styleUrl: './gestion-empresa.component.scss'
})
export class GestionEmpresaComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  FormRegistro: PTLEmpresaSCModel = new PTLEmpresaSCModel();
  menuItems!: Observable<NavigationItem[]>;
  registrosSub?: Subscription;
  form: undefined;
  lockScreenSubscription: Subscription | undefined;
  isLocked: boolean = false;
  lockMessage: string = '';
  suscriptoresSub?: Subscription;
  suscriptores: PTLSuscriptorModel[] = [];
  codigoRegistro: string = '';
  codigoSuscriptor: string = '';
  estadosTicketSub?: Subscription;
  estadosTicket: PTLEstadoModel[] = [];
  clasesTicketSub?: Subscription;
  clasesTicket: PTLClaseTicketModel[] = [];
  usuariosSub?: Subscription;
  usuarios: PTLUsuarioModel[] = [];
  aplicacionesSub?: Subscription;
  aplicaciones: PTLAplicacionModel[] = [];
  suitesSub?: Subscription;
  modulosSub?: Subscription;
  suites: PTLSuiteAPModel[] = [];
  modulos: PTLModuloAP[] = [];

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  userPhotoUrl: string = '';
  fileName: string | null = null;
  selectedFileUrl: string | null = null;

  isSubmit: boolean = false;
  modoEdicion: boolean = false;
  codeRegistro = uuidv4();
  tipoEditorTexto = 'basica';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private _navigationService: NavigationService,
    private _empresasScService: PtlEmpresasScService,
    private _suscriptoresService: PTLSuscriptoresService,
    private _uploadService: UploadFilesService,
    private _localStorageService: LocalStorageService,
    private _logActividadesService: PtllogActividadesService,
    private _swalAlertService: SwalAlertService
  ) {
    this.isSubmit = false;
    this.route.queryParams.subscribe((params) => {
      this.codigoRegistro = params['regId'] || '';
      this.codigoSuscriptor = params['stId'] || '';
      if (this.codigoRegistro !== 'nuevo' && this.codigoRegistro !== '') {
            console.log('me llena el Id', this.codigoRegistro);
            this.modoEdicion = true;
            this._empresasScService.getEmpresaById(this.codigoRegistro).subscribe({
            next: (resp: any) => {
                this.FormRegistro = resp.empresaSC;
                this.selectedFileUrl = this._uploadService.getFilePath('0', 'empresas', resp.empresaSC.logoEmpresa);
                console.log('datos del FormRegistro', this.FormRegistro);
            },
            error: () => {
                Swal.fire('Error', 'No se pudo obtener la empresa', 'error');
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
    this.consultarSuscriptores();
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
      // console.log('modo edicion', this.modoEdicion);
      this.FormRegistro.codigoSuscriptor = '';
      this.FormRegistro.logoEmpresa = 'no-imagen.png';
      this.FormRegistro.codigoEmpresaSC = uuidv4();
      this.selectedFileUrl = this._uploadService.getFilePath('0', 'empresas', 'no-foto.png');
      // console.log('FormRegistro', this.FormRegistro);
    }
  }

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

  onSuscriptorChangeClick(event: any) {
    const value = event.target.value;
    const sui = this.suscriptores.filter((x) => x.codigoSuscriptor == value)[0];
    // console.log('Código de suite seleccionado:', value);
    // console.log('data suite seleccionado:', sui);
    this.FormRegistro.codigoSuscriptor = sui.codigoSuscriptor;
  }

  actualizarDescripcionVersion(nuevoContenido: string): void {
    this.FormRegistro.descripcionEmpresa = nuevoContenido;
    // console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionTicket);
    // if (this.validationForm && this.isSubmit) {
    // }
  }

  onFileSelectedClick(event: any) {
    const file: File = event.target.files[0];
    const objUpload = {
      susc: '0',
      aplicacion: this._localStorageService.getAplicaicionLocalStorage().nombreAplicacion,
      tipo: 'empresas'
    };
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFileUrl = e.target.result;
      };
      this.FormRegistro.logoEmpresa = '';
      reader.readAsDataURL(file);
      this._uploadService.uploadUserPhoto(file, objUpload).subscribe({
        next: (path: any) => {
          this.userPhotoUrl = path.nombreArchivo;
          this.FormRegistro.logoEmpresa = path.nombreArchivo;
        },
        error: () => {
          this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.UPLOADPHOTOERROR'));
        }
      });
    } else {
      this.selectedFileUrl = null;
      this.userPhotoUrl = '';
    }
  }

  btnGestionarRegistroClick(form: any) {
    this.isSubmit = true;
    if (!form.valid) {
      return;
    }
    const registroData = form.value as PTLEmpresaSCModel;

    if (this.modoEdicion) {
      registroData.logoEmpresa = this.FormRegistro.logoEmpresa;
      registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
      registroData.fechaModificacion = new Date().toISOString();
      this._empresasScService.actualizarEmpresa(registroData).subscribe({
        next: (resp: any) => {
          if (resp.ok) {
            const logData = {
              codigoTipoLog: '',
              codigoRespuesta: '201',
              descripcionLog: this.translate.instant('PLATAFORMA.MODIFICAR')
            };
            this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
            this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.MODIFICAR'));
            if(this.codigoRegistro == 'nuevo'){
                this.router.navigate(['/suscriptor/empresas/'], { queryParams: { regId: this.codigoSuscriptor} });
            }
            else{
                this.router.navigate(['/suscriptor/empresas/'], { queryParams: { regId: this.FormRegistro.codigoSuscriptor} });
            }
          } else {
            const logData = {
              codigoTipoLog: '',
              codigoRespuesta: '501',
              descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO')
            };
            this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
            this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOMODIFICO') + resp.message);
          }
        },
        error: (err: any) => {
          const logData = {
            codigoTipoLog: '',
            codigoRespuesta: '501',
            descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO')
          };
          this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
          this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOMODIFICO') + err);
        }
      });
    } else {
      registroData.codigoEmpresaSC = uuidv4();
      registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
      registroData.fechaCreacion = new Date().toISOString();
      registroData.codigoUsuarioModificacion = '';
      registroData.fechaModificacion = '';
      registroData.logoEmpresa = this.FormRegistro.logoEmpresa;
      this._empresasScService.crearEmpresa(registroData).subscribe({
        next: (resp: any) => {
          if (resp.ok) {
            const logData = {
              codigoTipoLog: '',
              codigoRespuesta: '201',
              descripcionLog: this.translate.instant('PLATAFORMA.MODIFICAR')
            };
            this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
            this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.INSERTAR'));
            form.resetForm();
            this.isSubmit = false;
            if(this.codigoRegistro == 'nuevo'){
                this.router.navigate(['/suscriptor/empresas/'], { queryParams: { regId: this.codigoSuscriptor} });
            }
            else{
                this.router.navigate(['/suscriptor/empresas/'], { queryParams: { regId: this.FormRegistro.codigoSuscriptor} });
            }
          }
        },
        error: (err: any) => {
          const logData = {
            codigoTipoLog: '',
            codigoRespuesta: '501',
            descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO')
          };
          this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
          this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOMODIFICO') + err);
        }
      });
    }
  }

  btnRegresarClick() {
    if(this.codigoRegistro == 'nuevo'){
        this.router.navigate(['/suscriptor/empresas/'], { queryParams: { regId: this.codigoSuscriptor} });
    }
    else{
        this.router.navigate(['/suscriptor/empresas/'], { queryParams: { regId: this.FormRegistro.codigoSuscriptor} });
    }
  }

  toggleNav(): void {
    this.toggleSidebar.emit();
  }
}
