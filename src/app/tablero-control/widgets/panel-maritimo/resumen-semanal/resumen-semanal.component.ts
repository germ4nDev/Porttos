import { Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IWidget } from 'src/app/theme/shared/interfaces/torre-control/widget.interface';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
    selector: 'app-resumen-semanal',
    standalone: true,
    imports: [CommonModule, NgChartsModule],
    templateUrl: './resumen-semanal.component.html',
    styleUrl: './resumen-semanal.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ResumenSemanalComponent implements IWidget {
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    @Input() data: any;
    @Input() title: string = '';
    @Input() widgetId?: string;
    public mostrarTabla: boolean = true;

    public pestana: 'lista' | 'grafica' = 'lista';
    public listaArribos: any[] = [];
    // ... dentro de la clase
    public barChartOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false };
    public barChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };

    ngOnChanges() {
        if (this.data && this.data.arribos) {
            this.listaArribos = this.data.arribos || this.data.listado || [];
            console.log('Widget cargado con:', this.listaArribos.length, 'ítems');
            // Transformar la data del backend al formato de Chart.js
            this.barChartData = {
                labels: this.data.labels, // Los días que calculamos en el backend
                datasets: [{
                    data: this.data.datasets[0].data,
                    label: 'Arribos',
                    backgroundColor: '#3b82f6'
                }]
            };
        }
    }

    constructor(private _torreService: DashboardService) { }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }

    public toggleVista(): void {
        this.mostrarTabla = !this.mostrarTabla;
        console.log('mostrar grafica', this.mostrarTabla);
        if (!this.mostrarTabla) {
            setTimeout(() => {
                if (this.chart) {
                    this.chart.update(); // Obliga a Chart.js a repintar
                }
            }, 100);
        }
    }
}
