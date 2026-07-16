/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DataTablesModule } from 'angular-datatables'
import { Router } from '@angular/router'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Observable, Subscription, of, BehaviorSubject, combineLatest } from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'
import { GradientConfig } from 'src/app/app-config'

import { PTLGaleria } from 'src/app/theme/shared/_helpers/models/PTLGaleria.model'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component'
import { PtlGaleriasService } from 'src/app/theme/shared/service/ptlgalerias.service'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'

import Swal from 'sweetalert2'
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model'
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model'
import { LocalStorageService, PtllogActividadesService, UploadFilesService } from 'src/app/theme/shared/service'
import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
  templateUrl: './galerias.component.html',
  styleUrl: './galerias.component.scss'
})
export class GaleriasComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>()
  DataModel: BaseSessionModel = new BaseSessionModel()
  DataLogActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()
  moduloTituloExcel: string = ''
  hasFiltersSlot: boolean = false
  gradientConfig
  lang = localStorage.getItem('lang')
  menuItems$!: Observable<NavigationItem[]>
  activeTab: 'menu' | 'filters' | 'main' = 'menu'
  tipoMedia: string = ''
  suscriptor: string = ''
  codBiblioteca: string = ''

  subscriptions = new Subscription()
  filtroCodigoSubject = new BehaviorSubject<string>('todos')
  filtroNombreSubject = new BehaviorSubject<string>('todos')
  filtroDescripcionSubject = new BehaviorSubject<string>('')
  filtroEstadoSubject = new BehaviorSubject<string>('todos')

  galeriaTransformada$: Observable<PTLGaleria[]> = of([])
  galeriaFiltrada$: Observable<PTLGaleria[]> = of([])
  galerias: PTLGaleria[] = []

  constructor (
    private router: Router,
    private translate: TranslateService,
    private _navigationService: NavigationService,
    private _logActividadesService: PtllogActividadesService,
    private _localStorageService: LocalStorageService,
    private _galeriaService: PtlGaleriasService,
    private _uploadService: UploadFilesService
  ) {
    this.gradientConfig = GradientConfig
    this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
        const regId = this._localStorageService.getObject<string>('regId') || ''
        console.log('galerias para la biblioteca', regId);

        this.codBiblioteca = regId
        if (regId !== 'nuevo') {
          this.setupGaleriaStream(regId)
        }
  }

  cargarDatos (): void {
    this.subscriptions.add(
      this._galeriaService.cargarGaleria().subscribe(
        () => console.log('Datos de galería cargados'),
        err => console.error('Error al cargar galería:', err)
      )
    )
  }

  ngOnInit (): void {
    this._navigationService.getNavigationItems()
    this.menuItems$ = this._navigationService.menuItems$
    this.hasFiltersSlot = true
    this.setupGaleriaStream(this.codBiblioteca)
    this.cargarDatos()
  }

  ngOnDestroy (): void {
    this.subscriptions.unsubscribe()
  }

  setupGaleriaStream (regId: string): void {
    this.galeriaTransformada$ = this._galeriaService.galeria$.pipe(
      switchMap((gals: PTLGaleria[]) => {
        if (!gals) return of([])
        const transformed = gals.map((gal: any) => {
          gal.nomEstado = gal.estadoGaleria ? 'Activo' : 'Inactivo'
          this.tipoMedia = this.getFileType(this._uploadService.getFilePath(this.suscriptor, 'aplicaciones', gal.imagenGaleria))
          if (this.tipoMedia == 'video') {
            gal.capture = this._uploadService.getFilePath(this.suscriptor, 'aplicaciones', gal.imagenGaleria)
            gal.imagenInicio = this._uploadService.getFilePath(this.suscriptor, 'galeria', 'video_pyr.png')
            gal.options = {
              fluid: true,
              aspectRatio: '16:9',
              autoplay: false,
              controls: true,
              sources: [{ src: gal.imagenInicio, type: 'video/mp4' }]
            };
            gal.tipo = 'video'
            console.log('app captura', gal.capture)
          } else if (this.tipoMedia == 'capture') {
            gal.capture = this._uploadService.getFilePath(this.suscriptor, 'aplicaciones', gal.imagenGaleria)
            gal.imagenInicio = this._uploadService.getFilePath(this.suscriptor, 'aplicaciones', gal.imagenGaleria)
            gal.tipo = 'capture'
            console.log('gal captura', gal.capture)
          }
          return gal as PTLGaleria
        })
        this.galerias = transformed
        return of(transformed)
      }),
      catchError(err => {
        console.error('Error en el stream de galería:', err)
        return of([])
      })
    )
    this.galeriaFiltrada$ = combineLatest([
      this.galeriaTransformada$.pipe(startWith([])),
      this.filtroCodigoSubject,
      this.filtroNombreSubject,
      this.filtroDescripcionSubject,
      this.filtroEstadoSubject
    ]).pipe(
      map(([gals, codigo, nombre, descripcion, estado]) => {
        let filtered = gals
        filtered = filtered.filter(gal => gal.codigoBiblioteca === regId)

        if (codigo !== 'todos') {
          filtered = filtered.filter(gal => gal.codigoGaleria === codigo)
        }
        if (nombre !== 'todos') {
          filtered = filtered.filter(gal => gal.nombreGaleria === nombre)
        }
        if (estado !== 'todos') {
          const estadoBoolean = estado === 'true'
          filtered = filtered.filter(gal => gal.estadoGaleria === estadoBoolean)
        }
        if (descripcion) {
          const textoFiltro = descripcion.toLowerCase()
          filtered = filtered.filter(gal => (gal.descripcionGaleria || '').toLowerCase().includes(textoFiltro))
        }
        return filtered
      })
    )
  }

  onFiltroCodigoChangeClick (evento: any): void {
    this.filtroCodigoSubject.next(evento.target.value)
  }
  onFiltroNombreChangeClick (evento: any): void {
    this.filtroNombreSubject.next(evento.target.value)
  }
  onFiltroDescripcionChangeClick (evento: any): void {
    this.filtroDescripcionSubject.next(evento.target.value)
  }
  onFiltroEstadoChangeClick (evento: any): void {
    this.filtroEstadoSubject.next(evento.target.value)
  }

  getFileType (url: string): 'capture' | 'video' | 'documento' | 'desconocido' {
    if (!url) return 'desconocido'

    const cleanUrl = url.split(/[#?]/)[0]
    const extension = cleanUrl.split('.').pop()?.toLowerCase() || ''

    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
    const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv']
    const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']

    if (imageExts.includes(extension)) return 'capture'
    if (videoExts.includes(extension)) return 'video'
    if (docExts.includes(extension)) return 'documento'

    return 'desconocido'
  }

  columnasGaleria: ColumnMetadata[] = [
    { name: 'imagenGaleria', header: 'GALERIA.FOTO', type: 'image', isSortable: false },
    { name: 'codigoGaleria', header: 'GALERIA.CODE', type: 'text' },
    { name: 'nombreGaleria', header: 'GALERIA.NAME', type: 'text' },
    { name: 'nomEstado', header: 'GALERIA.STATUS', type: 'estado' }
  ]

  columnasDetailRegistros: ColumnMetadata[] = [
    { name: 'descripcionGaleria', header: 'GALERIA.DESCRIPTION', type: 'text' },
    {
      name: 'capture',
      header: 'GALERIA.IMAGENINICIO',
      type: 'capture'
    }
  ]

  OnNuevaGaleriaClick (): void {
    this._localStorageService.setObject('bibId', this.codBiblioteca)
    this._localStorageService.setObject('regId', 'nuevo')
    this.router.navigate(['/biblioteca/gestion-galeria'])
  }

  OnEditarGaleriaClick (id: string): void {
    this._localStorageService.setObject('bibId', this.codBiblioteca)
    this._localStorageService.setObject('regId', id)
    this.router.navigate(['/biblioteca/gestion-galeria'])
  }

  OnRegresarBibliotecaClick (): void {
    this.router.navigate(['/biblioteca/bibliotecas'])
  }

  OnEliminarGaleriaClick (evento: any): void {
    const id = typeof evento === 'string' ? evento : evento?.codigoGaleria || evento?.id
    if (!id) {
      console.error('No se pudo extraer el ID del registro a eliminar. El evento recibido fue:', evento)
      return
    }

    Swal.fire({
      title: this.translate.instant('GALERIA.ELIMINARTITULO'),
      text: this.translate.instant('GALERIA.ELIMINARTEXTO'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
      cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
    }).then(result => {
      if (result.isConfirmed) {
        this._galeriaService.eliminarGaleria(id).subscribe({
          next: (resp: any) => {
            const logData = {
              codigoTipoLog: '',
              codigoRespuesta: '201',
              descripcionLog: this.translate.instant('GALERIA.ELIMINAREXITOSA')
            }
            this._logActividadesService.postCrearRegistro(logData).subscribe()
            Swal.fire(this.translate.instant('GALERIA.ELIMINAREXITOSA'), resp.mensaje, 'success')
            this.cargarDatos()
          },
          error: () => {
            const logData = { codigoTipoLog: '', codigoRespuesta: '501', descripcionLog: this.translate.instant('GALERIA.ELIMINARERROR') }
            this._logActividadesService.postCrearRegistro(logData).subscribe()
            Swal.fire('Error', this.translate.instant('GALERIA.ELIMINARERROR'), 'error')
          }
        })
      }
    })
  }

  toggleNav (): void {
    this.toggleSidebar.emit()
  }
}
