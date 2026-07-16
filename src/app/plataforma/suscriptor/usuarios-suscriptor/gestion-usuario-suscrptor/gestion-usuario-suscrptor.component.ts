
/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { ActivatedRoute, Router, Event } from '@angular/router';
import { PtlAplicacionesService } from 'src/app/theme/shared/service/ptlaplicaciones.service'
import { catchError, Observable, of, Subscription, tap } from 'rxjs'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GradientConfig } from 'src/app/app-config'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { LayoutInitializerService } from 'src/app/theme/shared/service/layout-initializer.service'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { v4 as uuidv4 } from 'uuid'
import { PtlSuitesAPService } from 'src/app/theme/shared/service/ptlsuites-ap.service'
import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model'
import { PtlmodulosApService } from 'src/app/theme/shared/service/ptlmodulos-ap.service'
import { PTLModuloAP } from 'src/app/theme/shared/_helpers/models/PTLModuloAP.model'
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component'
import {
    AuthenticationService,
    LocalStorageService,
    PtlEmpresasScService,
    PtllogActividadesService,
    PtlusuariosEmpresasScService,
    SwalAlertService,
    UploadFilesService
} from 'src/app/theme/shared/service'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { PTLUsuarioModel } from 'src/app/theme/shared/_helpers/models/PTLUsuario.model'
import { PTLSuscriptorModel } from 'src/app/theme/shared/_helpers/models/PTLSuscriptor.model'
import { PTLUsuarioSCModel } from 'src/app/theme/shared/_helpers/models/PTLUsuarioSC.model'
import { PTLSuscriptoresService, PtlusuariosScService } from 'src/app/theme/shared/service'
import { PTLUsuariosService } from 'src/app/theme/shared/service/ptlusuarios.service'
import { PTLEmpresaSCModel } from 'src/app/theme/shared/_helpers/models/PTLEmpresaSC.model'
import { PTLUsuaioEmpresasSCModel } from 'src/app/theme/shared/_helpers/models/PTLUsuarioEmpresaSC.model'
import { event } from 'jquery';

@Component({
    selector: 'app-gestion-usuario-suscrptor',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-usuario-suscrptor.component.html',
    styleUrl: './gestion-usuario-suscrptor.component.scss'
})
export class GestionUsuarioSuscrptorComponent {
    // #region VARIABLES
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: PTLUsuarioModel = new PTLUsuarioModel()
    usuarioSC: PTLUsuarioSCModel = new PTLUsuarioSCModel()
    menuItems!: Observable<NavigationItem[]>
    gradientConfig: any
    navCollapsed: boolean = false
    navCollapsedMob: boolean = false
    windowWidth: number = 0
    form: undefined
    isSubmit: boolean
    modoEdicion: boolean = false
    aplicacionesSub?: Subscription
    aplicaciones: PTLAplicacionModel[] = []
    suitesSub?: Subscription
    modulosSub?: Subscription
    suites: PTLSuiteAPModel[] = []
    empresasSC: PTLEmpresaSCModel[] = []
    usuariosEmpresasSC: PTLUsuaioEmpresasSCModel[] = []
    empresasSCSeleccionadas: PTLEmpresaSCModel[] = []

    codigoUsuarioSC = uuidv4()
    tipoEditorTexto = 'basica'
    lockScreenSubscription: Subscription | undefined
    isLocked: boolean = false
    lockMessage: string = ''

    suscriptoresSub?: Subscription;
    suscriptores: PTLSuscriptorModel[] = [];
    usuariosSC: PTLUsuarioSCModel[] = []
    usuariosSub?: Subscription;
    usuarios: PTLUsuarioModel[] = []
    subscriptions = new Subscription()
    codigoRegistro: string = '';
    codigoSuscriptor: string = '';
    isClaveActual: boolean = true
    selectedFileUrl: string | null = null
    userPhotoUrl: string = ''
    fileName: string = ''
    nomSuscriptor: string = '';

    // #endregion VARIABLES

    // constructor
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _translate: TranslateService,
        private _empresasSCService: PtlEmpresasScService,
        private _usuariosEmpresasService: PtlusuariosEmpresasScService,
        private _registrosService: PTLUsuariosService,
        private _layoutInitializer: LayoutInitializerService,
        private _logActividadesService: PtllogActividadesService,
        private _swalAlertService: SwalAlertService,
        private _localStorageService: LocalStorageService,
        private _usuariosService: PTLUsuariosService,
        private _usuariosSCService: PtlusuariosScService,
        private _suscriptoresService: PTLSuscriptoresService,
        private _navigationService: NavigationService,
        private _authService: AuthenticationService,
        private _uploadService: UploadFilesService,
    ) {
        this.isSubmit = false;
        this.route.queryParams.subscribe((params) => {
            this.codigoRegistro = params['regId'] || '';
            this.codigoSuscriptor = params['stId'] || '';
            this.consultarSuscriptores(this.codigoSuscriptor);
            console.log('CODIGO SUSCRIPTOR', this.codigoSuscriptor);
            this.codigoSuscriptor = this.codigoSuscriptor;
            if (this.codigoRegistro !== 'nuevo' && this.codigoRegistro !== '') {
                console.log('me llena el Id', this.codigoRegistro);
                console.log('me llena USAURIOS', this.usuarios);
                this.modoEdicion = true;
                this._usuariosSCService.getUsuariosByCode(this.codigoRegistro).subscribe({
                    next: (resp: any) => {
                        // const usuario = this.usuarios.find(x => x.codigoUsuario == resp.usuarioSC.codigoUsuario)
                        this.consultarUsuarios(this.codigoRegistro);
                        // this.FormRegistro = usuario || {};
                    },
                    error: () => {
                        this._swalAlertService.getAlertError('No se pudo obtener el usuarioSC');
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
        this.consultarUsuarios()
        this.consultarSuscriptores(this.codigoSuscriptor);
        this._layoutInitializer.applyLayout()
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
            console.log('modo edicion', this.modoEdicion);
            // this.FormRegistro = new PTLUsuarioModel();
            this.FormRegistro.codigoUsuario = uuidv4();
            this.FormRegistro.identificacionUsuario = '';
            this.FormRegistro.nombreUsuario = '';
            this.FormRegistro.codigoUsuario = '';
            this.FormRegistro.claveActual = '';
            this.FormRegistro.claveConfirm = '';
            this.FormRegistro.claveUsuario = '';
            this.FormRegistro.descripcionUsuario = '';
            this.FormRegistro.estadoUsuario = false;
            this.FormRegistro.fotoUsuario = '';
            console.log('FormRegistro', this.FormRegistro);
        }
    }

    consultarUsuarios(codUsuario?: string) {
        this.usuariosSub = this._usuariosService
            .getUsuarios()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.usuarios = resp.usuarios;
                        if(codUsuario){
                            this.FormRegistro = this.usuarios.find(x => x.codigoUsuario == codUsuario) || {};
                        }
                        console.log('Todos los usuarios', this.usuarios)
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

    consultarSuscriptores(codSuscriptor?: string) {
        this.suscriptoresSub = this._suscriptoresService
            .getSuscriptores()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        const suscriptor = resp.suscriptores.find((x: { codigoSuscriptor: string | undefined }) => x.codigoSuscriptor == codSuscriptor);
                        this.nomSuscriptor = suscriptor.nombreSuscriptor;
                        console.log('Todos los suscriptores', this.suscriptores)
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

    consultarEmpresasSC(codSuscriptor?: string) {
        this.subscriptions.add(
            this._empresasSCService.cargarRegistros().subscribe((resp: any) => {
                if (resp.ok) {
                    this.empresasSC = resp.empresasSC.filter((x: { codigoSuscriptor: string | undefined }) => x.codigoSuscriptor == codSuscriptor)
                    console.log('Todos las empresasSC', this.empresasSC)
                    return
                }
            })
        )
    }

    onSuscriptorChangeClick(event: any) {
        const value = event.target.value
        this.consultarEmpresasSC(value)
        const susc = this.suscriptores.filter(x => x.codigoSuscriptor == value)[0]
        // this.FormRegistro.codigoAplicacion = app.codigoAplicacion || ''
        // this.consultarSuites(app.codigoAplicacion)
    }

    onUsuarioChangeClick(event: any) {
        const value = event.target.value
        const usua = this.usuarios.filter(x => x.codigoUsuario == value)[0]
        // this.FormRegistro.codigoAplicacion = app.codigoAplicacion || ''
        // this.consultarSuites(app.codigoAplicacion)
    }

    onEmpresasSCClickChange(event: any, empresa: PTLEmpresaSCModel) {
        const value = event.target.value
        const empre = this.empresasSC.filter(x => x.codigoEmpresaSC == value)[0]
        this.empresasSCSeleccionadas.push(empre)
        // this.FormRegistro.codigoAplicacion = app.codigoAplicacion || ''
        // this.consultarSuites(app.codigoAplicacion)
    }

    btnGestionarRegistroClick(form: any) {
        this.isSubmit = true
        if (!form.valid) {
            return;
        }
        const registroData = form.value as PTLUsuarioSCModel
        console.log('insertar formRegistro', registroData)
        this.onGestionarUsuarioEmpresa(this.FormRegistro.codigoUsuario || '')
        if (this.modoEdicion) {
            registroData.codigoUsuarioCreacion = this.FormRegistro.codigoUsuarioCreacion
            registroData.fechaCreacion = this.FormRegistro.fechaCreacion
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaModificacion = new Date().toISOString()
            this._usuariosSCService.actualizarUsuario(registroData).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this._translate.instant('PLATAFORMA.MODIFICAR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalAlertService.getAlertSuccess(this._translate.instant('PLATAFORMA.MODIFICAR'))
                        this.router.navigate(['/suscriptores/usuarios-suscriptor'])
                    } else {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this._translate.instant('PLATAFORMA.NOMODIFICO')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalAlertService.getAlertError(resp.message || this._translate.instant('PLATAFORMA.NOMODIFICO'))
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this._translate.instant('PLATAFORMA.NOMODIFICO') + ', ' + err.message
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalAlertService.getAlertError(this._translate.instant('PLATAFORMA.NOMODIFICO'))
                }
            })
        } else {
            registroData.codigoUsuarioSC = uuidv4()
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaCreacion = new Date().toISOString()
            registroData.codigoUsuarioModificacion = ''
            registroData.fechaModificacion = ''
            console.log('insertar registro', registroData)
            this._usuariosSCService.crearUsuario(registroData).subscribe({
                next: (resp: any) => {
                    console.log('reesp', resp.modulo)
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this._translate.instant('PLATAFORMA.INSERTAR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalAlertService.getAlertSuccess(this._translate.instant('PLATAFORMA.INSERTAR'))
                        form.resetForm()
                        this.isSubmit = false
                        this.router.navigate(['/suscriptores/usuarios-suscriptor'])
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this._translate.instant('PLATAFORMA.NOINSERTO') + ', ' + err.message
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalAlertService.getAlertError(this._translate.instant('PLATAFORMA.NOINSERTO') + ', ' + err)
                }
            })
        }
    }

    onGestionarUsuarioEmpresa(codigoUsuario: string) {
        this.empresasSC.forEach(emp => {
            if (emp.checked === false) {
                const existe = this.usuariosEmpresasSC.find(
                    (sel: any) => sel.codigoUsuario == codigoUsuario && sel.codigoEmpresaSC == emp.codigoEmpresaSC
                )
                if (existe) {
                    const reg = this.usuariosEmpresasSC.filter(
                        (sel: any) => sel.codigoUsuario == codigoUsuario && sel.codigoEmpresaSC == emp.codigoEmpresaSC
                    )[0]
                    const regCodigo = reg.codigoUsuarioEmpresaSC || ''
                    this._usuariosEmpresasService
                        .deleteEliminarRegistro(regCodigo)
                        .subscribe((data: any) => console.log('usuarios empresa eliminado con exito' + reg))
                }
            }
        })

        if (this.empresasSCSeleccionadas.length > 0) {
            this.empresasSCSeleccionadas.forEach((empre: any) => {
                const existe = this.usuariosEmpresasSC.find(
                    (sel: any) => sel.codigoUsuario == codigoUsuario && sel.codigoEmpresaSC == empre.codigoEmpresaSC
                )
                console.log('existe', existe)
                if (!existe) {
                    const usuEmpresa: PTLUsuaioEmpresasSCModel = {
                        codigoUsuarioEmpresaSC: uuidv4(),
                        codigoEmpresaSC: empre.codigoEmpresaSC,
                        codigoUsuarioSC: codigoUsuario,
                        estadoUsuarioEmpresaSC: true,
                        codigoUsuarioCreacion: this._localStorageService.getUsuarioLocalStorage().codigoUsuario,
                        fechaCreacion: new Date().toISOString(),
                        codigoUsuarioModificacion: '',
                        fechaModificacion: ''
                    }
                    this._usuariosEmpresasService
                        .postCrearRegistro(usuEmpresa)
                        .subscribe((data: any) => console.log('usuarios empresa creado con exito' + usuEmpresa))
                }
            })
        }
    }

    validarClaveActual(claveActual: any) {
        // console.log('validar la clave', claveActual);
        const userName = this.FormRegistro.userNameUsuario || ''
        // console.log('validar el usuario', userName, claveActual);
        // console.log('data el usuario', this.FormRegistro);
        this._authService.verificarClaveActual(userName, claveActual).subscribe((data: any) => {
            //   console.log('data', data);
            if (data.ok == true) {
                if (this.FormRegistro.usuarioId === data.usuario.usuarioId) {
                    this.isClaveActual = false
                    //   console.log('respuesta perfil', data);
                }
            } else {
                this.FormRegistro.claveNew = ''
                this.FormRegistro.claveConfirm = ''
                this.isClaveActual = true
            }
        })
    }

    actualizarDescripcionRegistro(nuevoContenido: string): void {
        this.FormRegistro.descripcionUsuario = nuevoContenido
        // console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionUsuario);
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    onFileSelectedClick(event: any) {
        const file: File = event.target.files[0]
        const codigo =
            this._localStorageService.getSuscriptorLocalStorage()?.codigoSuscriptor ||
            this._localStorageService.getSuscriptorPlataformaLocalStorage()
        const objUpload = {
            susc: codigo,
            tipo: 'usuarios',
            id: '0'
        }
        // console.log('objUpload', objUpload);
        if (file) {
            const reader = new FileReader()
            reader.onload = (e: any) => {
                this.selectedFileUrl = e.target.result
            }
            reader.readAsDataURL(file)
            this._uploadService.uploadUserPhoto(file, objUpload).subscribe({
                next: (path: any) => {
                    //   console.log('resultado++++++++++++++++', path);
                    this.fileName = path.nombreArchivo
                    this.FormRegistro.fotoUsuario = path.nombreArchivo
                },
                error: () => {
                    this._swalAlertService.getAlertError(this._translate.instant('PLATAFORMA.UPLOADPHOTOERROR'))
                }
            })
        } else {
            this.selectedFileUrl = null
            this.userPhotoUrl = ''
        }
    }

    onIdentificacionChangeClick(event: any) {
        const valorEvent = event.target.value;
        const usuario = this.usuarios.find(x => x.identificacionUsuario == valorEvent);
        this.FormRegistro.codigoUsuario = uuidv4();
        this.FormRegistro.identificacionUsuario = event.target.value;
        this.FormRegistro.nombreUsuario = '';
        this.FormRegistro.claveUsuario = '';
        this.FormRegistro.claveConfirm = '';
        this.FormRegistro.descripcionUsuario = '';
        this.FormRegistro.estadoUsuario = true;
        this.FormRegistro.correoUsuario = '';
        this.FormRegistro.nombreUsuario = '';
        this.FormRegistro.userNameUsuario = '';
        if (usuario) {
            this.FormRegistro = usuario;
            this.FormRegistro.claveUsuario = '';
        }
    }

    btnRegresarClick() {
        if (this.codigoRegistro == 'nuevo') {
            this.router.navigate(['/suscriptor/usuarios-suscriptor/'], { queryParams: { regId: this.codigoSuscriptor } });
        }
        else {
            this.router.navigate(['/suscriptor/usuarios-suscriptor/'], { queryParams: { regId: this.usuarioSC.codigoSuscriptor } });
        }
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
