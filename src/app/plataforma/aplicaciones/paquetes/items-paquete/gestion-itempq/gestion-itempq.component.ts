import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output } from '@angular/core'
import { NgForm } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Observable, Subscription, tap, catchError, of } from 'rxjs'
import { GradientConfig } from 'src/app/app-config'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'
import { PTLItemPaquete } from 'src/app/theme/shared/_helpers/models/PTLItemPaquete.model'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { PTLModuloAP } from 'src/app/theme/shared/_helpers/models/PTLModuloAP.model'
import { PTLModuloPQModel } from 'src/app/theme/shared/_helpers/models/PTLModuloPQ.model'
import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model'
import { PTLTipoItemModel } from 'src/app/theme/shared/_helpers/models/PTLTipoItem.model'
import { PTLItems } from 'src/app/theme/shared/_helpers/models/PTLItem.model'
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component'
import {
    PtlAplicacionesService,
    PtlSuitesAPService,
    PtlmodulosApService,
    PtllogActividadesService,
    SwalAlertService,
    LocalStorageService,
    NavigationService,
    PtlvaloresUnitariosService,
    PtltiposItemsService
} from 'src/app/theme/shared/service'
import { LayoutInitializerService } from 'src/app/theme/shared/service/layout-initializer.service'
import { LoadingService } from 'src/app/theme/shared/service/loading.service'
import { PtlItemsPaqueteService } from 'src/app/theme/shared/service/ptlitems-paquete.service'
import { PTLModulosPaqueteService } from 'src/app/theme/shared/service/ptlmodulos-paquete.service'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { v4 as uuidv4 } from 'uuid'

@Component({
    selector: 'app-gestion-itempq',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-itempq.component.html',
    styleUrl: './gestion-itempq.component.scss'
})
export class GestionItempqComponent {
    // #region VARIABLES
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: PTLItemPaquete = new PTLItemPaquete()
    menuItems$!: Observable<NavigationItem[]>
    gradientConfig: any
    navCollapsed: boolean = false
    navCollapsedMob: boolean = false
    windowWidth: number = 0
    form: undefined
    isSubmit: boolean
    modoEdicion: boolean = false
    tiposItemsSub?: Subscription
    tiposItems: PTLTipoItemModel[] = []
    listaPreciosSub?: Subscription
    listaPrecios: PTLItems[] = []
    itemsSeleccionados: PTLItems[] = []
    registroId: string = ''
    codigoPaquete: string = ''
    tipoEditorTexto = 'basica'
    lockScreenSubscription: Subscription | undefined
    isLocked: boolean = false
    lockMessage: string = ''
    suscriptor: string = ''
    // #endregion VARIABLES

    // constructor
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _registrosService: PtlItemsPaqueteService,
        private _tiposItemsService: PtltiposItemsService,
        private _listaPreciosService: PtlvaloresUnitariosService,
        private _layoutInitializer: LayoutInitializerService,
        private _logActividadesService: PtllogActividadesService,
        private _swalAlertService: SwalAlertService,
        private _localStorageService: LocalStorageService,
        private _loadingService: LoadingService,
        private _navigationService: NavigationService
    ) {
        this.isSubmit = false
        GradientConfig.header_fixed_layout = true
        this.gradientConfig = GradientConfig
        this.navCollapsed = this.windowWidth >= 992 ? GradientConfig.isCollapse_menu : false
        this.navCollapsedMob = false
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
        this.registroId = this._localStorageService.getObject<string>('regId') || ''
        this.codigoPaquete = this._localStorageService.getObject<string>('regPQ') || ''
        console.log('asociar modulos para', this.codigoPaquete)
        if (this.registroId !== 'nuevo') {
            this.modoEdicion = true
            this._registrosService.getRegistros().subscribe({
                next: (resp: any) => {
                    const itemsPaquete = resp.itemsPaquete.filter((x: { codigoItem: string }) => x.codigoItem === this.registroId)
                    this.itemsSeleccionados = itemsPaquete
                    console.log('modulos paquete', itemsPaquete)
                },
                error: () => {
                    this._swalAlertService.getAlertError('No se pudo obtener los Items del Paquete.')
                }
            })
        } else {
            this.modoEdicion = false
        }
    }

    ngOnInit() {
        this._layoutInitializer.applyLayout()
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        // TODO Replicar en todos los modulos de gestion de datos
        this.consultarTiposValor()
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
        console.log('modoEdicion', this.modoEdicion)

        if (!this.modoEdicion) {
            console.log('modo edicion', this.modoEdicion)
            this.FormRegistro.tipoValorId = 0
            this.FormRegistro.codigoItem = ''
            this.FormRegistro.codigoItem = uuidv4()
            console.log('FormRegistro', this.FormRegistro)
        }
    }

    consultarTiposValor() {
        this.tiposItemsSub = this._tiposItemsService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.tiposItems = resp.tiposItems.filter((x: { estadoTipo: boolean }) => x.estadoTipo == true)
                        console.log('las tiposItems', this.tiposItems)
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

    consultarListaPrecios(tipoId: string) {
        this.listaPreciosSub = this._listaPreciosService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        const activos = resp.valoresUnitarios.filter((x: { estadoValor: boolean }) => x.estadoValor == true)
                        this.listaPrecios = activos.filter((x: { codigoTipo: string }) => x.codigoTipo == tipoId)
                        console.log('las listaPrecios', this.listaPrecios)
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

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcionItem = nuevoContenido
        console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionItem)
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    onTipoValorChangeClick(evento: any) {
        console.log('evento', evento.target.value)
        const tipo = this.tiposItems.findIndex(x => x.codigoTipoItem == evento.target.value)
        const tipoValor = this.tiposItems[tipo]
        this.consultarListaPrecios(tipoValor.codigoTipoItem || '')
    }

    onValorChangeClick(evento: any) {
        console.log('asociar el valorlo', evento.target.value)
        const tipo = this.listaPrecios.findIndex(x => x.codigoItem == evento.target.value)
        const valor = this.listaPrecios[tipo]
        this.FormRegistro.nombreItem = valor.nombreItem || ''
        this.FormRegistro.valorUnitario = valor.valorUnitario || 0
        this.FormRegistro.cantidad = 0
        this.FormRegistro.valoresAdicionales = 0
        this.FormRegistro.valorTotal =
            this.FormRegistro.cantidad == 0 ? valor.valorUnitario : this.FormRegistro.valorUnitario * this.FormRegistro.cantidad
    }

    onCantidadChangeClick(evento: any) {
        console.log('valor evento', Number(evento.target.value))
        this.FormRegistro.cantidad = Number(evento.target.value)
        const operacion =
            Number(this.FormRegistro.cantidad) > 0
                ? Number(this.FormRegistro.valorUnitario) * Number(this.FormRegistro.cantidad)
                : Number(this.FormRegistro.valorUnitario)
        this.FormRegistro.valorTotal = operacion + Number(this.FormRegistro.valoresAdicionales)
    }

    onValoresAdicionalesChangeClick(evento: any) {
        console.log('valor evento', Number(evento.target.value))
        this.FormRegistro.valoresAdicionales = Number(evento.target.value)
        const operacion =
            Number(this.FormRegistro.cantidad) > 0
                ? Number(this.FormRegistro.valorUnitario) * Number(this.FormRegistro.cantidad)
                : Number(this.FormRegistro.valorUnitario)
        this.FormRegistro.valorTotal = operacion + Number(this.FormRegistro.valoresAdicionales)
    }

    btnGestionarRegistroClick(form: NgForm) {
        this.isSubmit = true
        if (!form.valid) {
            return
        }
        const registroData = form.value as PTLItemPaquete
        // console.log('gestionar registro', registroData);

        if (this.modoEdicion) {
            registroData.codigoItem = this.FormRegistro.codigoItem
            registroData.codigoPaquete = this.codigoPaquete
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaModificacion = new Date().toISOString()
            // registroData. = Number(this.FormRegistro.tipo)
            registroData.cantidad = this.FormRegistro.cantidad = 0 ? 1 : this.FormRegistro.cantidad
            this._registrosService.putModificarRegistro(registroData).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        this._registrosService.putModificarRegistro(registroData).subscribe({
                            next: () => {
                                const logData = {
                                    codigoTipoLog: '',
                                    codigoRespuesta: '201',
                                    descripcionLog: this.translate.instant('PLATAFORMA.MODIFICAR')
                                }
                                this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                                this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.MODIFICAR'))
                                this._localStorageService.setObject('regId', this.codigoPaquete)
                                this.router.navigate(['aplicaciones/items-paquete'])
                            },
                            error: err => {
                                console.error('Error al actualizar requerimiento', err)
                                const logData = {
                                    codigoTipoLog: '',
                                    codigoRespuesta: '501',
                                    descripcionLog: this.translate.instant('SEGUIMIENTOS.ELIMINARERROR') + ' ' + err.mensaje
                                }
                                this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                                this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOINSERTO') + ' ' + err.mensaje)
                            }
                        })
                    } else {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('SEGUIMIENTOS.ELIMINARERROR') + ' ' + resp.mensaje
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOINSERTO') + ' ' + resp.mensaje)
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('SEGUIMIENTOS.ELIMINARERROR') + ' ' + err.mensaje
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOINSERTO') + ' ' + err.mensaje)
                }
            })
        } else {
            console.log('nuevo formregistro', this.FormRegistro.codigoPaquete)
            registroData.codigoItem = uuidv4()
            registroData.codigoPaquete = this.codigoPaquete
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaCreacion = new Date().toISOString()
            registroData.codigoUsuarioModificacion = ''
            registroData.fechaModificacion = ''
            registroData.cantidad = this.FormRegistro.cantidad = 0 ? 1 : this.FormRegistro.cantidad
            registroData.tipoValorId = Number(this.FormRegistro.tipoValorId)
            console.log('insertar registro', registroData)
            this._registrosService.postCrearRegistro(registroData).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('SEGUIMIENTOS.ELIMINARERROR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.INSERTAR'))
                        form.resetForm()
                        this.isSubmit = false
                        this._localStorageService.setObject('regId', this.codigoPaquete)
                        this.router.navigate(['aplicaciones/items-paquete'])
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('SEGUIMIENTOS.ELIMINARERROR') + ' ' + err.mensaje
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOINSERTO') + ' ' + err.mensaje)
                }
            })
        }
    }

    btnRegresarClick() {
        this._localStorageService.setObject('regId', this.codigoPaquete)
        this.router.navigate(['aplicaciones/modulos-paquete'])
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
