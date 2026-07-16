/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataTablesModule } from 'angular-datatables';
import { Router } from '@angular/router';
import { catchError, Observable, of, Subscription, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GradientConfig } from 'src/app/app-config';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component';
import { PtlvaloresUnitariosService } from 'src/app/theme/shared/service/ptlvalores-unitarios.service';
import { PTLItems } from 'src/app/theme/shared/_helpers/models/PTLItem.model';
import Swal from 'sweetalert2';
import { PtltiposItemsService } from 'src/app/theme/shared/service/ptltipos-items.service';
import { PTLTipoItemModel } from '../../../theme/shared/_helpers/models/PTLTipoItem.model';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { LocalStorageService, SwalAlertService } from 'src/app/theme/shared/service';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';

@Component({
    selector: 'app-precios-unitarios',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
    templateUrl: './items.component.html',
    styleUrl: './items.component.scss'
})
export class ItemsComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>();
    //#region VARIABLES
    registrosSub?: Subscription;
    tiposValorSub?: Subscription;
    registros: PTLItems[] = [];
    tiposValor: PTLTipoItemModel[] = [];
    registrosFiltrado: PTLItems[] = [];
    lang: string = localStorage.getItem('lang') || '';
    tituloPagina: string = '';
    gradientConfig;
    hasFiltersSlot: boolean = false;
    menuItems!: Observable<NavigationItem[]>;
    activeTab: 'menu' | 'filters' | 'main' = 'menu';
    //#endregion VARIABLES

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _registrosService: PtlvaloresUnitariosService,
        private _tiposItemService: PtltiposItemsService,
        private _localStorageService: LocalStorageService,
        private _swalAlertService: SwalAlertService,
        private _navigationService: NavigationService
    ) {
        this.gradientConfig = GradientConfig;
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems = this._navigationService.menuItems$;
        this.hasFiltersSlot = true;
        this.consultarTiposValor();
        this.consultarRegistros();
    }

    consultarTiposValor() {
        this.tiposValorSub = this._tiposItemService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.tiposValor = resp.tiposValor;
                    }
                }),
                catchError((err) => {
                    console.error(err);
                    return of([]);
                })
            )
            .subscribe();
    }

    consultarRegistros() {
        this.registrosSub = this._registrosService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        resp.valoresUnitarios.forEach((reg: any) => {
                            reg.nomEstado = reg.estadoValor == true ? 'Activa' : 'Inactiva';
                            reg.nomTipo = this.tiposValor.filter((x) => x.codigoTipoItem == reg.codigoTipoItem)[0].nombreTipo;
                        });
                        this.registros = resp.valoresUnitarios;
                        this.registrosFiltrado = resp.valoresUnitarios;
                        console.log('Todos los precios unitarios', this.registrosFiltrado);
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

    columnasRegistros: ColumnMetadata[] = [
        {
            name: 'nomTipo',
            header: 'PRECIOS.TIPO',
            type: 'text'
        },
        {
            name: 'nombreValor',
            header: 'PRECIOS.NAME',
            type: 'text'
        },
        {
            name: 'valorUnitario',
            header: 'PRECIOS.VALOR',
            type: 'price'
        },
        {
            name: 'costoValor',
            header: 'PRECIOS.COSTO',
            type: 'price'
        },
        {
            name: 'nomEstado',
            header: 'PRECIOS.STATUS',
            type: 'text'
        }
    ];

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'codigoValor',
            header: 'PRECIOS.CODIGO',
            type: 'text'
        },
        {
            name: 'descripcionValor',
            header: 'PRECIOS.DESCRIPTION',
            type: 'text'
        }
    ];

    OnNuevoRegistroClick() {
        this._localStorageService.setObject('regId', 'nuevo')
        this.router.navigate(['/lista-precios/gestion-precio']);
    }

    OnEditarRegistroClick(id: number) {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['/lista-precios/gestion-precio']);
    }

    OnEliminarRegistroClick(id: any) {
        Swal.fire({
            title: this.translate.instant('PRECIOS.ELIMINARTITULO'),
            text: this.translate.instant('PRECIOS.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then((result) => {
            console.log('Eliminado', id);
            if (result.isConfirmed) {
                this._registrosService.deleteEliminarRegistro(id.id).subscribe({
                    next: (resp: any) => {
                        this._swalAlertService.getAlertSuccess(resp.mensaje);
                        this.consultarRegistros();
                    },
                    error: (err: any) => {
                        this._swalAlertService.getAlertError(this.translate.instant('PRECIOS.ELIMINARERROR'));
                        console.error('Error eliminando', err);
                    }
                });
            }
        });
    }

    onFiltroTipoValorChangeClick(evento: any) {
        console.log('filtrar el codigo ', evento.target.value);
        if (evento.target.value == 'todos') {
            this.registrosFiltrado = this.registros;
        } else {
            this.registrosFiltrado = this.registrosFiltrado.filter((x) => (x.codigoTipoItem = evento.target.value));
            this.consultarRegistros();
        }
    }

    onFiltroNombreChangeClick(evento: any) {
        console.log('filtrar el NOMBRE ', evento.target.value);
        const textoFiltro = evento.target.value.toLowerCase();
        if (!textoFiltro) {
            this.registrosFiltrado = [...this.registros];
        } else {
            this.registrosFiltrado = this.registrosFiltrado.filter((sitio) => (sitio.nombreItem || '').toLowerCase().includes(textoFiltro));
            console.log('filtrados', this.registrosFiltrado);
        }
    }

    onFiltroDescripcionChangeClick(evento: any) {
        console.log('filtrar el descripcion ', evento.target.value);
        const textoFiltro = evento.target.value.toLowerCase();
        if (!textoFiltro) {
            this.registrosFiltrado = [...this.registros];
        } else {
            this.registrosFiltrado = this.registrosFiltrado.filter((app) => (app.descripcionItem || '').toLowerCase().includes(textoFiltro));
            console.log('filtrados', this.registrosFiltrado);
        }
    }

    onFiltroEstadoChangeClick(evento: any) {
        console.log('filtrar el estado ', evento.target.value);
        if (evento.target.value == 'todos') {
            this.registrosFiltrado = this.registros;
        } else {
            const estado = evento.target.value == 'true' ? true : false;
            this.registrosFiltrado = this.registros.filter((x) => x.estadoItem == estado);
        }
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
