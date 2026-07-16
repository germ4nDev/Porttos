import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IWidget } from 'src/app/theme/shared/interfaces/torre-control/widget.interface';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';
import { VesselTableModel } from 'src/app/theme/shared/_helpers/models/tablero-control/vessel-table.model';

@Component({
    selector: 'app-vessel-table',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './vessel-table.component.html',
    styleUrls: ['./vessel-table.component.scss']
})
export class VesselTableComponent implements IWidget {
    @Input() title: string = '';
    @Input() config: any = { colspan: 2 };
    @Input() widgetId?: string;

    // 🚨 1. Recibe el modelo directo, sin 'set data' ni lógicas raras.
    @Input() data!: VesselTableModel;

    constructor(private _torreService: DashboardService) { }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }

    @HostBinding('class') get hostClass() {
        return `col-span-${this.config.colspan}`;
    }
}
