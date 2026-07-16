/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { DataTablesModule, DataTableDirective } from 'angular-datatables'
import { Subscription, tap, catchError, of, Observable } from 'rxjs'
import { GradientConfig } from 'src/app/app-config'

// Componentes de Layout
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component'
import { SharedModule } from 'src/app/theme/shared/shared.module'

// Modelos y Servicios
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { PTLScriptsModel } from 'src/app/theme/shared/_helpers/models/PTLScripts.model'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { PTLScriptsService } from 'src/app/theme/shared/service/ptlscripts.service'
import { LocalStorageService, PtllogActividadesService } from 'src/app/theme/shared/service'

import Swal from 'sweetalert2'

@Component({
  selector: 'app-scripts',
  standalone: true,
  imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
  templateUrl: './scripts.component.html',
  styleUrl: './scripts.component.scss'
})
export class ScriptsComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  @Output()
  toggleSidebar = new EventEmitter<void>()

  //#region VARIABLES
  registrosSub?: Subscription
  registros: PTLScriptsModel[] = []
  registrosFiltrado: PTLScriptsModel[] = []
  lang: string = localStorage.getItem('lang') || ''
  tituloPagina: string = ''
  gradientConfig
  hasFiltersSlot: boolean = false
  menuItems$!: Observable<NavigationItem[]>
  activeTab: 'menu' | 'filters' | 'main' = 'menu'
  datatableElement!: DataTableDirective

  constructor (
    private router: Router,
    private translate: TranslateService,
    private _scriptsService: PTLScriptsService,
    private _logActividadesService: PtllogActividadesService,
    private _localStorageService: LocalStorageService,
    private _navigationService: NavigationService
  ) {
    this.gradientConfig = GradientConfig
  }

  ngOnInit () {
    this._navigationService.getNavigationItems()
    this.menuItems$ = this._navigationService.menuItems$
    console.log('elementos menu componente', this.menuItems$)
    this.hasFiltersSlot = true
    this.consultarRegistros()
  }

  consultarRegistros () {
    this.registrosSub = this._scriptsService
      .getRegistros()
      .pipe(
        tap((resp: any) => {
          if (resp.ok) {
            resp.scripts.forEach((script: any) => {
              script.nomEstado = script.estadoScript == true ? 'Activo' : 'Inactivo'
            })
            this.registros = resp.scripts
            this.registrosFiltrado = resp.scripts
            console.log('Todos los scripts', this.registros)
            return
          }
        }),
        catchError(err => {
          console.log('Ha ocurrido un error', err)
          return of(null)
        })
      )
      .subscribe()
  }

  columnasScripts: ColumnMetadata[] = [
    {
      name: 'codigoScript',
      header: 'ADMINISTRACIONBD.SCRIPTS.CODIGO',
      type: 'text'
    },
    {
      name: 'nombreScript',
      header: 'ADMINISTRACIONBD.SCRIPTS.NOMBRE',
      type: 'text'
    },
    {
      name: 'codigoAplicacion',
      header: 'ADMINISTRACIONBD.SCRIPTS.APLICACION',
      type: 'text'
    },
    {
      name: 'codigoTipo',
      header: 'ADMINISTRACIONBD.SCRIPTS.TIPO',
      type: 'text'
    },
    {
      name: 'nomEstado',
      header: 'PLATAFORMA.STATUS',
      type: 'text'
    }
  ]

  columnasDetailRegistros: ColumnMetadata[] = [
    {
      name: 'descripcionScript',
      header: 'SCRIPTS.DESCRIPCION',
      type: 'text'
    }
  ]

  OnNuevoRegistroClick () {
    this._localStorageService.setObject('regId', 'nuevo')
    this.router.navigate(['/administracion-bd/gestion-script'])
  }

  OnEditarRegistroClick (id: any) {
    this._localStorageService.setObject('regId', id)
    this.router.navigate(['/administracion-bd/gestion-script'])
  }

  OnEliminarRegistroClick (evento: any) {
    const id = typeof evento === 'string' ? evento : evento?.codigoScript || evento?.id
    Swal.fire({
      title: this.translate.instant('SCRIPTS.ELIMINARTITULO'),
      text: this.translate.instant('SCRIPTS.ELIMINARTEXTO'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
      cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
    }).then((result: any) => {
      if (result.isConfirmed) {
        this._scriptsService.deleteEliminarRegistro(id).subscribe({
          next: (resp: any) => {
            const logData = {
              codigoTipoLog: '',
              codigoRespuesta: '201',
              descripcionLog: this.translate.instant('SCRIPTS.ELIMINAREXITOSA') + ' ' + resp.mensaje
            }
            this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
            Swal.fire(this.translate.instant('SCRIPTS.ELIMINAREXITOSA'), resp.mensaje, 'success')

            // Refresca la grilla localmente
            this.registros = this.registros.filter(s => s.codigoScript !== id)
            this.registrosFiltrado = this.registrosFiltrado.filter(s => s.codigoScript !== id)
          },
          error: (err: any) => {
            const logData = {
              codigoTipoLog: '',
              codigoRespuesta: '501',
              descripcionLog: this.translate.instant('SCRIPTS.ELIMINARERROR') + ' ' + err.mensaje
            }
            this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
            Swal.fire('Error', this.translate.instant('SCRIPTS.ELIMINARERROR'), 'error')
            console.error('Error eliminando', err)
          }
        })
      }
    })
  }

  onFiltroNombreChangeClick (evento: any) {
    console.log('filtrar el NOMBRE ', evento.target.value)
    const textoFiltro = evento.target.value.toLowerCase()
    if (!textoFiltro) {
      this.registrosFiltrado = [...this.registros]
    } else {
      this.registrosFiltrado = this.registros.filter(script => (script.nombreScript || '').toLowerCase().includes(textoFiltro))
    }
  }

  onFiltroDescripcionChangeClick (evento: any) {
    console.log('filtrar la descripcion ', evento.target.value)
    const textoFiltro = evento.target.value.toLowerCase()
    if (!textoFiltro) {
      this.registrosFiltrado = [...this.registros]
    } else {
      this.registrosFiltrado = this.registros.filter(script => (script.descripcionScript || '').toLowerCase().includes(textoFiltro))
    }
  }

  onFiltroEstadoChangeClick (evento: any) {
    console.log('filtrar el estado ', evento.target.value)
    if (evento.target.value == 'todos') {
      this.registrosFiltrado = this.registros
    } else {
      const estado = evento.target.value == 'true' ? true : false
      this.registrosFiltrado = this.registros.filter(x => x.estadoScript == estado)
    }
  }

  toggleNav (): void {
    this.toggleSidebar.emit()
  }
}
