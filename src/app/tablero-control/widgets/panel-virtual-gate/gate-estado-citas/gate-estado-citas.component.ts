import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-gate-estado-citas',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './gate-estado-citas.component.html',
    styleUrls: ['./gate-estado-citas.component.scss']
})
export class GateEstadoCitasComponent {
    @Input() widgetId!: string;
    @Input() data: any;

    constructor(private _torreService: DashboardService) { }

    maximizar() {
        // Le pasas tu ID y tu Data al servicio
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }
}
