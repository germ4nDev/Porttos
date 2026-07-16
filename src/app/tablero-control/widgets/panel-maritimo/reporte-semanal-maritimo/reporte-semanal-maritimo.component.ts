import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core'; // 🔥 Añadimos OnInit
import { CommonModule } from '@angular/common';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-reporte-semanal-maritimo',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './reporte-semanal-maritimo.component.html',
    styleUrl: './reporte-semanal-maritimo.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ReporteSemanalMaritimoComponent implements OnChanges { // 🔥 Implementamos OnInit
    @Input() data!: any;
    @Input() title: string = '';
    @Input() widgetId?: string;

    metricas: any[] = [];

    constructor(private _torreService: DashboardService) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data'] && changes['data'].currentValue) {
            // Cada vez que llega data nueva del padre, actualizamos
            this.metricas = changes['data'].currentValue.metricas || [];
        }
    }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }
}
