import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IWidget } from 'src/app/theme/shared/interfaces/torre-control/widget.interface';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-reportes-operativos',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './reportes-operativos.component.html',
    styleUrl: './reportes-operativos.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ReportesOperativosComponent implements IWidget {
    @Input() data: any;
    @Input() title: string = '';
    @Input() widgetId?: string;
    constructor(private _torreService: DashboardService) { }

    maximizar() {
        // Le pasas tu ID y tu Data al servicio
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }
}
