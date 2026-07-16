/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataTablesModule, DataTableDirective } from 'angular-datatables';
import { Subscription, tap, catchError, of, Observable } from 'rxjs';
import { GradientConfig } from 'src/app/app-config';

// Componentes de Layout
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

// Modelos y Servicios
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { PTLTiposScriptsModel } from 'src/app/theme/shared/_helpers/models/PTLTiposScript.model';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { PTLTiposScriptsService } from 'src/app/theme/shared/service/ptltipos-scripts.service';
import { LocalStorageService, PtllogActividadesService } from 'src/app/theme/shared/service';

import Swal from 'sweetalert2';

@Component({
    selector: 'app-tipos-scripts',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
    templateUrl: './tipos-scripts.component.html',
    styleUrl: './tipos-scripts.component.scss'
})
export class TiposScriptsComponent implements OnInit {
    @ViewChild(DataTableDirective, { static: false })
    @Output()
    toggleSidebar = new EventEmitter<void>();

    //#region VARIABLES
    registrosSub?: Subscription;
    registros: PTLTiposScriptsModel[] = [];
    registrosFiltrado: PTLTiposScriptsModel[] = [];
    lang: string = localStorage.getItem('lang') || '';
    gradientConfig;
    hasFiltersSlot: boolean = false;
    menuItems$!: Observable<NavigationItem[]>;
    activeTab: 'menu' | 'filters' | 'main' = 'menu';

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _tiposScriptsService: PTLTiposScriptsService,
        private _logActividadesService: PtllogActividadesService,
        private _localStorageService: LocalStorageService,
        private _navigationService: NavigationService
    ) {
        this.gradientConfig = GradientConfig;
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems$ = this._navigationService.menuItems$;
        this.hasFiltersSlot = true;
        this.consultarRegistros();
    }

    consultarRegistros() {
        this.registrosSub = this._tiposScriptsService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        resp.tiposScripts.forEach((tipo: any) => {
                            tipo.nomEstado = tipo.estadoTipo == true ? 'Activo' : 'Inactivo';
                        });
                        this.registros = resp.tiposScripts;
                        this.registrosFiltrado = resp.tiposScripts;
                    }
                }),
                catchError((err: any) => {
                    console.error('Ha ocurrido un error al cargar tipos de scripts', err);
                    return of(null);
                })
            )
            .subscribe();
    }

    columnasTiposScripts: ColumnMetadata[] = [
        {
            name: 'codigoTipoScript',
            header: 'TIPOS_SCRIPTS.CODIGO',
            type: 'text'
        },
        {
            name: 'nombreTipo',
            header: 'TIPOS_SCRIPTS.NOMBRE',
            type: 'text'
        },
        {
            name: 'nomEstado',
            header: 'PLATAFORMA.STATUS',
            type: 'text'
        }
    ];

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'descripcionTipo',
            header: 'TIPOS_SCRIPTS.DESCRIPCION',
            type: 'text'
        }
    ];

    OnNuevoRegistroClick() {
        this._localStorageService.setObject('regId', 'nuevo')
        this.router.navigate(['/administracion-bd/tipos-scripts/gestion-tipo']);
    }

    OnEditarRegistroClick(id: any) {
        this._localStorageService.setObject('regId', 'id')
        this.router.navigate(['/administracion-bd/tipos-scripts/gestion-tipo']);
    }

    OnEliminarRegistroClick(evento: any) {
        const id = typeof evento === 'string' ? evento : evento?.codigoTipoScript || evento?.id;

        Swal.fire({
            title: this.translate.instant('TIPOS_SCRIPTS.ELIMINARTITULO'),
            text: this.translate.instant('TIPOS_SCRIPTS.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then((result: any) => {
            if (result.isConfirmed) {
                this._tiposScriptsService.deleteEliminarRegistro(id).subscribe({
                    next: (resp: any) => {
                        const logData = {
                            codigoTipoScriptLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('TIPOS_SCRIPTS.ELIMINAREXITOSA') + ' ' + resp.mensaje
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe();
                        Swal.fire(this.translate.instant('TIPOS_SCRIPTS.ELIMINAREXITOSA'), resp.mensaje, 'success');

                        this.registros = this.registros.filter((t) => t.codigoTipoScript !== id);
                        this.registrosFiltrado = this.registrosFiltrado.filter((t) => t.codigoTipoScript !== id);
                    },
                    error: (err: any) => {
                        const logData = {
                            codigoTipoScriptLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('TIPOS_SCRIPTS.ELIMINARERROR') + ' ' + err.message
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe();
                        Swal.fire('Error', this.translate.instant('TIPOS_SCRIPTS.ELIMINARERROR'), 'error');
                        console.error('Error eliminando', err);
                    }
                });
            }
        });
    }

    // Filtros del menú lateral
    onFiltroNombreChangeClick(evento: any) {
        const textoFiltro = evento.target.value.toLowerCase();
        if (!textoFiltro) {
            this.registrosFiltrado = [...this.registros];
        } else {
            this.registrosFiltrado = this.registros.filter((tipo) => (tipo.nombreTipo || '').toLowerCase().includes(textoFiltro));
        }
    }

    onFiltroDescripcionChangeClick(evento: any) {
        const textoFiltro = evento.target.value.toLowerCase();
        if (!textoFiltro) {
            this.registrosFiltrado = [...this.registros];
        } else {
            this.registrosFiltrado = this.registros.filter((tipo) => (tipo.descripcionTipo || '').toLowerCase().includes(textoFiltro));
        }
    }

    onFiltroEstadoChangeClick(evento: any) {
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
