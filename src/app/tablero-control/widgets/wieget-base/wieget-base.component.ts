import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IWidget } from 'src/app/theme/shared/interfaces/torre-control/widget.interface';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-wieget-base',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './wieget-base.component.html',
    styleUrl: './wieget-base.component.scss'
})
export class WiegetBaseComponent {
    // 1. Inputs estándar para que la arquitectura inyecte la información
    @Input() data: any;
    @Input() title: string = '';
    @Input() subtitle: string = '';
    @Input() widgetId: string = ''; // Recibe el tipo para el modo enfoque

    constructor(private _torreService: DashboardService) { }

    ngOnInit(): void {
        // Inicializa aquí lógica si tu widget requiere preparar data antes de renderizar
    }

    /**
     * Dispara el modo enfoque (Drill-down)
     * Recicla este mismo componente en un panel gigante
     */
    maximizar(): void {
        this._torreService.abrirModoEnfoque(this.widgetId, this.data);
    }
}
