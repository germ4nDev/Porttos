import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { IWidget } from 'src/app/theme/shared/interfaces/torre-control/widget.interface';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-toneladas-chart',
    standalone: true,
    imports: [CommonModule, NgChartsModule],
    templateUrl: './toneladas-chart.component.html',
    styleUrls: ['./toneladas-chart.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ToneladasChartComponent implements IWidget, OnChanges { // 👈 Cambiamos OnInit por OnChanges
    @Input() data: any;
    @Input() title: string = '';
    @Input() widgetId?: string;

    constructor(private _torreService: DashboardService) { }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }

    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { stacked: true, ticks: { color: '#94a3b8' }, grid: { display: false }, border: { display: false } },
            y: {
                stacked: true,
                ticks: { color: '#94a3b8', callback: function (value) { return value.toLocaleString('en-US'); } },
                grid: { color: 'rgba(255,255,255,0.05)' },
                border: { display: false }
            }
        },
        plugins: {
            legend: { position: 'top', labels: { color: '#94a3b8', font: { size: 10 }, usePointStyle: true, pointStyle: 'circle' } }
        }
    };

    public barChartData!: ChartData<'bar'>;

    // 🔥 EL DETECTOR DE CAMBIOS
    ngOnChanges(changes: SimpleChanges) {
        // Verificamos si 'data' cambió y si trae un valor real
        if (changes['data'] && changes['data'].currentValue) {
            const newData = changes['data'].currentValue;

            if (newData.labels && newData.datasets) {
                // Asignamos la data forzando una nueva referencia para que Chart.js reaccione
                this.barChartData = {
                    labels: [...newData.labels],
                    datasets: [...newData.datasets]
                };
            }
        }
    }
}
