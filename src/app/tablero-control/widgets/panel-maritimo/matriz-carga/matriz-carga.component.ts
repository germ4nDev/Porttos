import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-matriz-carga',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './matriz-carga.component.html',
    styleUrl: './matriz-carga.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class MatrizCargaComponent {
    @Input() data: any;
    @Input() widgetId?: string;
    @Input() config?: any;

    constructor(
        private _torreService: DashboardService
    ) { }

    formatNum(val: number): string {
        if (!val || val === 0) return '—';
        return val.toLocaleString('es-CO');
    }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }
}
