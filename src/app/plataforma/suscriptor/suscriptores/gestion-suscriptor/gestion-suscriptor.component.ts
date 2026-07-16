/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component';
import { Observable, Subscription } from 'rxjs';
import {
    LocalStorageService,
    PtllogActividadesService,
    PtlusuariosScService,
    PTLUsuariosService,
    SwalAlertService,
    UploadFilesService
} from 'src/app/theme/shared/service';
import { TranslateService } from '@ngx-translate/core';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { NarikCustomValidatorsModule } from '@narik/custom-validators';
import { PTLSuscriptorModel } from 'src/app/theme/shared/_helpers/models/PTLSuscriptor.model';
import { PTLSuscriptoresService } from 'src/app/theme/shared/service/ptlsuscriptores.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import { PTLUsuarioSCModel } from 'src/app/theme/shared/_helpers/models/PTLUsuarioSC.model';
import { PTLUsuarioModel } from 'src/app/theme/shared/_helpers/models/PTLUsuario.model';
import log from 'video.js/dist/types/utils/log';

@Component({
    selector: 'app-gestion-suscriptor',
    standalone: true,
    imports: [CommonModule, SharedModule, NarikCustomValidatorsModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-suscriptor.component.html',
    styleUrl: './gestion-suscriptor.component.scss'
})
export class GestionSuscriptorComponent {
    // private props
    @Output() toggleSidebar = new EventEmitter<void>();
    FormRegistro: PTLSuscriptorModel = new PTLSuscriptorModel();
    classList!: { toggle: (arg0: string) => void };
    menuItems!: Observable<NavigationItem[]>;
    gradientConfig: any;
    navCollapsed: boolean = false;
    navCollapsedMob: boolean = false;
    windowWidth: number = 0;
    form: undefined;
    isSubmit: boolean;
    modoEdicion: boolean = false;
    isClaveActual: boolean = true;
    verificarHabilitado: boolean = true;
    isClaveValida: boolean = false;
    codigoSusucriptor = uuidv4();
    tipoEditorTexto = 'basica';
    lockScreenSubscription: Subscription | undefined;
    isLocked: boolean = false;
    lockMessage: string = '';
    suscriptor: string = '';

    selectedFile: File | null = null;
    previewUrl: string | ArrayBuffer | null = null;
    userPhotoUrl: string = '';
    fileName: string | null = null;
    selectedFileUrl: string | null = null;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _suscriptoresService: PTLSuscriptoresService,
        private _navigationService: NavigationService,
        private _localStorageService: LocalStorageService,
        private _uploadService: UploadFilesService,
        private _usuariosService: PTLUsuariosService,
        private _usuariosSCService: PtlusuariosScService,
        private _logActividadesService: PtllogActividadesService,
        private _swalAlertService: SwalAlertService
    ) {
        this.isSubmit = false;
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
        this.route.queryParams.subscribe((params) => {
            const id = params['regId'];
            console.log('me llena el Id', id);
            if (id != 'nuevo') {
                this.modoEdicion = true;
                this.verificarHabilitado = false;
                this._suscriptoresService.getSuscriptorById(id).subscribe({
                    next: (resp: any) => {
                        this.FormRegistro = resp.suscriptor;
                        console.log('respuesta componente', this.FormRegistro);
                    },
                    error: () => {
                        Swal.fire('Error', 'No se pudo obtener el suscriptor', 'error');
                    }
                });
            } else {
                this.verificarHabilitado = true;
                this.modoEdicion = false;
                this.FormRegistro.codigoSuscriptor = uuidv4();
            }
        });
    }

    get clavesCoinciden(): boolean {
        const clave = this.FormRegistro.claveNew;
        const confirmacion = this.FormRegistro.claveConfirm;

        // Si ambos están vacíos, no mostramos error de "no coinciden"
        if (!clave && !confirmacion) {
            return true;
        }

        return clave === confirmacion;
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems = this._navigationService.menuItems$;
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
        const togglePassword = document.querySelector('#togglePassword');
        const password = document.querySelector('#claveAdministrador');
        togglePassword?.addEventListener('click', () => {
            const type = password?.getAttribute('type') === 'password' ? 'text' : 'password';
            password?.setAttribute('type', type);
            this.classList.toggle('icon-eye-off');
        });
        if (!this.modoEdicion) {
            console.log('modo edicion', this.modoEdicion);
            this.FormRegistro = {
                codigoSuscriptor: uuidv4(),
                nombreSuscriptor: '',
                identificacionSuscriptor: '',
                direccionSuscriptor: '',
                telefonoContacto: '',
                numeroEmpresas: 0,
                numeroUsuarios: 0,
                usuarioAdministrador: '',
                descripcionSuscriptor: '',
                envioCorreosSuscriptor: false,
                envioMensajesSuscriptor: false,
                envioPublicidadSuscriptor: false,
                estadoSuscriptor: false
            };
            this.isClaveActual = false;
            console.log('FormRegistro', this.FormRegistro);
        }
    }

    actualizarDescripcionSuscriptor(nuevoContenido: string): void {
        this.FormRegistro.descripcionSuscriptor = nuevoContenido;
        console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionSuscriptor);
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    validarClaveActual(claveActual: any) {
        const codigo = this.FormRegistro.codigoAdministrador || '';
        this._usuariosService.verificarClaveActual(codigo, claveActual).subscribe((data: any) => {
            if (data.ok == true) {
                if (this.FormRegistro.codigoAdministrador === data.suscriptor.codigoAdministrador) {
                    this.isClaveActual = false;
                    this.isClaveValida = true;
                }
            } else {
                this.FormRegistro.claveNew = '';
                this.FormRegistro.claveConfirm = '';
                this.isClaveValida = false;
                this.isClaveActual = true;
                this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.PASSWORDNOTMATCH'));
            }
        });
    }

    onFileSelectedClick(event: any) {
        const file: File = event.target.files[0];
        const objUpload = {
            susc: this.FormRegistro.codigoSuscriptor || '',
            tipo: 'suscriptores'
        };
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.selectedFileUrl = e.target.result;
            };
            this.FormRegistro.logoSuscriptor = '';
            reader.readAsDataURL(file);
            this._uploadService.uploadUserPhoto(file, objUpload).subscribe({
                next: (path: any) => {
                    this.userPhotoUrl = path.nombreArchivo;
                    this.FormRegistro.logoSuscriptor = path.nombreArchivo;
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
        if (!form.valid) return;
        const rawData = { ...this.FormRegistro };
        const idSuscriptor = rawData.codigoSuscriptor;
        const idUsuarioAdmin = uuidv4();
        const usuarioLogueado = this._localStorageService.getUsuarioLocalStorage();

        const registroParaEnvio = {
            codigoSuscriptor: rawData.codigoSuscriptor,
            identificacionSuscriptor: rawData.identificacionSuscriptor,
            nombreSuscriptor: rawData.nombreSuscriptor,
            correoSuscriptor: rawData.correoSuscriptor,
            direccionSuscriptor: rawData.direccionSuscriptor,
            telefonoContacto: rawData.telefonoContacto,
            numeroEmpresas: rawData.numeroEmpresas,
            numeroUsuarios: rawData.numeroUsuarios,
            usuarioAdministrador: rawData.usuarioAdministrador,
            logoSuscriptor: this.userPhotoUrl != '' ? this.userPhotoUrl : 'no-imagen.png',
            descripcionSuscriptor: rawData.descripcionSuscriptor,
            envioCorreosSuscriptor: rawData.envioCorreosSuscriptor,
            envioMensajesSuscriptor: rawData.envioMensajesSuscriptor,
            envioPublicidadSuscriptor: rawData.envioPublicidadSuscriptor,
            estadoSuscriptor: rawData.estadoSuscriptor,
            claveUsuario: rawData.claveNew
        };
        console.log('QUE ME TRAE registroParaEnvio++++++++++++++++++', registroParaEnvio);
        if (this.modoEdicion) {
            const dataUpdate = {
                ...registroParaEnvio,
                suscriptorId: rawData.suscriptorId,
                codigoUsuarioModificacion: usuarioLogueado.codigoUsuario,
                fechaModificacion: new Date().toISOString()
            };

            this._suscriptoresService.actualizarSuscriptor(dataUpdate as any).subscribe({
                next: (resp: any) => {
                    this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.MODIFICAR'));
                    this.router.navigate(['/suscriptor/suscriptores']);
                },
                error: (err) => console.error(err)
            });
        } else {
            const dataCreate = {
                ...registroParaEnvio,
                codigoAdministrador: idUsuarioAdmin,
                codigoUsuarioCreacion: usuarioLogueado.codigoUsuario,
                fechaCreacion: new Date().toISOString()
            };

            // CREAR SUSCRIPTOR
            this._suscriptoresService.crearSuscriptor(dataCreate).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        this.CrearUsuarioYUsuarioSC(rawData, idUsuarioAdmin, idSuscriptor!, usuarioLogueado, dataCreate);
                    }
                },
                error: (err) => {
                    const error = err.error?.msg || 'Error al validar datos'
                    const rutaTraduccion = `SUSCRIPTOR.SUSCRIPTORES.GESTION.${error}`;
                    this._swalAlertService.getAlertConfirmWarning(this.translate.instant(rutaTraduccion));
                }
            });
        }
    }

    private CrearUsuarioYUsuarioSC(rawData: any, idUsuarioAdmin: string, idSuscriptor: string, usuarioLogueado: any, dataCreate: any) {
        const usuarioAdministrador: PTLUsuarioModel = {
            codigoUsuario: idUsuarioAdmin,
            identificacionUsuario: rawData.identificacionSuscriptor,
            nombreUsuario: 'Administrador ' + rawData.nombreSuscriptor,
            correoUsuario: rawData.correoSuscriptor,
            userNameUsuario: rawData.usuarioAdministrador,
            claveUsuario: rawData.claveNew,
            descripcionUsuario: '',
            fotoUsuario: 'no-imagen.png',
            usuarioAdministrador: true,
            estadoUsuario: true,
            codigoUsuarioCreacion: usuarioLogueado.codigoUsuario,
            fechaCreacion: new Date().toISOString()
        };
        this._usuariosService.postCrearUsuario(usuarioAdministrador).subscribe({
            next: () => this.crearUsuarioSC(idUsuarioAdmin, idSuscriptor, usuarioLogueado, dataCreate),
            error: (err) => {
                const error = err.error?.msg || 'Error al validar datos'
                let idARelacionar = idUsuarioAdmin;
                if (err.error?.usuario) {
                    idARelacionar = err.error.usuario.codigoUsuario;
                    console.log('ID Usuario existente:', idARelacionar);
                }
                const rutaTraduccion = `USUARIOS.USUARIOS.GESTION.${error}`;
                this._swalAlertService.getAlertConfirmWarning(this.translate.instant(rutaTraduccion))
                // .then(() => {
                //     this.crearUsuarioSC(idARelacionar, idSuscriptor, usuarioLogueado, dataCreate);
                // });
            }
        });
    }

    private crearUsuarioSC(idUsuarioAdmin: string, idSuscriptor: string, usuarioLogueado: any, dataCreate: any) {
        const usuarioSC: PTLUsuarioSCModel = {
            codigoUsuarioSC: uuidv4(),
            codigoUsuario: idUsuarioAdmin,
            codigoSuscriptor: idSuscriptor,
            estadoUsuarioSC: true,
            codigoUsuarioCreacion: usuarioLogueado.codigoUsuario,
            fechaCreacion: new Date().toISOString(),
            codigoUsuarioModificacion: '',
            fechaModificacion: ''
        };

        // CREAR USUARIOSC
        this._usuariosSCService.postCrearUsuario(usuarioSC).subscribe({
            next: () => this.finalizarRegistro(dataCreate.codigoSuscriptor),
            error: (err) => {
                const error = err.error?.msg || 'Error al validar datos'
                console.log('Error: ', error);
                this.finalizarRegistro(dataCreate.codigoSuscriptor);
            }
        });
    }

    private finalizarRegistro(codigoSuscriptor: string) {
        this._suscriptoresService.crearCarpetaSuscriptor(codigoSuscriptor).subscribe();
        this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.INSERTAR'));
        this.router.navigate(['/suscriptor/suscriptores']);
    }

    btnRegresarClick() {
        this.router.navigate(['/suscriptor/suscriptores']);
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
