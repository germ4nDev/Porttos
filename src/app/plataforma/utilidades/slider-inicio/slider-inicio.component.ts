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
import { BehaviorSubject, catchError, combineLatest, map, Observable, startWith, switchMap, tap } from 'rxjs'
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
    slidersTransformadas$: Observable<PTLSliderInicioModel[]> = of([])
    slidersFiltradas$: Observable<PTLSliderInicioModel[]> = of([])
    sliders: PTLSliderInicioModel[] = []
    subscriptions = new Subscription()

    filtroNombreSubject = new BehaviorSubject<string>('todos')
    filtroDescripcionSubject = new BehaviorSubject<string>('')
    filtroEstadoSubject = new BehaviorSubject<string>('todos')
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
        this.setupSlidersStream()
        this.subscriptions.add(
            this._registrosService.cargarSliders().subscribe(
                () => console.log('Sliders cargadas y guardadas en el servicio'),
                err => console.error('Error al cargar sliders:', err)
            )
        )
    }

    ngOnDestroy(): void {
        console.log('entrando a componente usuarios')
        this.registrosSub?.unsubscribe()
    }

    getFileType(url: string): 'capture' | 'video' | 'documento' | 'desconocido' {
        if (!url) return 'desconocido'

        const cleanUrl = url.split(/[#?]/)[0]
        const extension = cleanUrl.split('.').pop()?.toLowerCase() || ''

        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp']
        const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv']
        const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']

        if (imageExts.includes(extension)) return 'capture'
        if (videoExts.includes(extension)) return 'video'
        if (docExts.includes(extension)) return 'documento'

        return 'desconocido'
    }

    consultarRegistros() {
        this.registrosSub = this._registrosService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.registros = resp.slidersInicio
                        this.registrosFiltrado = resp.slidersInicio
                        console.log('Todos las sliders', this.registros)
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

    setupSlidersStream(): void {
        this.slidersTransformadas$ = this._registrosService.slider$.pipe(
            switchMap((slids: PTLSliderInicioModel[]) => {
                if (!slids) return of([])
                const transformedSliders = slids.map((slider: any) => {
                    console.log('data slider', slider)
                    slider.nomEstado = slider.estadoSlider == true ? 'Activo' : 'Inactivo'
                    const tipoMedia = this.getFileType(this._uploadService.getFilePath(this.suscPlataforma, 'sliders', slider.urlSlider))
                    if (tipoMedia == 'capture') {
                        slider.urlSlider = this._uploadService.getFilePath(this.suscPlataforma, 'sliders', slider.urlSlider)
                        slider.capture = slider.urlSlider
                        slider.tipo = 'capture'
                    }
                    console.log('tipo media', tipoMedia)
                    return slider as PTLSliderInicioModel
                })
                this.registros = transformedSliders
                console.log('todas las sliders', this.registros)
                return of(transformedSliders)
            }),
            catchError(err => {
                console.error('Error en el stream de sliders:', err)
                return of([])
            })
        )

        this.slidersFiltradas$ = combineLatest([
            this.slidersTransformadas$.pipe(startWith([])), // Usa la fuente de datos transformada
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([slids, nombre, descripcion, estado]) => {
                let filteredSliders = slids

                if (nombre !== 'todos') {
                    filteredSliders = filteredSliders.filter(app => app.nombreSlider === nombre)
                }

                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true'
                    filteredSliders = filteredSliders.filter(app => app.estadoSlider === estadoBoolean)
                }

                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase()
                    filteredSliders = filteredSliders.filter(app => (app.descripcionSlider || '').toLowerCase().includes(textoFiltro))
                }
                console.log('**************data de las sliders', filteredSliders)

                return filteredSliders
            })
        )
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
            name: 'capture',
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
