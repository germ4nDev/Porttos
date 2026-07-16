/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, of, BehaviorSubject, combineLatest } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { GradientConfig } from 'src/app/app-config';

import { PTLTipoGaleria } from 'src/app/theme/shared/_helpers/models/PTLTipoGaleria.model';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component';
import { PtlTiposGaleriaService } from 'src/app/theme/shared/service/ptltipos-galeria.service';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';

import Swal from 'sweetalert2';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model';
import { LocalStorageService, PtllogActividadesService } from 'src/app/theme/shared/service';
import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';

@Component({
    selector: 'app-tipos-galeria',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
    templateUrl: './tipos-galeria.component.html',
    styleUrl: './tipos-galeria.component.scss'
})
export class TiposGaleriaComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>();
    DataModel: BaseSessionModel = new BaseSessionModel();
    DataLogActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel();
    hasFiltersSlot: boolean = false;
    gradientConfig;
    menuItems$!: Observable<NavigationItem[]>;
    activeTab: 'menu' | 'filters' | 'main' = 'menu';

    subscriptions = new Subscription();
    filtroCodigoSubject = new BehaviorSubject<string>('todos');
    filtroNombreSubject = new BehaviorSubject<string>('todos');
    filtroDescripcionSubject = new BehaviorSubject<string>('');
    filtroEstadoSubject = new BehaviorSubject<string>('todos');

    tiposTransformada$: Observable<PTLTipoGaleria[]> = of([]);
    tiposFiltrada$: Observable<PTLTipoGaleria[]> = of([]);
    tipos: PTLTipoGaleria[] = [];

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _logActividadesService: PtllogActividadesService,
        private _localStorageService: LocalStorageService,
        private _tiposGaleriaService: PtlTiposGaleriaService
    ) {
        this.gradientConfig = GradientConfig;
    }

    cargarDatos(): void {
        this.subscriptions.add(
            this._tiposGaleriaService.cargarTiposGaleria().subscribe(
                () => console.log('Datos de Tipos de Galería actualizados'),
                (err: any) => console.error('Error al cargar Tipos de Galería:', err)
            )
        );
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems();
        this.menuItems$ = this._navigationService.menuItems$;
        this.hasFiltersSlot = true;
        this.setupTiposStream();

        this.subscriptions.add();
        this.cargarDatos();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    setupTiposStream(): void {
        this.tiposTransformada$ = this._tiposGaleriaService.tiposGaleria$.pipe(
            switchMap((tipos: PTLTipoGaleria[]) => {
                if (!tipos) return of([]);
                const transformed = tipos.map((t: any) => {
                    t.nomEstado = t.estadoTipo ? 'Activo' : 'Inactivo';
                    return t as PTLTipoGaleria;
                });
                this.tipos = transformed;
                return of(transformed);
            }),
            catchError((err) => {
                console.error('Error en el stream de Tipos de Galería:', err);
                return of([]);
            })
        );

        this.tiposFiltrada$ = combineLatest([
            this.tiposTransformada$.pipe(startWith([])),
            this.filtroCodigoSubject,
            this.filtroNombreSubject,
            this.filtroDescripcionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([tipos, codigo, nombre, descripcion, estado]) => {
                let filtered = tipos;

                if (codigo !== 'todos') filtered = filtered.filter((t) => t.codigoTipoGaleria === codigo);
                if (nombre !== 'todos') filtered = filtered.filter((t) => t.nombreTipo === nombre);
                if (estado !== 'todos') {
                    const estadoBoolean = estado === 'true';
                    filtered = filtered.filter((t) => t.estadoTipo === estadoBoolean);
                }
                if (descripcion) {
                    const textoFiltro = descripcion.toLowerCase();
                    filtered = filtered.filter((t) => (t.descripcionTipo || '').toLowerCase().includes(textoFiltro));
                }
                console.log('filtrados', filtered);

                return filtered;
            })
        );
    }

    onFiltroCodigoChangeClick(evento: any): void {
        this.filtroCodigoSubject.next(evento.target.value);
    }
    onFiltroNombreChangeClick(evento: any): void {
        this.filtroNombreSubject.next(evento.target.value);
    }
    onFiltroDescripcionChangeClick(evento: any): void {
        this.filtroDescripcionSubject.next(evento.target.value);
    }
    onFiltroEstadoChangeClick(evento: any): void {
        this.filtroEstadoSubject.next(evento.target.value);
    }

    columnasTipos: ColumnMetadata[] = [
        { name: 'codigoTipo', header: 'TIPOSGALERIA.CODE', type: 'text' },
        { name: 'nombreTipo', header: 'TIPOSGALERIA.NAME', type: 'text' },
        { name: 'nomEstado', header: 'TIPOSGALERIA.STATUS', type: 'estado' }
    ];

    columnasDetailRegistros: ColumnMetadata[] = [{ name: 'descripcionTipo', header: 'TIPOSGALERIA.DESCRIPTION', type: 'text' }];

    OnNuevoTipoClick(): void {
        this._localStorageService.setObject('regId', 'nuevo');
        this.router.navigate(['/biblioteca/gestion-tipos-galeria']);
    }

    OnEditarTipoClick(id: string): void {
        this._localStorageService.setObject('regId', id);
        this.router.navigate(['/biblioteca/gestion-tipos-galeria']);
    }

    OnEliminarTipoClick(evento: any): void {
        const id = typeof evento === 'string' ? evento : evento?.codigoTipo || evento?.id;

        if (!id) {
            console.error('No se pudo extraer el ID del registro a eliminar. El evento recibido fue:', evento);
            return;
        }

        Swal.fire({
            title: this.translate.instant('TIPOSGALERIA.ELIMINARTITULO'),
            text: this.translate.instant('TIPOSGALERIA.ELIMINARTEXTO'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
            cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
        }).then((result) => {
            if (result.isConfirmed) {
                this._tiposGaleriaService.eliminarTipoGaleria(id).subscribe({
                    next: (resp: any) => {
                        Swal.fire(this.translate.instant('TIPOSGALERIA.ELIMINAREXITOSA'), resp.mensaje, 'success');
                        this.cargarDatos();
                    },
                    error: () => Swal.fire('Error', this.translate.instant('TIPOSGALERIA.ELIMINARERROR'), 'error')
                });
            }
        });
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
