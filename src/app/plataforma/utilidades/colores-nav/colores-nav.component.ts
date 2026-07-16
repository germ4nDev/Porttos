/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
//#region IMPORTS
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/theme/shared/service/lenguage.service';
import { catchError, Observable, tap } from 'rxjs';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component';
import { of, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { SwalAlertService } from '../../../theme/shared/service/swal-alert.service';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { PTLColorSettingModel } from 'src/app/theme/shared/_helpers/models/PTLColorSetting.model';
import { LocalStorageService, PtlColoresSettingsService } from 'src/app/theme/shared/service';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
//#endregion IMPORTS

@Component({
    selector: 'app-colores-nav',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
    templateUrl: './colores-nav.component.html',
    styleUrl: './colores-nav.component.scss'
})
export class ColoresNavComponent implements OnInit {
    //#region VARIABLES
    @Output() toggleSidebar = new EventEmitter<void>();
    activeTab: 'menu' | 'filters' | 'main' = 'menu';
    menuItems!: Observable<NavigationItem[]>;
    registrosSub?: Subscription;
    registros: PTLColorSettingModel[] = [];
    registrosFiltrado: PTLColorSettingModel[] = [];
    lang: string = localStorage.getItem('lang') || '';
    tituloPagina: string = '';
    //#endregion VARIABLES

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _swalService: SwalAlertService,
        private _registrosService: PtlColoresSettingsService,
        private _localStorageService: LocalStorageService,
        private _languageService: LanguageService
    ) { }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems = this._navigationService.menuItems$;
        console.log('elementos menu componente', this.menuItems);
        this.consultarRegistros();
    }

    public columnasRegistros: ColumnMetadata[] = [
        {
            name: 'navbarColor',
            header: 'PLATAFORMA.COLORSETTING.NAVBARCOLOR',
            type: 'color_chip'
        },
        {
            name: 'textoColor',
            header: 'PLATAFORMA.COLORSETTING.TEXTCOLOR',
            type: 'color_chip'
        },
        {
            name: 'iconosColor',
            header: 'PLATAFORMA.COLORSETTING.ICONSCOLOR',
            type: 'color_chip'
        },
        {
            name: 'buttonsHoverColor',
            header: 'PLATAFORMA.COLORSETTING.HOVERCOLOR',
            type: 'color_chip'
        },
        {
            name: 'nomEstado',
            header: 'PLATAFORMA.COLORSETTING.STATUS',
            type: 'estado'
        }
    ];

    ngOnDestroy(): void {
        console.log('entrando a componente usuarios');
        this.registrosSub?.unsubscribe();
    }

    consultarRegistros() {
        this.registrosSub = this._registrosService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        resp.coloresNav.forEach((color: any) => {
                            color.nomEstado = color.estadoColor == true ? 'Activo' : 'Inactivo';
                        });
                        this.registros = resp.coloresNav;
                        this.registrosFiltrado = resp.coloresNav;
                        console.log('Todos las coloresNav', this.registrosFiltrado);
                        return;
                    }
                }),
                catchError((err) => {
                    console.log('Ha ocurrido un error', err);
                    return of(null);
                })
            )
            .subscribe();
    }

    getEstado(estado: boolean): string {
        return estado ? 'Activo' : 'Inactivo';
    }

    OnNuevoRegistroClick() {
        this._localStorageService.setObject('regId', 'nuevo')
        this.router.navigate(['utilidades/gestion-color']);
    }

    OnEditarRegistroClick(id: number) {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['utilidades/gestion-color']);
    }

    OnEliminarRegistroClick(id: number) {
        Swal.fire({
            title: this.translate.instant('PLATAFORMA.COLORESNAV.ELIMINARTITULO'),
            text: `this.translate.instant('PLATAFORMA.COLORESNAV.ELIMINARTEXTO')`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then((result: any) => {
            if (result.isConfirmed) {
                this._registrosService.deleteEliminarRegistro(id).subscribe({
                    next: (resp: any) => {
                        this._swalService.getAlertSuccess(this.translate.instant('PLATAFORMA.COLORESNAV.ELIMINAREXITOSA') + ', ' + resp.mensaje);
                        this.registros = this.registros.filter((s) => s.colorNavId !== id);
                    },
                    error: (err: any) => {
                        this._swalService.getAlertError(this.translate.instant('PLATAFORMA.COLORESNAV.ELIMINARERROR') + ', ' + err);
                        console.error('Error eliminando', err);
                    }
                });
            }
        });
    }

    onFiltroEstadoChangeClick(evento: any) {
        console.log('filtrar el estado ', evento.target.value);
        if (evento.target.value == 'todos') {
            this.registrosFiltrado = [...this.registros];
        } else {
            const estado = evento.target.value == 'true' ? true : false;
            console.log('Usuarios', this.registrosFiltrado);
            this.registrosFiltrado = this.registros.filter((x) => (x.estadoColor = estado));
        }
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
