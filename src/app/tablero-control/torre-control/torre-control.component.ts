/*
    Author: German Valencia
    Patrón: QPLUS Orchestrator Component - Limpieza Absoluta de Pestañas
*/
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GridsterConfig, GridsterItem, GridType, DisplayGrid, GridsterComponent, GridsterItemComponent } from 'angular-gridster2';

import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';
import { TableroStateService } from './../../theme/shared/service/tablero-control/tablero-state.service';
import { FiltroTableroService } from 'src/app/theme/shared/service/tablero-control/filtro-tablero.service';
import { WidgetsService } from 'src/app/theme/shared/service/tablero-control/widgets.service';
import { MaritimoService } from 'src/app/theme/shared/service/tablero-control/maritimo.service';
import { LocalStorageService } from 'src/app/theme/shared/service';

import { TcHeaderComponent } from "../widgets/tc-header/tc-header.component";
import { WidgetSelectorComponent } from "../widgets/widget-selector/widget-selector.component";
import { WidgetLobbyComponent } from "../widgets/widget-lobby/widget-lobby.component";
import { Widget } from 'src/app/theme/shared/_helpers/models/tablero-control/widget.model';
import { LayoutService } from 'src/app/theme/shared/service/tablero-control/layout.service';

@Component({
    selector: 'app-torre-control',
    standalone: true,
    imports: [CommonModule, TranslateModule, TcHeaderComponent, GridsterComponent, GridsterItemComponent, WidgetSelectorComponent, WidgetLobbyComponent],
    templateUrl: './torre-control.component.html',
    styleUrls: ['./torre-control.component.scss']
})
export class TorreControlComponent implements OnInit, OnDestroy {
    public options!: GridsterConfig;
    public dashboard: Array<GridsterItem & { type: string, data: any }> = [];

    public cargando: boolean = true;
    public tableroBloqueado: boolean = true;
    public widgetEnfoque: { type: string, data: any } | null = null;
    public hayCambiosSinGuardar: boolean = false;
    public lsWidgets: Widget[] = [];
    public lsLayout: any[] = [];

    public pestanaActiva: string = '';
    public puertoSeleccionado: string = 'BUENAVENTURA';
    public usuarioId: string = '';
    public isLoading: boolean = false;
    public mostrarLobby: boolean = false;

    public listaDePuertos: any[] = [
        { id: 'BUENAVENTURA', nombre: 'Buenaventura (SPRBUN / TCBUEN)' },
        { id: 'CARTAGENA', nombre: 'Cartagena (SPRC / CONTECAR)' },
        { id: 'BARRANQUILLA', nombre: 'Barranquilla (SPRB)' },
        { id: 'SANTAMARTA', nombre: 'Santa Marta (SPRB)' }
    ];

    private subs: Subscription = new Subscription();

    constructor(
        private _stateService: TableroStateService,
        private _torreService: DashboardService,
        private _maritimoService: MaritimoService,
        private _filtroService: FiltroTableroService,
        private _widgetsService: WidgetsService,
        private _localStoragoService: LocalStorageService,
        private _layoutService: LayoutService,
        private cdr: ChangeDetectorRef
    ) { }

    async ngOnInit() {
        this.iniciarConfiguracionGridster();

        // 1. Cargamos arreglos maestros
        this.lsWidgets = this._widgetsService.getWidgetsActuales();
        this.lsLayout = this._layoutService.getLayoutActuales();

        const current = this._localStoragoService.getCurrentUserLocalStorage();
        this.usuarioId = current?.usuario?.codigoUsuario || 'SISTEMA_DEFAULT';

        const tableroState = await this._localStoragoService.getTableroLocalStorage();
        this.pestanaActiva = tableroState.pestana || 'TLC_MARITIMO_001';
        this._localStoragoService.setPuertoLocalStorage(this.puertoSeleccionado);

        // 2. Ejecutamos el cambio de pestaña inicial (Esto hará el join y filtrado automáticamente)
        this.cambiarPestana(this.pestanaActiva);

        this.subs.add(
            this._filtroService.ciudad$.pipe(
                distinctUntilChanged(),
                debounceTime(300),
                filter(puerto => !!puerto)
            ).subscribe(async (puerto: any) => {
                const puertoStr = typeof puerto === 'string' ? puerto : (puerto.id_puerto || puerto.id || 'BUENAVENTURA');
                this.puertoSeleccionado = puertoStr;

                if (this.pestanaActiva.includes('MARITIMO')) {
                    this.sincronizarTorreMaritima(puertoStr);
                } else if (!this.pestanaActiva.includes('MAPA')) {
                    this._stateService.inyectarDatosVivos(puertoStr, this.dashboard);
                }
            })
        );

        this.subs.add(this._torreService.widgetFocus$.subscribe(widget => {
            this.widgetEnfoque = widget;
            this.cdr.detectChanges();
        }));
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }

    /**
     * NÚCLEO DE FUSIÓN Y FILTRADO: Cruza lsLayout con lsWidgets y filtra por pestaña
     */
    armarDashboardPorPestana(pestana: string): any[] {
        return this.lsLayout
            .map(layoutItem => {
                const widgetConfig = this.lsWidgets.find(w => w.codigo_widget === layoutItem.type);

                return {
                    ...widgetConfig,
                    ...layoutItem
                };
            })
            .filter((item: any) => item.codigo_widget && item.pestana === pestana);
    }

    async cambiarPestana(nuevaPestana: string) {
        // 1. Sincronizamos las coordenadas actuales (x, y, cols, rows) hacia el arreglo maestro
        // Esto evita que se pierdan las posiciones si el usuario vuelve a esta pestaña luego
        this.sincronizarDashboardAMaestro();

        // 2. Si el usuario movió cosas y no guardó manualmente, disparamos el guardado automático
        if (this.hayCambiosSinGuardar) {
            this.guardarConfiguracionTablero();
        }

        this.isLoading = true;
        this.cargando = true;
        this.pestanaActiva = nuevaPestana;
        this.dashboard = [];

        this._localStoragoService.setPestanaLocalStorage(nuevaPestana, this.usuarioId);

        const layoutParaRenderizar = this.armarDashboardPorPestana(nuevaPestana);

        const estadoActual = await this._localStoragoService.getTableroLocalStorage() || {};
        estadoActual.layout = layoutParaRenderizar;
        estadoActual.pestana = nuevaPestana;

        if (typeof (this._localStoragoService as any).setTableroLocalStorage === 'function') {
            (this._localStoragoService as any).setTableroLocalStorage(estadoActual);
        } else {
            localStorage.setItem('tableroState', JSON.stringify(estadoActual));
        }

        this.renderizarLayoutDesdeCache(layoutParaRenderizar, nuevaPestana);
    }

    /**
     * Sincroniza las coordenadas actuales de Gridster hacia el layout maestro en memoria.
     * Crucial para no perder las modificaciones temporales al cambiar entre pestañas.
     */
    sincronizarDashboardAMaestro() {
        if (!this.dashboard || this.dashboard.length === 0) return;

        this.dashboard.forEach(widgetEnPantalla => {
            // Buscamos el widget original en el maestro comparando el type
            const index = this.lsLayout.findIndex(l => l.type === widgetEnPantalla.type);

            if (index !== -1) {
                // Si ya existe, reemplazamos todo el objeto en el maestro.
                // Fusionamos lo que ya tenía con TODAS las propiedades nuevas del widget en pantalla.
                this.lsLayout[index] = { ...this.lsLayout[index], ...widgetEnPantalla };
            } else {
                // Si NO existe (ej. un widget recién agregado desde el Lobby),
                // insertamos el objeto completo directamente en el arreglo maestro.
                this.lsLayout.push({ ...widgetEnPantalla });
            }
        });
    }

    renderizarLayoutDesdeCache(layoutCrudo: any[], codigoDashboard: string) {
        this.cargando = true;
        const esMapa = codigoDashboard.includes('MAPA');
        const esMaritimo = codigoDashboard.includes('MARITIMO');

        // 1. LIMPIEZA ABSOLUTA DE GRIDSTER Y DOM
        this.dashboard = [];
        this.options.gridType = esMapa ? GridType.Fit : GridType.ScrollVertical;
        if (this.options.api && this.options.api.optionsChanged) {
            this.options.api.optionsChanged();
        }
        this.cdr.detectChanges(); // Forzamos a Angular a destruir todo el HTML previo

        // 2. CONSTRUIMOS EL NUEVO DISEÑO EN MEMORIA ESTRICTAMENTE
        let layoutBase: any[] = [];

        if (esMapa) {
            // Regla estricta: Si es Mapa, SOLO sobrevive el Mapa. Todo lo demás se elimina.
            layoutBase = layoutCrudo.filter((w: any) => w.type === 'WDG_MAPA_LOGISTICO' || w.type === 'MAPA');
            if (layoutBase.length === 0) {
                layoutBase = [{ type: 'WDG_MAPA_LOGISTICO', cols: 12, rows: 5, x: 0, y: 0 }];
            } else {
                layoutBase.forEach((w: any) => { w.cols = 12; w.rows = 5; w.x = 0; w.y = 0; });
            }
        }
        else {
            // Regla estricta: Si NO es Mapa, está ESTRICTAMENTE PROHIBIDO que exista el Mapa o fantasmas.
            layoutBase = layoutCrudo.filter((w: any) =>
                !['TERMINAL_INDIVIDUAL', 'WDG_TERMINAL_INDIVIDUAL', 'WDG_FANTASMA', 'BORRAR_ME', 'WDG_MAPA_LOGISTICO', 'MAPA'].includes(w.type) &&
                !(w.codigo_widget && w.codigo_widget.includes('TERM_DINAMICO')) &&
                !(w.codigo_widget && w.codigo_widget.includes('FANTASMA'))
            );
        }

        // 3. RENDERIZAMOS CON RETRASO SEGURO (Da tiempo a que WebGL suelte la memoria gráfica)
        setTimeout(() => {
            if (esMapa) {
                this.dashboard = [...layoutBase];
                this.cargando = false;
                this.isLoading = false;
                if (this.options.api && this.options.api.optionsChanged) this.options.api.optionsChanged();
                this.cdr.detectChanges();
            }
            else if (esMaritimo) {
                const esqueletosTerminales = Array.from({ length: 6 }).map((_, index) => ({
                    codigo_widget: 'WDG_TERM_DINAMICO_' + index, type: 'WDG_TERMINAL_INDIVIDUAL',
                    cols: 4, rows: 2, x: (index % 3) * 4, y: index < 3 ? 1 : 3, data: null
                }));

                this.dashboard = [...layoutBase, ...esqueletosTerminales].map(item => ({ ...item }));
                if (this.options.api && this.options.api.optionsChanged) this.options.api.optionsChanged();

                this.sincronizarTorreMaritima(this.puertoSeleccionado);
            }
            else {
                this.dashboard = [...layoutBase].map(item => ({ ...item }));
                this.cargando = false;
                this.isLoading = false;
                if (this.options.api && this.options.api.optionsChanged) this.options.api.optionsChanged();
                this.cdr.detectChanges();
            }
        }, 100); // 100ms garantizan limpieza del DOM
    }

    async cargarDatosDelPuerto(nuevoPuerto: any) {
        const puertoLimpio = nuevoPuerto?.target?.value || nuevoPuerto?.id || nuevoPuerto;
        this.puertoSeleccionado = puertoLimpio;

        if (this.options.api && this.options.api.optionsChanged) {
            this.options.draggable!.enabled = false;
            this.options.resizable!.enabled = false;
        }

        if (this.pestanaActiva.includes('MARITIMO')) {
            this.sincronizarTorreMaritima(this.puertoSeleccionado);
        } else if (!this.pestanaActiva.includes('MAPA')) {
            this._stateService.inyectarDatosVivos(this.puertoSeleccionado, this.dashboard);
        }
    }

    sincronizarTorreMaritima(puerto: string) {
        if (!this.dashboard || this.dashboard.length === 0) return;
        this.cargando = true;
        this.cdr.detectChanges();

        this._maritimoService.obtenerResumenOperativo(puerto).subscribe({
            next: (res: any) => {
                if (res && res.success && res.data) {
                    this.dashboard = [...this._hidratarWidgetsConDatos(this.dashboard, res.data)];
                    this.cargando = false;
                    this.isLoading = false;
                    if (this.options.api && this.options.api.optionsChanged) this.options.api.optionsChanged();
                    this.cdr.detectChanges();
                }
            },
            error: (err) => {
                console.error("❌ Error API Marítimo:", err);
                this.cargando = false;
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    private _hidratarWidgetsConDatos(layoutOriginal: any[], dataReal: any): any[] {
        // 🟢 DOBLE PURGA DE SEGURIDAD EN EL RELLENO DE DATOS
        const estaticos = layoutOriginal.filter(w =>
            !['TERMINAL_INDIVIDUAL', 'WDG_TERMINAL_INDIVIDUAL', 'WDG_FANTASMA', 'BORRAR_ME', 'WDG_MAPA_LOGISTICO', 'MAPA'].includes(w.type) &&
            !(w.codigo_widget && w.codigo_widget.includes('TERM_DINAMICO'))
        );

        const arrTerminales = dataReal.WDG_TERMINALES || dataReal.KPI_TERMINALES || [];
        const numTerminales = arrTerminales.length;
        const filasTerminales = Math.ceil(numTerminales / 3) * 2;
        const inicioEstaticos = 1 + filasTerminales;

        const estaticosAbajo = estaticos.filter(w => w.y > 0);
        const minYActual = estaticosAbajo.length > 0 ? Math.min(...estaticosAbajo.map(w => w.y)) : inicioEstaticos;
        const shiftY = inicioEstaticos - minYActual;

        const nuevoLayout = estaticos.map(widget => {
            let nuevaPosicionY = widget.y;
            if (widget.y > 0) nuevaPosicionY += shiftY;
            const tipo = widget.type?.trim().toUpperCase();
            if (dataReal[tipo]) return { ...widget, y: nuevaPosicionY, data: { ...(widget.data || {}), ...dataReal[tipo] } };
            return { ...widget, y: nuevaPosicionY };
        });

        const widgetsTerminales = arrTerminales.map((termData: any, index: number) => ({
            codigo_widget: 'WDG_TERM_DINAMICO_' + index, type: 'WDG_TERMINAL_INDIVIDUAL',
            cols: 4, rows: 2, x: (index % 3) * 4, y: 1 + Math.floor(index / 3) * 2, data: termData
        }));

        const fantasmas = [];
        const faltantes = (3 - (numTerminales % 3)) % 3;
        if (numTerminales > 0 && faltantes > 0) {
            const ultimaFilaY = 1 + Math.floor((numTerminales - 1) / 3) * 2;
            let currentX = (numTerminales % 3) * 4;
            for (let i = 0; i < faltantes; i++) {
                fantasmas.push({
                    codigo_widget: 'WDG_FANTASMA_' + i, type: 'WDG_FANTASMA',
                    cols: 4, rows: 2, x: currentX, y: ultimaFilaY,
                    dragEnabled: false, resizeEnabled: false, compactEnabled: false
                });
                currentX += 4;
            }
        }
        return [...nuevoLayout, ...widgetsTerminales, ...fantasmas];
    }

    iniciarConfiguracionGridster() {
        this.options = {
            gridType: GridType.ScrollVertical, margin: 16, outerMargin: false,
            minCols: 12, maxCols: 12, minRows: 1, maxRows: 100, fixedRowHeight: 160,
            pushItems: false, swap: true, compactType: 'compactUp',
            defaultItemCols: 4, defaultItemRows: 3, displayGrid: 'onDrag&Resize',
            draggable: { enabled: !this.tableroBloqueado }, resizable: { enabled: !this.tableroBloqueado },
            mobileBreakpoint: 960, keepFixedHeightInMobile: true,
            itemResizeCallback: () => { this.hayCambiosSinGuardar = true; },
            itemChangeCallback: () => { this.hayCambiosSinGuardar = true; }
        };
    }

    toggleBloqueoTablero() {
        this.tableroBloqueado = !this.tableroBloqueado;
        if (this.options.draggable && this.options.resizable) {
            this.options.draggable.enabled = !this.tableroBloqueado;
            this.options.resizable.enabled = !this.tableroBloqueado;
            this.options.api?.optionsChanged?.();
        }
        if (this.tableroBloqueado && this.hayCambiosSinGuardar) {
            this.guardarConfiguracionTablero();
        }
    }

    guardarConfiguracionTablero() {
        const usuarioPrueba = this.usuarioId || 'SISTEMA_DEFAULT';
        const widgetsAguardar = this.dashboard.filter(w => w.type !== 'BORRAR_ME');
        this._widgetsService.guardarDisposicion(usuarioPrueba, widgetsAguardar).subscribe({
            next: () => { this.hayCambiosSinGuardar = false; }
        });
    }

    cerrarModalEnfoque() {
        this.widgetEnfoque = null;
        this._torreService.cerrarModoEnfoque();
    }

    inyectarNuevoWidgetAlTablero(widgetCatalogo: any) {
        this.dashboard.push({
            codigo_widget: `WDG_CUSTOM_${new Date().getTime()}`, type: widgetCatalogo.codigo,
            cols: widgetCatalogo.columnas_default || 4, rows: widgetCatalogo.filas_default || 3, x: 0, y: 0, data: null
        });
        if (this.options.api && this.options.api.optionsChanged) this.options.api.optionsChanged();
        if (this.pestanaActiva.includes('MARITIMO')) this.sincronizarTorreMaritima(this.puertoSeleccionado);
        this.hayCambiosSinGuardar = true;
    }

    trackByWidget(index: number, widget: any): string {
        return widget.codigo_widget || widget.type;
    }
}
