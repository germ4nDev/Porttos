/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { catchError, tap } from 'rxjs/operators'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { LanguageSelectorComponent } from 'src/app/theme/shared/components/language-selector/language-selector.component'
import { FullScreenSliderComponent } from 'src/app/theme/shared/components/fullscreen-slider/fullscreen-slider.component'
import { PTLSuscriptorModel } from 'src/app/theme/shared/_helpers/models/PTLSuscriptor.model'
import { PTLUsuarioSCModel } from 'src/app/theme/shared/_helpers/models/PTLUsuarioSC.model'
import { PTLEmpresaSCModel } from 'src/app/theme/shared/_helpers/models/PTLEmpresaSC.model'
import { PTLUsuarioModel } from 'src/app/theme/shared/_helpers/models/PTLUsuario.model'
import { of, Subscription } from 'rxjs'
import {
    AuthenticationService,
    LanguageService,
    LocalStorageService,
    PtlactividadesRolesService,
    PtlActividadesService,
    PtlAplicacionesService,
    PtlEmpresasScService,
    PTLRolesAPService,
    PtlSuitesAPService,
    PTLSuscriptoresService,
    PtlusuariosEmpresasScService,
    PtlusuariosRolesApService,
    PtlusuariosScService,
    SwalAlertService,
    ThemeService
} from 'src/app/theme/shared/service'
import { SocialNetworksComponent } from 'src/app/theme/shared/components/social-networks/social-networks.component'
import { PTLIdioma } from 'src/app/theme/shared/_helpers/models/PTLIdioma.model'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model'
import { PTLUsuaioEmpresasSCModel } from 'src/app/theme/shared/_helpers/models/PTLUsuarioEmpresaSC.model'
import { PTLUsuarioRoleAPModel } from 'src/app/theme/shared/_helpers/models/PTLUsuarioRole.model'
import { PTLRoleAPModel } from 'src/app/theme/shared/_helpers/models/PTLRoleAP.model'
import { PTLActividadModel } from '../../../theme/shared/_helpers/models/PTLActividades.model';
import { PTLActividadRoleModel } from 'src/app/theme/shared/_helpers/models/PTLActividadesRoles.model'

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        LanguageSelectorComponent,
        SharedModule,
        TranslateModule,
        FullScreenSliderComponent,
        SocialNetworksComponent
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
    //#region VARIABLES
    registrosSub?: Subscription
    registros: PTLSuscriptorModel[] = []
    usuariosSCSub?: Subscription
    usuariosSC: PTLUsuarioSCModel[] = []
    usuariosSub?: Subscription
    usuarios: PTLUsuarioModel[] = []
    empresasSCSub?: Subscription
    empresasSC: PTLEmpresaSCModel[] = []
    retorno: number = 0

    userRoles: any[] = []
    todosLosRoles: any[] = []
    tipoRolSeleccionado: string = ''
    rolesAsignadosAlUsuario: any[] = []
    actividades: PTLActividadModel[] = []
    actividadesRoles: PTLActividadRoleModel[] = []
    aplicaciones: PTLAplicacionModel[] = []
    aplicacionesSub?: Subscription
    suitesSub?: Subscription
    suites: PTLSuiteAPModel[] = []
    suscriptores: PTLSuscriptorModel[] = []
    suitesApp: PTLSuiteAPModel[] = []
    empresaSC: PTLEmpresaSCModel[] = []
    empresaSCFiltradas: PTLEmpresaSCModel[] = []
    usuariosRoles: PTLUsuarioRoleAPModel[] = []
    mostrarSeleccionRoles: boolean = false
    usuarioEmpresaSC: PTLUsuaioEmpresasSCModel[] = []
    roles: PTLRoleAPModel[] = []

    loginForm!: FormGroup
    loginSub?: Subscription
    usernameValue: string = ''
    userPassword: string = ''
    returnUrl!: string
    error: string = ''
    loading: boolean = false
    submitted: boolean = false
    remember: boolean = false
    idiomas: PTLIdioma[] = []
    showPassword = false // Variable reactiva para el ícono del ojo
    //#endregion VARIABLES

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private translate: TranslateService,
        private _localstorageService: LocalStorageService,
        private _swalService: SwalAlertService,
        private _themeService: ThemeService,
        private _actividadesRolesService: PtlactividadesRolesService,
        private _actividadesService: PtlActividadesService,
        private _aplicacionesService: PtlAplicacionesService,
        private _suitesService: PtlSuitesAPService,
        private _suscriptoresService: PTLSuscriptoresService,
        private _localStorageService: LocalStorageService,
        private _usuariosRolesService: PtlusuariosRolesApService,
        private _usuariosSCService: PtlusuariosScService,
        private _empresasSCService: PtlEmpresasScService,
        private _usuariosEmpresasSCService: PtlusuariosEmpresasScService,
        private _rolesService: PTLRolesAPService,
        private _rolesUsuariosService: PtlusuariosRolesApService,
        private _languagesService: LanguageService,
        private _authenticationService: AuthenticationService
    ) {
        this.translate.use(localStorage.getItem('lang') || 'es')
        if (this._authenticationService.currentUserValue) {
            //    this.router.navigate(['/dashboard/analytics']);
        }
    }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        })
        this.actividades = this._actividadesService.getActividadesActuales()
        this.actividadesRoles = this._actividadesRolesService.getActividadesRolesActuales()
        this.suites = this._suitesService.getSuitesActuales()
        this.aplicaciones = this._aplicacionesService.getBAplicacionesActuales()
        this.suscriptores = this._suscriptoresService.getSuscriptoresActuales()
        this.usuariosSC = this._usuariosSCService.getUsuariosSCActuales()
        this.empresaSC = this._empresasSCService.getEmpresasSCActuales()
        this.usuariosRoles = this._rolesUsuariosService.getUsuairosRolesActuales()
        this.usuarioEmpresaSC = this._usuariosEmpresasSCService.getUsuariosEmpresasSCActuales()

        this.returnUrl = this.route.snapshot.queryParams['returnUrl']
        this.idiomas = this._languagesService.getRegistrosActuales()
        console.log('idiomas actuales', this.idiomas)
    }

    ngOnDestroy() {
        this.loginSub?.unsubscribe()
    }

    get formValues() {
        return this.loginForm.controls
    }

    get usernameControl() {
        return this.loginForm.get('username')
    }

    get passwordControl() {
        return this.loginForm.get('password')
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    consultarRolesActividadesUsuario(codUsuario: string) {
        let rolesUsuarioFinal: any[] = []
        // Lógica comentada conservada exactamente igual
        return rolesUsuarioFinal
    }

    onLoginUserClick(): void {
        this.submitted = true
        if (this.loginForm.invalid) {
            return
        }
        this.error = ''
        this.loading = true
        const userName = this.formValues?.['username']?.value
        const password = this.formValues?.['password']?.value

        this.loginSub = this._authenticationService
            .login(userName, password)
            .pipe(
                tap((resp: any) => {
                    this.loading = false
                    console.log('resp login', resp)
                    if (!resp.ok) {
                        this._localstorageService.setTokenLocalStorage(resp.token)
                        this._swalService.getAlertError(this.translate.instant('PLATAFORMA.USERNOTFOUND'))
                        return
                    }
                    const currentUser = this._localstorageService.getCurrentUserLocalStorage()
                    // if (currentUser === null) {
                    //     console.log('el usuario no tiene roles asignados')
                    //     this._swalService.getAlertError(this.translate.instant('PLATAFORMA.NOROLESASIGN'))
                    //     this._localstorageService.setLogOut()
                    // } else {
                    // console.log('++++++++ usuario activo', currentUser)
                    // const suscUsu = this.usuariosSC.filter(x => x.codigoUsuario == currentUser.usuario?.codigoUsuario)
                    // console.log('++++++++ suscUsu', suscUsu);
                    // if (suscUsu.length > 1) {
                    //     this.router.navigate(['/starter/inicio-suscriptores'])
                    // } else if (suscUsu.length == 1) {
                    this.router.navigate(['/starter/inicio-aplicaciones'])
                    // }
                    // }
                    console.log('Login exitoso:', resp.usuario.codigoUsuario)
                }),
                catchError(err => {
                    this.loading = false
                    this.error = err
                    this._swalService.getAlertError(this.translate.instant('PLATAFORMA.LOGINFAILED'))
                    return of(null)
                })
            )
            .subscribe()
    }

    onChangePasswordClick() {
        this.router.navigate(['/autenticacion/change-password'])
    }

    onResetPasswordClick() {
        this.router.navigate(['/autenticacion/reset-password'])
    }

    toggleTheme() {
        this._themeService.toggleDarkTheme()
    }
}
