import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';
import { IWidget } from 'src/app/theme/shared/interfaces/torre-control/widget.interface';

@Component({
    selector: 'app-gate-alertas',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './gate-alertas.component.html',
    styleUrls: ['./gate-alertas.component.scss']
})
export class GateAlertasComponent implements IWidget {
    @Input() widgetId!: string;
    @Input() title: string = '';
    @Input() data: any;

    constructor(private _torreService: DashboardService) { }

    maximizar() {
        // Le pasas tu ID y tu Data al servicio
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }
}
