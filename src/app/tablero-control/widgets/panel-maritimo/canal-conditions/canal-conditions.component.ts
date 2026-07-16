import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IWidget } from 'src/app/theme/shared/interfaces/torre-control/widget.interface';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';
import { CanalModel } from 'src/app/theme/shared/_helpers/models/tablero-control/canal.model';

@Component({
    selector: 'app-canal-conditions',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './canal-conditions.component.html',
    styleUrls: ['./canal-conditions.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CanalConditionsComponent implements IWidget {
    @Input() data!: CanalModel;
    @Input() title: string = '';
    @Input() widgetId?: string;

    constructor(private _torreService: DashboardService) { }

    maximizar() {
        // Le pasas tu ID y tu Data al servicio
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }
}
