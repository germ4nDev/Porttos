import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-implicaciones-operativas',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './implicaciones-operativas.component.html',
    styleUrl: './implicaciones-operativas.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ImplicacionesOperativasComponent {
    @Input() data: any;
    @Input() widgetId?: string;
    @Input() config?: any;

    constructor(private _torreService: DashboardService) { }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }
}
