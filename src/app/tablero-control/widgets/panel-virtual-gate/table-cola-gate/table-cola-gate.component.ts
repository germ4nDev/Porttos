import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-table-cola-gate',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './table-cola-gate.component.html',
    styleUrls: ['./table-cola-gate.component.scss']
})
export class TableColaGateComponent {
    @Input() widgetId!: string;
    @Input() data: any;

    constructor(private _torreService: DashboardService) {
    }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }
}
