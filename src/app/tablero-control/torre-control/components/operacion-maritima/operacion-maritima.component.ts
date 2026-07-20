import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterConfig, GridsterItem, GridType, GridsterComponent, GridsterItemComponent } from 'angular-gridster2';
import { WidgetSelectorComponent } from "../../../widgets/widget-selector/widget-selector.component";
import { MaritimoService } from 'src/app/theme/shared/service/tablero-control/maritimo.service';

@Component({
    selector: 'app-operacion-maritima',
    standalone: true,
    imports: [CommonModule, GridsterComponent, GridsterItemComponent, WidgetSelectorComponent],
    templateUrl: './operacion-maritima.component.html',
    styleUrls: ['./operacion-maritima.component.scss']
})
export class OperacionMaritimaComponent implements OnChanges {
    @Input() layoutBase: any[] = [];
    @Input() puerto: string = '';
    @Input() bloqueado: boolean = true;
    @Output() layoutCambiado = new EventEmitter<any[]>();

    public dashboard: Array<GridsterItem & { type: string, data: any }> = [];
    public options: GridsterConfig;
    public cargando = false;

    constructor(private _maritimoService: MaritimoService, private cdr: ChangeDetectorRef) {
        this.options = this.generarConfiguracionGridster();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['bloqueado'] && this.options.api) {
            this.options.draggable!.enabled = !this.bloqueado;
            this.options.resizable!.enabled = !this.bloqueado;
            this.options.api.optionsChanged!();
        }

        if (changes['layoutBase'] || changes['puerto']) {
            this.procesarLayoutMaritimo();
        }
    }

    procesarLayoutMaritimo() {
        this.cargando = true;

        let layoutLimpio = this.layoutBase.filter((w: any) =>
            !['TERMINAL_INDIVIDUAL', 'WDG_FANTASMA'].includes(w.type)
        );

        const esqueletos = Array.from({ length: 6 }).map((_, index) => ({
            codigo_widget: 'WDG_TERM_DINAMICO_' + index, type: 'WDG_TERMINAL_INDIVIDUAL',
            cols: 4, rows: 2, x: (index % 3) * 4, y: index < 3 ? 1 : 3, data: null
        }));

        this.dashboard = [...layoutLimpio, ...esqueletos];

        this._maritimoService.obtenerResumenOperativo(this.puerto).subscribe({
            next: (res: any) => {
                if (res?.success && res?.data) {
                    this.dashboard = [...this._hidratarWidgetsConDatos(layoutLimpio, res.data)];
                    this.cargando = false;
                    this.cdr.detectChanges();
                }
            },
            error: (err) => {
                console.error("❌ Error API Marítimo:", err);
                this.cargando = false;
                this.cdr.detectChanges();
            }
        });
    }

    private _hidratarWidgetsConDatos(layoutOriginal: any[], dataReal: any): any[] {
        // ... (Aquí pegas la lógica de tu función original de hidratación)
        return [];
    }

    generarConfiguracionGridster(): GridsterConfig {
        return {
            gridType: GridType.ScrollVertical,
            margin: 16,
            defaultItemCols: 4,
            defaultItemRows: 3,
            draggable: { enabled: !this.bloqueado },
            resizable: { enabled: !this.bloqueado },
            itemChangeCallback: () => {
                this.layoutCambiado.emit(this.dashboard);
            }
        };
    }

    trackByWidget(index: number, widget: any): string {
        return widget.codigo_widget || widget.type;
    }
}
