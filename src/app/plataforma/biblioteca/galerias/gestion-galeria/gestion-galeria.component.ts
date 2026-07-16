/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { GradientConfig } from 'src/app/app-config'
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import {
    LocalStorageService,
    PtlAplicacionesService,
    PtlBibliotecasService,
    PtlidiomasService,
    PtllogActividadesService,
    SwalAlertService,
    UploadFilesService
} from 'src/app/theme/shared/service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model'
import { PTLGaleria } from 'src/app/theme/shared/_helpers/models/PTLGaleria.model'
import { PtlGaleriasService } from 'src/app/theme/shared/service/ptlgalerias.service'
import { PtlTiposGaleriaService } from 'src/app/theme/shared/service/ptltipos-galeria.service'
import { PtlformatosGaleriaService } from 'src/app/theme/shared/service/ptlformatos-galeria.service'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { Observable, Subscription } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'
import Swal from 'sweetalert2'
import { PTLIdioma } from 'src/app/theme/shared/_helpers/models/PTLIdioma.model'
import { PTLTipoGaleria } from 'src/app/theme/shared/_helpers/models/PTLTipoGaleria.model'
import { PTLFormatoGaleria } from 'src/app/theme/shared/_helpers/models/PTLFormatoGaleria.model'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { VideoPlayerComponent } from 'src/app/theme/shared/components/video-player/video-player.component'

@Component({
    selector: 'app-gestion-galeria',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        TranslateModule,
        NavBarComponent,
        NavContentComponent,
        TextEditorComponent,
        VideoPlayerComponent
    ],
    templateUrl: './gestion-galeria.component.html',
    styleUrl: './gestion-galeria.component.scss'
})
export class GestionGaleriaComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: PTLGaleria = new PTLGaleria()
    logActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()
    menuItems$!: Observable<NavigationItem[]>
    gradientConfig: any
    navCollapsed: boolean = false
    navCollapsedMob: boolean = false
    windowWidth: number = 0
    listaTipos: PTLTipoGaleria[] = []
    listaFormatos: PTLFormatoGaleria[] = []
    listaFormatosFiltrado: PTLFormatoGaleria[] = []
    listaIdiomas: PTLIdioma[] = []
    listaAplicaciones: PTLAplicacionModel[] = []

    selectedFotoFile: File | null = null
    userFotoPhotoUrl: string = ''
    fileFotoName: string | null = null
    selectedFileFotoUrl: string | null = null
    selectedFileFotoType: 'image' | null = null
    selectedFileFotoName: string = ''

    selectedFile: File | null = null
    userPhotoUrl: string = ''
    fileName: string | null = null
    selectedFileUrl: string | null = null
    selectedFileType: 'image' | 'video' | 'document' | null = null
    selectedFileName: string = ''

    isSubmit: boolean = false
    modoEdicion: boolean = false
    codeGaleria = uuidv4()
    tipoEditorTexto = 'basica'
    lockScreenSubscription: Subscription | undefined
    isLocked: boolean = false
    lockMessage: string = ''
    codBiblioteca: string = ''

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _localStorageService: LocalStorageService,
        private _logActividadesService: PtllogActividadesService,
        private _galeriaService: PtlGaleriasService,
        private _tiposGaleriaService: PtlTiposGaleriaService,
        private _uploadService: UploadFilesService,
        private _formatosGaleriaService: PtlformatosGaleriaService,
        private _biblioecasService: PtlBibliotecasService,
        private _idiomasService: PtlidiomasService,
        private _swalService: SwalAlertService,
        private _translate: TranslateService
    ) {
        this.isSubmit = false
        GradientConfig.header_fixed_layout = true
        this.gradientConfig = GradientConfig
        this.navCollapsed = this.windowWidth >= 992 ? GradientConfig.isCollapse_menu : false
        this.navCollapsedMob = false
        this._navigationService.getNavigationItems()
        this.codBiblioteca = this._localStorageService.getObject<string>('bibId') || ''
        const regId = this._localStorageService.getObject<string>('regId') || ''
        if (regId !== 'nuevo') {
            this.modoEdicion = true
            this._galeriaService.getGaleriaById(regId).subscribe({
                next: (resp: any) => {
                    this.FormRegistro = resp.galeria
                    this.codeGaleria = resp.galeria.codigoGaleria
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo obtener la Galería', 'error')
                }
            })
        }
    }

    ngOnInit() {
        this.menuItems$ = this._navigationService.menuItems$
        this.lockScreenSubscription = this._navigationService.lockScreenEvent$.subscribe({
            next: (message: string) => {
                this._localStorageService.setFormRegistro(this.FormRegistro)
                this.isLocked = true
                this.lockMessage = message
            },
            error: err => console.error('Error al suscribirse al evento de bloqueo:', err)
        })

        const form = this._localStorageService.getFormRegistro()
        if (form != undefined) {
            this.FormRegistro = form
            this._localStorageService.removeFormRegistro()
        }

        if (this.modoEdicion == false) {
            this.FormRegistro.codigoGaleria = uuidv4()
            this.FormRegistro.estadoGaleria = true
        }
        this.cargarListasDesplegables()
    }

    cargarListasDesplegables() {
        this._tiposGaleriaService.cargarTiposGaleria().subscribe({
            next: (resp: any) => {
                this.listaTipos = resp.tiposGaleria || resp
            },
            error: (err: any) => console.error('Error cargando tipos', err)
        })

        this._formatosGaleriaService.cargarFormatosGaleria().subscribe({
            next: (resp: any) => {
                this.listaFormatos = resp.formatosGaleria || resp
                this.listaFormatosFiltrado = resp.formatosGaleria || resp
            },
            error: (err: any) => console.error('Error cargando formatos', err)
        })

        this._idiomasService.cargarRegistros().subscribe({
            next: (resp: any) => {
                this.listaIdiomas = resp.idiomas || resp
            },
            error: (err: any) => console.error('Error cargando idiomas', err)
        })
    }

    onFiltroCodigoTipoChangeClick(evento: any) {
        console.log('filtrar tipo', evento.target.value)
        if (evento.target.value === '') {
            this.listaFormatosFiltrado = this.listaFormatos
        } else {
            this.listaFormatosFiltrado = this.listaFormatos.filter(x => x.codigoTipoGaleria == evento.target.value)
            console.log('aca', this.listaFormatosFiltrado)
        }
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcionGaleria = nuevoContenido
    }

    onFotoFileSelectedClick(event: any) {
        const file: File = event.target.files[0]
        const objUpload = {
            susc: 'plataforma',
            tipo: 'galeria-img',
            id: '0'
        }

        if (file) {
            const reader = new FileReader()
            reader.onload = (e: any) => {
                this.selectedFileFotoUrl = e.target.result
            }
            reader.readAsDataURL(file)
            this._uploadService.uploadUserPhoto(file, objUpload).subscribe({
                next: (path: any) => {
                    this.FormRegistro.fotoGaleria = path.nombreArchivo
                    this.userFotoPhotoUrl = path.nombreArchivo
                    this.selectedFileFotoName = path.nombreArchivo
                },
                error: () => {
                    this._swalService.getAlertError(this.translate.instant('PLATAFORMA.UPLOADPHOTOERROR'))
                }
            })
        } else {
            this.selectedFileFotoUrl = null
            this.userFotoPhotoUrl = ''
            this.selectedFileFotoName = ''
        }
    }

    onFileSelectedClick(event: any) {
        const file: File = event.target.files[0]
        const objUpload = {
            susc: 'plataforma',
            tipo: 'galeria',
            id: '0'
        }

        if (file) {
            this.selectedFileName = file.name
            if (file.type.startsWith('image/')) {
                this.selectedFileType = 'image'
                objUpload.tipo = 'galeria-img'
            } else if (file.type.startsWith('video/')) {
                this.selectedFileType = 'video'
                objUpload.tipo = 'galeria-vid'
            } else {
                this.selectedFileType = 'document'
                objUpload.tipo = 'galeria-doc'
            }

            //   const reader = new FileReader();
            //   reader.onload = (e: any) => {
            //     this.selectedFileUrl = e.target.result;
            //   };
            //   reader.readAsDataURL(file);

            this._uploadService.uploadUserPhoto(file, objUpload).subscribe({
                next: (path: any) => {
                    console.log('path', path)
                    this.FormRegistro.mediaGaleria = path.nombreArchivo
                    this.userPhotoUrl = path.nombreArchivo
                    console.log('selectedFileType', this.selectedFileType)
                    console.log('objUpload.tipo', objUpload.tipo)
                    this.selectedFileUrl = this._uploadService.getFilePath(objUpload.susc, objUpload.tipo, path.nombreArchivo)
                },
                error: () => {
                    this._swalService.getAlertError(this.translate.instant('PLATAFORMA.UPLOADPHOTOERROR'))
                }
            })
        } else {
            this.selectedFileUrl = null
            this.userPhotoUrl = ''
            this.selectedFileType = null
            this.selectedFileName = ''
        }
    }

    btnGestionarGaleriaClick(form: any) {
        const registroData = form.value as PTLGaleria
        if (this.modoEdicion) {
            registroData.codigoBiblioteca = this.codBiblioteca
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaModificacion = new Date().toISOString()
            this._galeriaService.actualizarGaleria(registroData).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('GALERIA.UPDATESUCCSESSFULLY')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe()
                        this._swalService.getAlertSuccess(this.translate.instant('GALERIA.UPDATESUCCSESSFULLY'))
                        form.resetForm()
                        this.router.navigate(['/biblioteca/galeria'])
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = { codigoTipoLog: '', codigoRespuesta: '501', descripcionLog: this.translate.instant('GALERIA.UPDATEERROR') }
                    this._logActividadesService.postCrearRegistro(logData).subscribe()
                    this._swalService.getAlertError('No se pudo actualizar la Galería')
                }
            })
        } else {
            form.galeriaId = 0
            registroData.codigoGaleria = this.FormRegistro.codigoGaleria
            registroData.codigoBiblioteca = this.codBiblioteca
            registroData.descripcionGaleria = this.FormRegistro.descripcionGaleria
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaCreacion = new Date().toISOString()
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fotoGaleria = this.userPhotoUrl || 'no-imagen.png'
            registroData.mediaGaleria = this.userPhotoUrl || 'no-imagen.png'
            registroData.fechaModificacion = new Date().toISOString()
            this._galeriaService.crearGaleria(registroData).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('GALERIA.CREATESUCCSESSFULLY')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe()
                        this._swalService.getAlertSuccess(this.translate.instant('GALERIA.CREATESUCCSESSFULLY'))
                        form.resetForm()
                        this.router.navigate(['/biblioteca/galeria'])
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = { codigoTipoLog: '', codigoRespuesta: '500', descripcionLog: this.translate.instant('GALERIA.CREATEERROR') }
                    this._logActividadesService.postCrearRegistro(logData).subscribe()
                    this._swalService.getAlertError('No se pudo crear la Galería')
                }
            })
        }
    }

    //   onFileSelectedClick(event: any) {
    //     const file: File = event.target.files[0];
    //     const objUpload = {
    //       susc: 'plataforma',
    //       tipo: 'galeria', // <-- Guardamos en la carpeta de galeria
    //       id: '0'
    //     };

    //     if (file) {
    //       const reader = new FileReader();
    //       reader.onload = (e: any) => {
    //         this.selectedFileUrl = e.target.result;
    //       };
    //       reader.readAsDataURL(file);

    //       this._uploadService.uploadUserPhoto(file, objUpload).subscribe({
    //         next: (path: any) => {
    //           this.FormRegistro.imagenGaleria = path.nombreArchivo;
    //           this.userPhotoUrl = path.nombreArchivo;
    //         },
    //         error: () => {
    //           this._swalService.getAlertError(this.translate.instant('PLATAFORMA.UPLOADPHOTOERROR'));
    //         }
    //       });
    //     } else {
    //       this.selectedFileUrl = null;
    //       this.userPhotoUrl = '';
    //     }
    //   }

    btnRegresarClick() {
        this.router.navigate(['/biblioteca/galeria'])
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
