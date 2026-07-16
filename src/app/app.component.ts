import { Component, OnInit } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import {
    AuthenticationService,
    LanguageService,
    LocalStorageService,
    PtlAplicacionesService,
    PtlBibliotecasService,
    PtlEmpresasScService,
    PtlformatosGaleriaService,
    PtlGaleriasService,
    PtlidiomasService,
    PtlmodulosApService,
    PTLRolesAPService,
    PtlSlidersInicioService,
    PtlSuitesAPService,
    PTLSuscriptoresService,
    PtlTiposGaleriaService,
    PtlusuariosEmpresasScService,
    PtlusuariosRolesApService,
    PtlusuariosScService,
    ThemeService
} from './theme/shared/service'
import { PtlActividadesService } from './theme/shared/service/ptlactividades.service'
import { PtlactividadesRolesService } from './theme/shared/service/ptlactividades-roles.service'
import { PuertosService } from './theme/shared/service/tablero-control/puertos.service'
import { TerminalesService } from './theme/shared/service/tablero-control/terminales.service'
import { MuellesService } from './theme/shared/service/tablero-control/muelles.service'
import { WidgetsService } from './theme/shared/service/tablero-control/widgets.service'
import { LayoutService } from './theme/shared/service/tablero-control/layout.service'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    usuario: string = ''

    constructor(
        private router: Router,
        private _themeService: ThemeService,
        private _authenticationService: AuthenticationService,
        private _localStorageService: LocalStorageService,
        private _actividadesService: PtlActividadesService,
        private _actividadesRolesService: PtlactividadesRolesService,
        private _aplicacionesService: PtlAplicacionesService,
        private _modulosService: PtlmodulosApService,
        private _suitesService: PtlSuitesAPService,
        private _usuariosRolesService: PtlusuariosRolesApService,
        private _usuariosSCService: PtlusuariosScService,
        private _usuariosEmpresasService: PtlusuariosEmpresasScService,
        private _bibliotecasService: PtlBibliotecasService,
        private _galeriasService: PtlGaleriasService,
        private _formatosGaleriaService: PtlformatosGaleriaService,
        private _tiposGaleriaService: PtlTiposGaleriaService,
        private _empresasSCService: PtlEmpresasScService,
        private _idiomasService: LanguageService,
        private _suscriptoresService: PTLSuscriptoresService,
        private _slidersService: PtlSlidersInicioService,
        private _puertosService: PuertosService,
        private _terminalesService: TerminalesService,
        private _muellesService: MuellesService,
        private _rolesAPService: PTLRolesAPService,
        private _widgetsService: WidgetsService,
        private _layoutService: LayoutService
    ) { }

    ngOnInit() {
        this.router.events.subscribe(evt => {
            if (evt instanceof NavigationEnd) {
                window.scrollTo(0, 0)
            }
        })
        const themeSettings = this._localStorageService.getThemeSettings()
        if (themeSettings) {
            this._themeService.setDarkTheme(themeSettings.isDarkTheme)
        }
        const token = this._localStorageService.getTokenLocalStorage()
        if (token) {
            console.log('AppComponent: Token detectado en carga, iniciando carga de datos...')
            this.loadProtectedData()
        } else {
            this.router.navigate(['autenticacion/login'])
        }
        this._authenticationService.isLoggedIn$.subscribe(isLoggedIn => {
            if (isLoggedIn) {
                console.log('AppComponent: Notificación de Login exitoso recibida, iniciando carga de datos...')
                this.loadProtectedData()
            }
        })
    }

    private loadProtectedData(): void {
        this.usuario = this._localStorageService.getUsuarioLocalStorage() || 'SISTEMA_DEFAULT'

        this._actividadesService.cargarRegistros().subscribe(
            () => console.log('** Actividades cargadas y guardadas en el servicio'),
            err => console.error('Error al cargar roles:', err)
        )
        this._actividadesRolesService.cargarRegistros().subscribe(
            () => console.log('** Actividades Roles cargadas y guardadas en el servicio'),
            err => console.error('Error al cargar roles:', err)
        )
        this._aplicacionesService.cargarAplicaciones().subscribe(
            () => console.log('** Aplicaciones cargadas y guardadas en el servicio'),
            err => console.error('Error al cargar aplicaciones:', err)
        )
        this._modulosService.cargarRegistros().subscribe(
            () => console.log('** Modulos cargadas y guardadas en el servicio'),
            err => console.error('Error al cargar modulos:', err)
        )
        this._suitesService.cargarRegistros().subscribe(
            () => console.log('** Suites cargadas y guardadas en el servicio'),
            err => console.error('Error al cargar suites:', err)
        )
        this._rolesAPService.cargarRegistros().subscribe(
            () => console.log('** Roles cargadas y guardadas en el servicio'),
            err => console.error('Error al cargar roles:', err)
        )
        this._usuariosRolesService.cargarRegistros().subscribe(
            () => console.log('** Usuarios Roles cargadas y guardadas en el servicio'),
            err => console.error('Error al cargar roles:', err)
        )
        this._suscriptoresService.getRegistros().subscribe(
            () => console.log('** Suscriptores cargadas y guardadas en el servicio'),
            err => console.error('Error al cargar Suscriptores:', err)
        )
        this._empresasSCService.cargarRegistros().subscribe(
            () => console.log('** EmpresasSC cargadas y guardadas en el servicio'),
            err => console.error('Error al cargar EmpresasSC:', err)
        )
        this._usuariosSCService.cargarRegistros().subscribe(
            () => console.log('** UsuariosSC cargadas y guardadas en el servicio'),
            err => console.error('Error al cargar UsuariosSC:', err)
        )
        // this._usuariosEmpresasService.cargarRegistros().subscribe(
        //     () => console.log('** UsuariosEmpresasSC cargadas y guardadas en el servicio'),
        //     err => console.error('Error al cargar UsuariosEmpresasSC:', err)
        // )
        this._bibliotecasService.cargarBibliotecas().subscribe(
            () => console.log('** bibliotecas cargadas y guardadas en el servicio'),
            err => console.error('Error al cargar bibliotecas:', err)
        )
        // this._galeriasService.cargarGaleria().subscribe(
        //     () => console.log('** galerias cargadas y guardadas en el servicio'),
        //     err => console.error('Error al cargar galerias:', err)
        // )
        this._formatosGaleriaService.cargarFormatosGaleria().subscribe(
            () => console.log('** formatosGaleria cargadas y guardadas en el servicio'),
            err => console.error('Error al cargar formatosGaleria:', err)
        )
        this._tiposGaleriaService.cargarTiposGaleria().subscribe(
            () => console.log('** tiposGaleria cargadas y guardadas en el servicio'),
            err => console.error('Error al cargar tiposGaleria:', err)
        )
        this._idiomasService.cargarRegistros().subscribe(
            () => console.log('** idiomas cargados y guardados en el servicio'),
            err => console.error('Error al cargar idiomas:', err)
        )
        this._slidersService.cargarSliders().subscribe(
            () => console.log('** sliders cargados y guardados en el servicio'),
            err => console.error('Error al cargar sliders:', err)
        )

        this._puertosService.cargarPuertos().subscribe(
            () => console.log('** puertos cargados y guardados en el servicio'),
            err => console.error('Error al cargar puertos:', err)
        )
        this._terminalesService.cargarTerminals().subscribe(
            () => console.log('** terminales cargados y guardados en el servicio'),
            err => console.error('Error al cargar terminales:', err)
        )
        this._muellesService.cargarMuelles().subscribe(
            () => console.log('** muelles cargados y guardados en el servicio'),
            err => console.error('Error al cargar muelles:', err)
        )
        this._widgetsService.cargarWidgets().subscribe(
            () => console.log('** widgets cargados y guardados en el servicio'),
            err => console.error('Error al cargar widgets:', err)
        )
        this._layoutService.cargarLayout().subscribe(
            () => console.log('** layouts cargados y guardados en el servicio'),
            err => console.error('Error al cargar layouts:', err)
        )
    }
}
