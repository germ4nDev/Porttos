/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
//#region IMPORTS
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DataTablesModule } from 'angular-datatables'
import { Router } from '@angular/router'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { TranslateModule } from '@ngx-translate/core'
import { TranslateService } from '@ngx-translate/core'
import { PTLUsuarioModel } from 'src/app/theme/shared/_helpers/models/PTLUsuario.model'
import { LanguageService } from 'src/app/theme/shared/service/lenguage.service'
import { catchError, Observable, tap } from 'rxjs'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component'
import { of, Subscription } from 'rxjs'
import Swal from 'sweetalert2'
import { SwalAlertService } from '../../../theme/shared/service/swal-alert.service'
import { PTLSliderInicioModel } from 'src/app/theme/shared/_helpers/models/PTLSliderInicio.model'
import { PtlSlidersInicioService } from 'src/app/theme/shared/service/ptlsliders-inicio.service'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { environment } from 'src/environments/environment'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { LocalStorageService, UploadFilesService } from 'src/app/theme/shared/service'

const base_url = environment.apiUrl
//#endregion IMPORTS

@Component({
    selector: 'app-slider-inicio',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
    templateUrl: './slider-inicio.component.html',
    styleUrl: './slider-inicio.component.scss'
})
export class SliderInicioComponent implements OnInit {
    //#region VARIABLES
    @Output() toggleSidebar = new EventEmitter<void>()
    activeTab: 'menu' | 'filters' | 'main' = 'menu'
    menuItems!: Observable<NavigationItem[]>
    registrosSub?: Subscription
    registros: PTLSliderInicioModel[] = []
    registrosFiltrado: PTLUsuarioModel[] = []
    lang: string = localStorage.getItem('lang') || ''
    tituloPagina: string = ''
    //#endregion VARIABLES
    suscPlataforma: string = ''
    constructor(
        private router: Router,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _swalService: SwalAlertService,
        private _registrosService: PtlSlidersInicioService,
        private _languageService: LanguageService,
        private _localStorageService: LocalStorageService,
        private _uploadService: UploadFilesService
    ) {
        this.suscPlataforma = this._localStorageService.getSuscriptorPlataformaLocalStorage()
    }

    ngOnInit() {
        this._navigationService.getNavigationItems()
        this.menuItems = this._navigationService.menuItems$
        console.log('elementos menu componente', this.menuItems)
        this.consultarRegistros()
    }

    ngOnDestroy(): void {
        console.log('entrando a componente usuarios')
        this.registrosSub?.unsubscribe()
    }

    consultarRegistros() {
        this.registrosSub = this._registrosService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        resp.slidersInicio.forEach((slider: any) => {
                            slider.nomEstado = slider.estadoSlider == true ? 'Activo' : 'Inactivo'
                            slider.urlSlider = this._uploadService.getFilePath(this.suscPlataforma, 'sliders', slider.urlSlider)

                            //   slider.urlSlider = `${base_url}/upload/sliders/${slider.urlSlider}`;
                        })
                        this.registros = resp.slidersInicio
                        this.registrosFiltrado = resp.slidersInicio
                        console.log('Todos las usuarios', this.registros)
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

    columnasRegistros: ColumnMetadata[] = [
        {
            name: 'urlSlider',
            header: 'SLIDER.SLIDER',
            type: 'image'
        },
        {
            name: 'nombreSlider',
            header: 'SLIDER.NOMBRE',
            type: 'text'
        },
        {
            name: 'nomEstado',
            header: 'SLIDER.STATUS',
            type: 'estado'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'descripcionSlider',
            header: 'SLIDER.DESCRIPCION',
            type: 'text'
        },
        {
            name: 'urlSlider',
            header: 'SLIDER.DESCRIPCION',
            type: 'capture'
        }
    ]

    getEstado(estado: boolean): string {
        return estado ? 'Activo' : 'Inactivo'
    }

    OnNuevoRegistroClick() {
        this._localStorageService.setObject('regId', 'nuevo')
        this.router.navigate(['utilidades/gestion-slider'])
    }

    OnEditarRegistroClick(id: number) {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['utilidades/gestion-slider'])
    }

    OnEliminarRegistroClick(id: number) {
        const nombre = this.registrosFiltrado.filter(x => x.usuarioId == id)[0]
        Swal.fire({
            title: this.translate.instant('USUARIOS.ELIMINARTITULO'),
            text: `this.translate.instant('USUARIOS.ELIMINARTEXTO') + "${nombre.nombreUsuario}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then((result: any) => {
            if (result.isConfirmed) {
                this._registrosService.deleteEliminarRegistro(id).subscribe({
                    next: (resp: any) => {
                        this._swalService.getAlertSuccess(this.translate.instant('USUARIOS.ELIMINAREXITOSA') + ', ' + resp.mensaje)
                        this.registros = this.registros.filter(s => s.sliderId !== id)
                    },
                    error: (err: any) => {
                        this._swalService.getAlertError(this.translate.instant('SLIDER.ELIMINARERROR') + ', ' + err)
                        console.error('Error eliminando', err)
                    }
                })
            }
        })
    }

    onFiltroIdentificacionChangeClick(evento: any) {
        console.log('filtrar el nombre ', evento.target.value)
        const textoFiltro = evento.target.value
        if (!textoFiltro) {
            this.registrosFiltrado = [...this.registros]
        } else {
            this.registrosFiltrado = this.registrosFiltrado.filter(usuario => String(usuario.identificacionUsuario || 0).includes(textoFiltro))
        }
    }

    onFiltroNombreChangeClick(evento: any) {
        console.log('filtrar el nombre ', evento.target.value)
        const textoFiltro = evento.target.value.toLowerCase()
        if (!textoFiltro) {
            this.registrosFiltrado = [...this.registros]
        } else {
            this.registrosFiltrado = this.registrosFiltrado.filter(usuario => (usuario.nombreUsuario || '').toLowerCase().includes(textoFiltro))
        }
    }

    onFiltroCorreoChangeClick(evento: any) {
        console.log('filtrar el correo ', evento.target.value)
        const textoFiltro = evento.target.value.toLowerCase()
        if (!textoFiltro) {
            this.registrosFiltrado = [...this.registros]
        } else {
            this.registrosFiltrado = this.registrosFiltrado.filter(usuario => (usuario.correoUsuario || '').toLowerCase().includes(textoFiltro))
        }
    }

    onFiltroUsernameChangeClick(evento: any) {
        console.log('filtrar el username ', evento.target.value)
        const textoFiltro = evento.target.value.toLowerCase()
        if (!textoFiltro) {
            this.registrosFiltrado = [...this.registros]
        } else {
            this.registrosFiltrado = this.registrosFiltrado.filter(usuario => (usuario.userNameUsuario || '').toLowerCase().includes(textoFiltro))
        }
    }

    onFiltroDescripcionChangeClick(evento: any) {
        console.log('filtrar el descripcion ', evento.target.value)
        const textoFiltro = evento.target.value.toLowerCase()
        if (!textoFiltro) {
            this.registrosFiltrado = [...this.registros]
        } else {
            this.registrosFiltrado = this.registrosFiltrado.filter(usuario =>
                (usuario.descripcionUsuario || '').toLowerCase().includes(textoFiltro)
            )
        }
    }

    onFiltroEstadoChangeClick(evento: any) {
        console.log('filtrar el estado ', evento.target.value)
        if (evento.target.value == 'todos') {
            this.registrosFiltrado = [...this.registros]
        } else {
            const estado = evento.target.value == 'true' ? true : false
            console.log('Usuarios', this.registrosFiltrado)
            this.registrosFiltrado = this.registros.filter(x => (x.estadoSlider = estado))
        }
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
