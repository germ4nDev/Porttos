/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { GradientConfig } from 'src/app/app-config'
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { LocalStorageService, PtlTiposGaleriaService, SwalAlertService } from 'src/app/theme/shared/service'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'

import { PTLFormatoGaleria } from 'src/app/theme/shared/_helpers/models/PTLFormatoGaleria.model'
import { PtlformatosGaleriaService } from 'src/app/theme/shared/service/ptlformatos-galeria.service'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { Observable, Subscription } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'
import Swal from 'sweetalert2'
import { PTLTipoGaleria } from 'src/app/theme/shared/_helpers/models/PTLTipoGaleria.model'

@Component({
    selector: 'app-gestion-formatos-galeria',
    standalone: true,
    imports: [CommonModule, FormsModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-formatos-galeria.component.html',
    styleUrl: './gestion-formatos-galeria.component.scss'
})
export class GestionFormatosGaleriaComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>()
    FormRegistro: PTLFormatoGaleria = new PTLFormatoGaleria()
    menuItems$!: Observable<NavigationItem[]>
    gradientConfig: any
    navCollapsed: boolean = false
    navCollapsedMob: boolean = false
    windowWidth: number = 0
    listaTipos: PTLTipoGaleria[] = []

    isSubmit: boolean = false
    modoEdicion: boolean = false
    codeFormato = uuidv4()
    tipoEditorTexto = 'basica'
    lockScreenSubscription: Subscription | undefined
    isLocked: boolean = false

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _localStorageService: LocalStorageService,
        private _tiposGaleriaService: PtlTiposGaleriaService,
        private _formatosGaleriaService: PtlformatosGaleriaService,
        private _swalService: SwalAlertService
    ) {
        this.gradientConfig = GradientConfig
        this._navigationService.getNavigationItems()
        const regId = this._localStorageService.getObject<string>('regId') || 'nuevo'
        if (regId !== 'nuevo') {
            this.modoEdicion = true
            this._formatosGaleriaService.getFormatosGaleriaById(regId).subscribe({
                next: (resp: any) => {
                    this.FormRegistro = resp.formatoGaleria
                    this.codeFormato = resp.formatoGaleria.codigoFormato
                },
                error: () => Swal.fire('Error', 'No se pudo obtener el Formato', 'error')
            })
        }
    }

    ngOnInit() {
        this.menuItems$ = this._navigationService.menuItems$
        if (this.modoEdicion == false) {
            this.FormRegistro.codigoFormato = uuidv4()
            this.FormRegistro.estadoFormato = true
        }
        this.cargarListasDesplegables()
    }

    ngOnDestroy() {
        if (this.lockScreenSubscription) this.lockScreenSubscription.unsubscribe()
    }

    cargarListasDesplegables() {
        this._tiposGaleriaService.cargarTiposGaleria().subscribe({
            next: (resp: any) => {
                this.listaTipos = resp.tiposGaleria || resp
            },
            error: (err: any) => console.error('Error cargando tipos', err)
        })
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcionFormato = nuevoContenido
    }

    btnGestionarFormatoClick(form: any) {
        if (this.modoEdicion) {
            this.FormRegistro.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            this.FormRegistro.fechaModificacion = new Date().toISOString()
            this._formatosGaleriaService.actualizarFormatoGaleria(this.FormRegistro).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        this._swalService.getAlertSuccess(this.translate.instant('FORMATOSGALERIA.UPDATESUCCSESSFULLY'))
                        form.resetForm()
                        this.router.navigate(['/biblioteca/formatos-galeria'])
                    }
                },
                error: () => this._swalService.getAlertError('No se pudo actualizar')
            })
        } else {
            form.formatosGaleriaId = 0
            const registroData = form.value as PTLFormatoGaleria
            registroData.codigoFormato = this.FormRegistro.codigoFormato
            registroData.descripcionFormato = this.FormRegistro.descripcionFormato
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaCreacion = new Date().toISOString()
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaModificacion = new Date().toISOString()

            this._formatosGaleriaService.crearFormatoGaleria(registroData).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        this._swalService.getAlertSuccess(this.translate.instant('FORMATOSGALERIA.CREATESUCCSESSFULLY'))
                        form.resetForm()
                        this.router.navigate(['/biblioteca/formatos-galeria'])
                    }
                },
                error: () => this._swalService.getAlertError('No se pudo crear')
            })
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/biblioteca/formatos-galeria'])
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
