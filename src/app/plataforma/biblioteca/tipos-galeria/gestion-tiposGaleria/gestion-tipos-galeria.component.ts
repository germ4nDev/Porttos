/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GradientConfig } from 'src/app/app-config';
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { LocalStorageService, SwalAlertService } from 'src/app/theme/shared/service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';

import { PTLTipoGaleria } from 'src/app/theme/shared/_helpers/models/PTLTipoGaleria.model';
import { PtlTiposGaleriaService } from 'src/app/theme/shared/service/ptltipos-galeria.service';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { Observable, Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-gestion-tipos-galeria',
    standalone: true,
    imports: [CommonModule, FormsModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-tipos-galeria.component.html',
    styleUrl: './gestion-tipos-galeria.component.scss'
})
export class GestionTiposGaleriaComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>();
    FormRegistro: PTLTipoGaleria = new PTLTipoGaleria();
    menuItems$!: Observable<NavigationItem[]>;
    gradientConfig: any;
    navCollapsed: boolean = false;
    navCollapsedMob: boolean = false;
    windowWidth: number = 0;

    isSubmit: boolean = false;
    modoEdicion: boolean = false;
    codeTipo = uuidv4();
    tipoEditorTexto = 'basica';
    lockScreenSubscription: Subscription | undefined;
    isLocked: boolean = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _localStorageService: LocalStorageService,
        private _tiposGaleriaService: PtlTiposGaleriaService,
        private _swalService: SwalAlertService
    ) {
        this.gradientConfig = GradientConfig;
        this._navigationService.getNavigationItems();
        const regId = this._localStorageService.getObject<string>('regId') || 'nuevo'
        if (regId !== 'nuevo') {
            this.modoEdicion = true;
            this._tiposGaleriaService.getTipoGaleriaById(regId).subscribe({
                next: (resp: any) => {
                    this.FormRegistro = resp.tipoGaleria;
                    this.codeTipo = resp.tipoGaleria.codigoTipoGaleria;
                },
                error: () => Swal.fire('Error', 'No se pudo obtener el Tipo de Galería', 'error')
            });
        }

    }

    ngOnInit() {
        this.menuItems$ = this._navigationService.menuItems$;
        if (this.modoEdicion == false) {
            this.FormRegistro.codigoTipoGaleria = uuidv4();
            this.FormRegistro.estadoTipo = true;
        }
    }

    ngOnDestroy() {
        if (this.lockScreenSubscription) this.lockScreenSubscription.unsubscribe();
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcionTipo = nuevoContenido;
    }

    btnGestionarTipoClick(form: any) {
        if (this.modoEdicion) {
            this.FormRegistro.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            this.FormRegistro.fechaModificacion = new Date().toISOString();
            this._tiposGaleriaService.actualizarTipoGaleria(this.FormRegistro).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        this._swalService.getAlertSuccess(this.translate.instant('TIPOSGALERIA.UPDATESUCCSESSFULLY'));
                        form.resetForm();
                        this.router.navigate(['/biblioteca/tipos-galeria']);
                    }
                },
                error: () => this._swalService.getAlertError('No se pudo actualizar')
            });
        } else {
            form.tipoId = 0;
            const registroData = form.value as PTLTipoGaleria;
            registroData.codigoTipoGaleria = this.FormRegistro.codigoTipoGaleria;
            registroData.descripcionTipo = this.FormRegistro.descripcionTipo;
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            registroData.fechaCreacion = new Date().toISOString();
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            registroData.fechaModificacion = new Date().toISOString();

            this._tiposGaleriaService.crearTipoGaleria(registroData).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        this._swalService.getAlertSuccess(this.translate.instant('TIPOSGALERIA.CREATESUCCSESSFULLY'));
                        form.resetForm();
                        this.router.navigate(['/biblioteca/tipos-galeria']);
                    }
                },
                error: () => this._swalService.getAlertError('No se pudo crear')
            });
        }
    }

    btnRegresarClick() {
        this.router.navigate(['/biblioteca/tipos-galeria']);
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
