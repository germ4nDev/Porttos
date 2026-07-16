import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IWidget } from 'src/app/theme/shared/interfaces/torre-control/widget.interface';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-resumen-maritimo',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './resumen-maritimo.component.html',
    styleUrl: './resumen-maritimo.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ResumenMaritimoComponent implements IWidget {
    // Recibe los 4 bloques desde el switch del Cerebro
    @Input() data: any;
    @Input() title: string = '';
    @Input() widgetId?: string;

    constructor(private _torreService: DashboardService) { }

    maximizar() {
        if (this.widgetId) {
            this._torreService.abrirModoEnfoque(this.widgetId, this.data);
        }
    }
}
