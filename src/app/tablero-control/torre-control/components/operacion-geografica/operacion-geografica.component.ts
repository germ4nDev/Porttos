import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterConfig, GridsterItem, GridType, GridsterComponent, GridsterItemComponent } from 'angular-gridster2';
import { WidgetSelectorComponent } from "../../../widgets/widget-selector/widget-selector.component";

@Component({
    selector: 'app-operacion-geografica',
    standalone: true,
    imports: [CommonModule, GridsterComponent, GridsterItemComponent, WidgetSelectorComponent],
    templateUrl: './operacion-geografica.component.html',
    styleUrls: ['./operacion-geografica.component.scss']
})
export class OperacionGeograficaComponent implements OnChanges {
    @Input() layoutBase: any[] = [];
    @Input() puerto: string = '';
    @Input() bloqueado: boolean = true;
    @Output() layoutCambiado = new EventEmitter<any[]>();

    public dashboard: Array<GridsterItem & { type: string, data: any }> = [];
    public options: GridsterConfig;
    public cargando = false;

    constructor(private cdr: ChangeDetectorRef) {
        this.options = this.generarConfiguracionGridster();
    }

    ngOnChanges(changes: SimpleChanges) {
        // 1. Reaccionar a cambios de bloqueo desde el orquestador
        if (changes['bloqueado'] && this.options.api) {
            this.options.draggable!.enabled = !this.bloqueado;
            this.options.resizable!.enabled = !this.bloqueado;
            this.options.api.optionsChanged!();
        }

        // 2. Procesar el layout si cambian los datos base o el puerto
        if (changes['layoutBase'] || changes['puerto']) {
            this.procesarLayoutGeografico();
        }
    }

    procesarLayoutGeografico() {
        this.cargando = true;
        this.cdr.detectChanges();

        // Limpieza básica: Removemos widgets temporales o basura que no deben persistir
        let layoutLimpio = this.layoutBase.filter((w: any) =>
            !['WDG_FANTASMA', 'BORRAR_ME', 'TERMINAL_INDIVIDUAL'].includes(w.type)
        );

        // Si el layout viene completamente vacío, inyectamos el mapa por defecto
        if (layoutLimpio.length === 0) {
            layoutLimpio.push({
                codigo_widget: `WDG_MAPA_LOGISTICO_${new Date().getTime()}`,
                type: 'WDG_MAPA_LOGISTICO',
                cols: 12,
                rows: 6,
                x: 0,
                y: 0,
                data: null
            });
        }

        // Renderizamos con un ligero retraso para dar tiempo al DOM y WebGL
        setTimeout(() => {
            this.dashboard = [...layoutLimpio].map(item => ({ ...item }));
            this.cargando = false;

            if (this.options.api && this.options.api.optionsChanged) {
                this.options.api.optionsChanged();
            }
            this.cdr.detectChanges();
        }, 100);
    }

    generarConfiguracionGridster(): GridsterConfig {
        return {
            gridType: GridType.ScrollVertical,
            margin: 16,
            outerMargin: false,
            minCols: 12,
            maxCols: 12,
            minRows: 1,
            maxRows: 100,
            fixedRowHeight: 160,
            pushItems: false,
            swap: true,
            compactType: 'compactUp',
            defaultItemCols: 4,
            defaultItemRows: 3,
            displayGrid: 'onDrag&Resize',
            draggable: { enabled: !this.bloqueado },
            resizable: { enabled: !this.bloqueado },
            mobileBreakpoint: 960,
            keepFixedHeightInMobile: true,
            itemChangeCallback: () => {
                this.layoutCambiado.emit(this.dashboard);
            }
        };
    }

    trackByWidget(index: number, widget: any): string {
        return widget.codigo_widget || widget.type;
    }
}
