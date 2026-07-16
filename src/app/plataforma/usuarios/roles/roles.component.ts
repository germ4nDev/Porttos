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
import { PTLRoleAPModel } from 'src/app/theme/shared/_helpers/models/PTLRoleAP.model'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { NavigationService, PtlAplicacionesService, LanguageService, PtlSuitesAPService } from 'src/app/theme/shared/service'
import { of, Subscription } from 'rxjs'
import Swal from 'sweetalert2'
import { PtllogActividadesService, PTLRolesAPService, SwalAlertService } from 'src/app/theme/shared/service'
import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model'
import { DataLoaderComponent } from 'src/app/theme/shared/components/data-loader/data-loader.component'
//#endregion IMPORTS

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent, DataLoaderComponent],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit {
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
  filtroTipoRolSubject = new BehaviorSubject<string>('todos')
  filtroCodigoRoleSubject = new BehaviorSubject<string>('todos')
  filtroCodigoAplicacionSubject = new BehaviorSubject<string>('todos')
  filtroCodigoSuiteSubject = new BehaviorSubject<string>('todos')
  filtroNombreSubject = new BehaviorSubject<string>('todos')
  filtroDescripcionSubject = new BehaviorSubject<string>('')
  filtroEstadoSubject = new BehaviorSubject<string>('todos')

  registrosTransformados$: Observable<PTLRoleAPModel[]> = of([])
  registrosFiltrado$: Observable<PTLRoleAPModel[]> = of([])
  roles: PTLRoleAPModel[] = []
  registros: PTLRoleAPModel[] = []
  aplicaciones: PTLAplicacionModel[] = []
  suites: PTLSuiteAPModel[] = []
  //#endregion VARIABLES

  constructor (
    private router: Router,
    private translate: TranslateService,
    private _navigationService: NavigationService,
    private _aplicacionesService: PtlAplicacionesService,
    private _suitesService: PtlSuitesAPService,
    private _rolesAPService: PTLRolesAPService,
    private _logActividadesService: PtllogActividadesService,
    private _swalService: SwalAlertService,
    private _languageService: LanguageService
  ) {
    this.gradientConfig = GradientConfig
  }

  ngOnInit () {
    this._navigationService.getNavigationItems()
    this.menuItems$ = this._navigationService.menuItems$
    this.hasFiltersSlot = true
    this.consultarAplicaciones()
    this.consultarSuites()
    setTimeout(() => {
      this.setupRolesStream()
    }, 100)
    this.subscriptions.add(
      this._rolesAPService.cargarRegistros().subscribe(
        () => console.log('Roles cargados y guardados en el servicio'),
        err => console.error('Error al cargar roles:', err)
      )
    )
  }

  ngOnDestroy (): void {
    this.subscriptions.unsubscribe()
  }

  consultarAplicaciones () {
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

  consultarSuites () {
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

  columnasRegistros: ColumnMetadata[] = [
    {
      name: 'nombreRole',
      header: 'USUARIOS.ROLES.NOMBREROL',
      type: 'text'
    },
    {
      name: 'nomEstado',
      header: 'USUARIOS.ROLES.ESTADOROLE',
      type: 'estado'
    },
    {
      name: 'tipoRol',
      header: 'USUARIOS.ROLES.TIPOROLE',
      type: 'text'
    }
  ]

  columnasDetailRegistros: ColumnMetadata[] = [
    {
      name: 'nomAplicacion',
      header: 'USUARIOS.ROLES.NOMBREAPLICACION',
      type: 'text'
    },
    {
      name: 'nomSuite',
      header: 'USUARIOS.ROLES.NOMBRESUITE',
      type: 'text'
    },
    {
      name: 'descripcionRole',
      header: 'USUARIOS.ROLES.DESCRIPCIONROL',
      type: 'text'
    }
  ]

  setupRolesStream (): void {
    this.registrosTransformados$ = this._rolesAPService.roles$.pipe(
      switchMap((roles: PTLRoleAPModel[]) => {
        // console.log('================== roles 1', roles);
        if (!roles) return of([])
        this.roles = roles
        const transformedApps = roles.map((role: any) => {
          role.nomEstado = role.estadoRole ? 'Activo' : 'Inactivo'

          const appEncontrada = role.codigoAplicacion ? this.aplicaciones.find(x => x.codigoAplicacion === role.codigoAplicacion) : null
          role.nomAplicacion = appEncontrada ? appEncontrada.nombreAplicacion : 'N/A'

          const suiteEncontrada = role.codigoSuite ? this.suites.find(x => x.codigoSuite === role.codigoSuite) : null
          role.nomSuite = suiteEncontrada ? suiteEncontrada.nombreSuite : 'N/A'

          role.tipoRol = role.codigoAplicacion ? 'Suscriptor' : 'Plataforma'

          // role.nomAplicacion = this.aplicaciones.filter((x) => x.codigoAplicacion == role.codigoAplicacion)[0].nombreAplicacion || '';
          //   role.nomSuite = this.suites.filter((x) => x.codigoSuite == role.codigoSuite)[0].nombreSuite || '';
          return role as PTLRoleAPModel
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
      this.filtroCodigoAplicacionSubject,
      this.filtroCodigoSuiteSubject,
      this.filtroNombreSubject,
      this.filtroDescripcionSubject,
      this.filtroEstadoSubject,
      this.filtroTipoRolSubject
    ]).pipe(
      map(([roles, codigorol, codigoapp, codigosuite, nombre, descripcion, estado, tipoRol]) => {
        // console.log('================== roles 2', roles);

        let filteredRegistros = roles
        if (tipoRol !== 'todos') {
          filteredRegistros = filteredRegistros.filter(reg => {
            const esSuscriptor = reg.codigoAplicacion && reg.codigoAplicacion !== ''
            return tipoRol === 'suscriptor' ? esSuscriptor : !esSuscriptor
          })
        }
        if (codigorol !== 'todos') {
          filteredRegistros = filteredRegistros.filter(reg => reg.codigoRole === codigorol)
        }
        if (codigoapp !== 'todos') {
          filteredRegistros = filteredRegistros.filter(reg => reg.codigoAplicacion === codigoapp)
        }
        if (codigosuite !== 'todos') {
          filteredRegistros = filteredRegistros.filter(reg => reg.codigoSuite === codigosuite)
        }
        if (nombre !== 'todos') {
          filteredRegistros = filteredRegistros.filter(reg => reg.nombreRole === nombre)
        }
        if (estado !== 'todos') {
          const estadoBoolean = estado === 'true'
          filteredRegistros = filteredRegistros.filter(reg => reg.estadoRole === estadoBoolean)
        }
        if (descripcion) {
          const textoFiltro = descripcion.toLowerCase()
          filteredRegistros = filteredRegistros.filter(app => (app.descripcionRole || '').toLowerCase().includes(textoFiltro))
        }
        return filteredRegistros
      })
    )
  }

  onFiltroTipoRolChangeClick (evento: any): void {
    const value = evento.target.value
    this.filtroTipoRolSubject.next(value)
  }

  onFiltroCodigoAplicacionChangeClick (evento: any): void {
    const value = evento.target.value
    this.filtroCodigoAplicacionSubject.next(value)
  }
  onFiltroCodigoSuiteChangeClick (evento: any) {
    const value = evento.target.value
    this.filtroCodigoSuiteSubject.next(value)
  }

  onFiltroCodigoRoleChangeClick (evento: any): void {
    const value = evento.target.value
    this.filtroCodigoRoleSubject.next(value)
  }

  onFiltroNombreChangeClick (evento: any): void {
    const value = evento.target.value
    this.filtroNombreSubject.next(value)
  }

  onFiltroDescripcionChangeClick (evento: any): void {
    const value = evento.target.value
    this.filtroDescripcionSubject.next(value)
  }

  onFiltroEstadoChangeClick (evento: any): void {
    const value = evento.target.value
    this.filtroEstadoSubject.next(value)
  }

  OnNuevoRegistroClick () {
    this.router.navigate(['usuarios/gestion-roles'])
  }

  OnEditarRegistroClick (id: number) {
    this.router.navigate(['usuarios/gestion-roles'], { queryParams: { regId: id } })
  }

  OnEliminarRegistroClick (id: any) {
    const nombre = this.registros.filter(x => x.codigoRole == id.id)[0]
    Swal.fire({
      title: this.translate.instant('USUARIOS.ROLES.ELIMINARTITULO'),
      text: this.translate.instant('USUARIOS.ROLES.ELIMINARTEXTO') + `"${nombre.nombreRole}".!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
      cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
    }).then((result: any) => {
      if (result.isConfirmed) {
        this._rolesAPService.deleteEliminarRegistro(id.id).subscribe({
          next: (resp: any) => {
            const logData = {
              codigoTipoLog: '',
              codigoRespuesta: '201',
              descripcionLog: this.translate.instant('USUARIOS.ROLES.ELIMINAREXITOSA') + ' ' + resp.mensaje
            }
            this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
            this._rolesAPService.cargarRegistros().subscribe(() => {
              this._swalService.getAlertSuccess(this.translate.instant('USUARIOS.ROLES.ELIMINAREXITOSA'))
            })
          },
          error: (err: any) => {
            const logData = {
              codigoTipoLog: '',
              codigoRespuesta: '201',
              descripcionLog: this.translate.instant('USUARIOS.ROLES.ELIMINARERROR') + ' ' + err.mensaje
            }
            this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
            this._swalService.getAlertSuccess(this.translate.instant('USUARIOS.ROLES.ELIMINARERROR') + ' ' + err.mensaje)
            this.setupRolesStream()
            console.error('Error eliminando', err)
          }
        })
      }
    })
  }

  toggleNav (): void {
    this.toggleSidebar.emit()
  }
}
