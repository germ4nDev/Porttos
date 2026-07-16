/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { DataTablesModule, DataTableDirective } from 'angular-datatables'
import { Subscription, tap, catchError, of, Observable } from 'rxjs'
import { GradientConfig } from 'src/app/app-config'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { PTLConexionBDModel } from 'src/app/theme/shared/_helpers/models/PTLConexionBD.model'
import { PTLSuscriptorModel } from 'src/app/theme/shared/_helpers/models/PTLSuscriptor.model'
import { LocalStorageService, PtlAplicacionesService, PtllogActividadesService } from 'src/app/theme/shared/service'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { PTLConexionesBDSTService } from 'src/app/theme/shared/service/ptlconexiones-bd-st.service'
import { PTLSuscriptoresService } from 'src/app/theme/shared/service/ptlsuscriptores.service'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import Swal from 'sweetalert2'
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'

@Component({
    selector: 'app-conexciones',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
    templateUrl: './conexiones.component.html',
    styleUrl: './conexiones.component.scss'
})
export class ConexionesComponent implements OnInit {
    @ViewChild(DataTableDirective, { static: false })
    @Output()
    toggleSidebar = new EventEmitter<void>()
    //#region VARIABLES
    registrosSub?: Subscription
    registros: PTLConexionBDModel[] = []
    registrosFiltrado: PTLConexionBDModel[] = []
    lang: string = localStorage.getItem('lang') || ''
    tituloPagina: string = ''
    gradientConfig
    hasFiltersSlot: boolean = false
    menuItems$!: Observable<NavigationItem[]>
    activeTab: 'menu' | 'filters' | 'main' = 'menu'
    datatableElement!: DataTableDirective
    suscriptores: PTLSuscriptorModel[] = []
    //#endregion VARIABLES

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _conexionService: PTLConexionesBDSTService,
        private _aplicacionesService: PtlAplicacionesService,
        private _logActividadesService: PtllogActividadesService,
        private _localStorageService: LocalStorageService,
        private _suscriptoresService: PTLSuscriptoresService,
        private _navigationService: NavigationService
    ) {
        this.gradientConfig = GradientConfig
    }

    ngOnInit() {
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        console.log('elementos menu componente', this.menuItems$)
        this.hasFiltersSlot = true
        this.consultarRegistros()
    }

    consultarRegistros() {
        // this.consultarAplicaciones();
        this.consultarSuscriptores()
        this.registrosSub = this._conexionService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        resp.conexiones.forEach((conexion: any) => {
                            //   const app = this.aplicaciones.filter((x) => x.aplicacionId == conexion.aplicacionId)[0];
                            const susc = this.suscriptores.filter(x => x.suscriptorId == conexion.suscriptorId)[0]
                            //   conexion.nombreAplicacion = app.nombreAplicacion;
                            conexion.nombreSuscriptor = susc.nombreSuscriptor
                            conexion.nomEstado = conexion.estadoConexion == true ? 'Activo' : 'Inactivo'
                        })
                        this.registros = resp.conexiones
                        this.registrosFiltrado = resp.conexiones
                        console.log('Todos las conexiones', this.registros)
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

    columnasCnexiones: ColumnMetadata[] = [
        {
            name: 'nombreConexion',
            header: 'CONEXIONES.NOMBRECONEXION',
            type: 'text'
        },
        {
            name: 'nombreServidor',
            header: 'CONEXIONES.NOMBREAPLICACION',
            type: 'text'
        },
        {
            name: 'nombreSuscriptor',
            header: 'CONEXIONES.NOMBRESUSCRIPTOR',
            type: 'text'
        },
        {
            name: 'BDNombre',
            header: 'CONEXIONES.NOMBREBD',
            type: 'text'
        },
        {
            name: 'nomEstado',
            header: 'USUARIOS.STATUS',
            type: 'text'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'descripcionLog',
            header: 'CONEXIONES.DESCRIPCIONCONEXIONN',
            type: 'text'
        }
    ]

    consultarSuscriptores() {
        this.registrosSub = this._suscriptoresService
            .getSuscriptores()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.suscriptores = resp.suscriptores
                        console.log('Todos las suscriptores', this.suscriptores)
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

    OnNuevoRegistroClick() {
        this._localStorageService.setObject('regId', 'nuevo')
        this.router.navigate(['administracion-bd/gestion-conexion/'])
    }

    OnEditarRegistroClick(id: number) {
        this._localStorageService.setObject('regId', 'id')
        this.router.navigate(['administracion-bd/gestion-conexion/'])
    }

    OnEliminarRegistroClick(id: any) {
        Swal.fire({
            title: this.translate.instant('CONEXIONES.ELIMINARTITULO'),
            text: this.translate.instant('CONEXIONES.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then((result: any) => {
            if (result.isConfirmed) {
                this._conexionService.deleteEliminarRegistro(id.id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('CONEXIONES.ELIMINAREXITOSA') + ' ' + resp.mensaje
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire(this.translate.instant('CONEXIONES.ELIMINAREXITOSA'), resp.mensaje, 'success')
                        this.registros = this.registros.filter(s => s.conexionId !== id.id)
                    },
                    error: (err: any) => {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('CONEXIONES.ELIMINARERROR') + ' ' + err
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        Swal.fire('Error', this.translate.instant('CONEXIONES.ELIMINARERROR'), 'error')
                        console.error('Error eliminando', err)
                    }
                })
            }
        })
    }

    onFiltroNombreApliChangeClick(evento: any) {
        console.log('filtrar el descripcion ', evento.target.value)
        const textoFiltro = evento.target.value.toLowerCase()
        if (!textoFiltro) {
            this.registrosFiltrado = [...this.registros]
        } else {
            this.registrosFiltrado = this.registrosFiltrado.filter(suscriptor =>
                (suscriptor.nombreServidor || '').toLowerCase().includes(textoFiltro)
            )
            console.log('filtrados', this.registrosFiltrado)
        }
    }

    onFiltroNombreSuscripChangeClick(evento: any) {
        console.log('filtrar el descripcion ', evento.target.value)
        const textoFiltro = evento.target.value.toLowerCase()
        if (!textoFiltro) {
            this.registrosFiltrado = [...this.registros]
        } else {
            this.registrosFiltrado = this.registrosFiltrado.filter(suscriptor =>
                (suscriptor.nombreSuscriptor || '').toLowerCase().includes(textoFiltro)
            )
            console.log('filtrados', this.registrosFiltrado)
        }
    }

    onFiltroNombreServeChangeClick(evento: any) {
        console.log('filtrar el descripcion ', evento.target.value)
        const textoFiltro = evento.target.value.toLowerCase()
        if (!textoFiltro) {
            this.registrosFiltrado = [...this.registros]
        } else {
            this.registrosFiltrado = this.registrosFiltrado.filter(server => (server.nombreServidor || '').toLowerCase().includes(textoFiltro))
            console.log('filtrados', this.registrosFiltrado)
        }
    }

    onFiltroNombreBDChangeClick(evento: any) {
        console.log('filtrar el descripcion ', evento.target.value)
        const textoFiltro = evento.target.value.toLowerCase()
        if (!textoFiltro) {
            this.registrosFiltrado = [...this.registros]
        } else {
            this.registrosFiltrado = this.registrosFiltrado.filter(bd => (bd.BDNombre || '').toLowerCase().includes(textoFiltro))
            console.log('filtrados', this.registrosFiltrado)
        }
    }

    onFiltroEstadoChangeClick(evento: any) {
        console.log('filtrar el estado ', evento.target.value)
        if (evento.target.value == 'todos') {
            this.registrosFiltrado = this.registros
        } else {
            const estado = evento.target.value == 'true' ? true : false
            this.registrosFiltrado = this.registros.filter(x => x.estadoConexion == estado)
        }
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
