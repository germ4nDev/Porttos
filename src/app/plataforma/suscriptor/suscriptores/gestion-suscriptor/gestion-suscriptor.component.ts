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
    usuarios: PTLUsuarioModel[] = [];
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
                        this.userPhotoUrl = resp.suscriptor.logoSuscriptor;
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
        this.usuarios = this._usuariosService.getUsuariosActuales();
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
        this.FormRegistro.logoSuscriptor = '';
        const objUpload = {
            susc: this.suscriptor,
            tipo: 'suscriptores'
        };
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.selectedFileUrl = e.target.result;
            };
            reader.readAsDataURL(file);
            this._uploadService.uploadUserPhoto(file, objUpload).subscribe({
                next: (path: any) => {
                    this.userPhotoUrl = path.data.respuesta.fileName;
                    this.FormRegistro.logoSuscriptor = path.data.respuesta.fileName;
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
        this.FormRegistro = form.value as PTLSuscriptorModel
        const registroData = new PTLSuscriptorModel()
        registroData.identificacionSuscriptor = this.FormRegistro.identificacionSuscriptor
        registroData.nombreSuscriptor = this.FormRegistro.nombreSuscriptor
        registroData.correoSuscriptor = this.FormRegistro.correoSuscriptor
        registroData.direccionSuscriptor = this.FormRegistro.direccionSuscriptor
        registroData.telefonoContacto = this.FormRegistro.telefonoContacto
        registroData.logoSuscriptor = this.userPhotoUrl != '' ? this.userPhotoUrl : 'no-imagen.png'
        registroData.numeroEmpresas = this.FormRegistro.numeroEmpresas
        registroData.numeroUsuarios = this.FormRegistro.numeroUsuarios
        registroData.codigoAdministrador = this.FormRegistro.codigoAdministrador || ''
        registroData.usuarioAdministrador = this.FormRegistro.usuarioAdministrador
        registroData.usuarioAdministrador = this.FormRegistro.usuarioAdministrador
        registroData.descripcionSuscriptor = this.FormRegistro.descripcionSuscriptor
        registroData.envioCorreosSuscriptor = this.FormRegistro.envioCorreosSuscriptor
        registroData.envioMensajesSuscriptor = this.FormRegistro.envioMensajesSuscriptor
        registroData.envioPublicidadSuscriptor = this.FormRegistro.envioPublicidadSuscriptor
        registroData.estadoSuscriptor = this.FormRegistro.estadoSuscriptor
        console.log('nueva suscriptor', registroData);
        if (this.modoEdicion) {
            registroData.codigoSuscriptor = this.FormRegistro.codigoSuscriptor
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaModificacion = new Date().toISOString()
            this._suscriptoresService.actualizarSuscriptor(registroData).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        this.GestionarUsuarioUsuarioSC(registroData);
                        this._swalAlertService.getAlertSuccess(this.translate.instant('APLICACIONES.UPDATESUCCSESSFULLY'))
                        form.resetForm()
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('APLICACIONES.CREATESUCCSESSFULLY')
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalAlertService.getAlertError('No se pudo actualizar la Aplicación')
                }
            });
        } else {
            registroData.codigoSuscriptor = uuidv4()
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario || ''
            registroData.fechaCreacion = new Date().toISOString()
            this._suscriptoresService.crearSuscriptor(registroData).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        this.GestionarUsuarioUsuarioSC(registroData);
                        this._swalAlertService.getAlertSuccess(this.translate.instant('APLICACIONES.CREATESUCCSESSFULLY'))
                        form.resetForm()
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

    private GestionarUsuarioUsuarioSC(rawData: any) {
        const usuarioAdministrador: PTLUsuarioModel = {
            identificacionUsuario: rawData.identificacionSuscriptor,
            nombreUsuario: 'adm_' + rawData.nombreSuscriptor,
            correoUsuario: rawData.correoSuscriptor,
            userNameUsuario: rawData.usuarioAdministrador,
            claveUsuario: rawData.claveNew,
            descripcionUsuario: '',
            fotoUsuario: 'no-imagen.png',
            usuarioAdministrador: true,
            estadoUsuario: true,
            codigoUsuarioCreacion: rawData.codigoUsuarioCreacion,
            fechaCreacion: new Date().toISOString()
        };
        console.log('usuario administrador', usuarioAdministrador);

        // const indexExiste = this.usuarios.findIndex(x => x.userNameUsuario?.trim().toLocaleLowerCase() == rawData.usuarioAdministrador.trim().toLocaleLowerCase());
        // if (indexExiste == -1) {
        //     usuarioAdministrador.codigoUsuario = uuidv4()
        //     this._usuariosService.postCrearUsuario(usuarioAdministrador).subscribe({
        //         next: (data: any) => this.crearUsuarioSC(rawData.codigoSuscriptor, data.usuario.codigoUsuario),
        //         error: (err) => {
        //             const rutaTraduccion = `USUARIOS.USUARIOS.GESTION.${err}`;
        //         }
        //     });
        // } else {
        //     const usuario = this.usuarios[indexExiste];
        //     usuarioAdministrador.codigoUsuario = usuario.codigoUsuario,
        //         this._usuariosService.actualizarUsuario(usuarioAdministrador).subscribe({
        //             next: (data: any) => this.crearUsuarioSC(rawData.codigoSuscriptor, usuario.codigoUsuario),
        //             error: (err) => {
        //                 const rutaTraduccion = `USUARIOS.USUARIOS.GESTION.${err}`;
        //             }
        //         });
        // }
    }

    private crearUsuarioSC(codigoSuscriptor: string, codigoUsuario: any) {
        const usuarioSC: PTLUsuarioSCModel = {
            codigoUsuarioSC: uuidv4(),
            codigoUsuario: codigoUsuario,
            codigoSuscriptor: codigoSuscriptor,
            estadoUsuarioSC: true,
            codigoUsuarioCreacion: this._localStorageService.getUsuarioLocalStorage().codigoUsuario,
            fechaCreacion: new Date().toISOString(),
            codigoUsuarioModificacion: '',
            fechaModificacion: ''
        };

        // CREAR USUARIOSC
        this._usuariosSCService.postCrearUsuario(usuarioSC).subscribe({
            next: () => this.finalizarRegistro(codigoSuscriptor),
            error: (err) => {
                const error = err.error?.msg || 'Error al validar datos'
                console.log('Error: ', error);
                this.finalizarRegistro(codigoSuscriptor);
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
