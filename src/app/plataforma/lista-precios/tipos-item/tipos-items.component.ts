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
import Swal from 'sweetalert2';
import { PtltiposItemsService } from 'src/app/theme/shared/service/ptltipos-items.service';
import { PTLTipoItemModel } from '../../../theme/shared/_helpers/models/PTLTipoItem.model';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { LocalStorageService } from 'src/app/theme/shared/service';

@Component({
    selector: 'app-tipos-valor',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
    templateUrl: './tipos-items.component.html',
    styleUrl: './tipos-items.component.scss'
})
export class TiposItemComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>();
    //#region VARIABLES
    registrosSub?: Subscription;
    registros: PTLTipoItemModel[] = [];
    registrosFiltrado: PTLTipoItemModel[] = [];
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
        private _registrosService: PtltiposItemsService,
        private _localStorageService: LocalStorageService,
        private _navigationService: NavigationService
    ) {
        this.gradientConfig = GradientConfig;
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems = this._navigationService.menuItems$;
        this.hasFiltersSlot = true;
        this.consultarRegistros();
        console.log('elementos menu componente', this.menuItems);
    }

    consultarRegistros() {
        this.registrosSub = this._registrosService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        resp.tiposValor.forEach((reg: any) => {
                            reg.nomEstado = reg.estadoTipo == true ? 'Activa' : 'Inactiva';
                        });
                        this.registros = resp.tiposValor;
                        this.registrosFiltrado = resp.tiposValor;
                        console.log('Todos los sitios', this.registrosFiltrado);
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
            name: 'nombreTipo',
            header: 'PRECIOS.TIPOS.NAME',
            type: 'text'
        },
        {
            name: 'descripcionTipo',
            header: 'PRECIOS.TIPOS.DESCRIPCIONTIPO',
            type: 'text'
        },
        {
            name: 'nomEstado',
            header: 'PRECIOS.TIPOS.STATUS',
            type: 'text'
        }
    ];

    OnNuevoRegistroClick() {
        this._localStorageService.setObject('regId', 'nuevo')
        this.router.navigate(['/lista-precios/gestion-tipo']);
    }

    OnEditarRegistroClick(id: number) {
        this._localStorageService.setObject('regId', id)
        this.router.navigate(['/lista-precios/gestion-tipo']);
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
                        Swal.fire(this.translate.instant('PRECIOS.ELIMINAREXITOSA'), resp.mensaje, 'success');
                        this.consultarRegistros();
                    },
                    error: (err: any) => {
                        Swal.fire('Error', this.translate.instant('PRECIOS.ELIMINARERROR'), 'error');
                        console.error('Error eliminando', err);
                    }
                });
            }
        });
    }

    onFiltroNombreChangeClick(evento: any) {
        console.log('filtrar el NOMBRE ', evento.target.value);
        const textoFiltro = evento.target.value.toLowerCase();
        if (!textoFiltro) {
            this.registrosFiltrado = [...this.registros];
        } else {
            this.registrosFiltrado = this.registrosFiltrado.filter((sitio) => (sitio.nombreTipo || '').toLowerCase().includes(textoFiltro));
            console.log('filtrados', this.registrosFiltrado);
        }
    }

    onFiltroDescripcionChangeClick(evento: any) {
        console.log('filtrar el descripcion ', evento.target.value);
        const textoFiltro = evento.target.value.toLowerCase();
        if (!textoFiltro) {
            this.registrosFiltrado = [...this.registros];
        } else {
            this.registrosFiltrado = this.registrosFiltrado.filter((app) => (app.descripcionTipo || '').toLowerCase().includes(textoFiltro));
            console.log('filtrados', this.registrosFiltrado);
        }
    }

    onFiltroEstadoChangeClick(evento: any) {
        console.log('filtrar el estado ', evento.target.value);
        if (evento.target.value == 'todos') {
            this.registrosFiltrado = this.registros;
        } else {
            const estado = evento.target.value == 'true' ? true : false;
            this.registrosFiltrado = this.registros.filter((x) => x.estadoTipo == estado);
        }
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
