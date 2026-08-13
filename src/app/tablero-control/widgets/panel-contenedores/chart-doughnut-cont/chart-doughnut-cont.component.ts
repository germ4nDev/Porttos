import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-chart-doughnut-cont',
    standalone: true,
    imports: [CommonModule, NgChartsModule],
    templateUrl: './chart-doughnut-cont.component.html',
    styleUrls: ['./chart-doughnut-cont.component.scss']
})
export class ChartDoughnutContComponent implements OnInit {
    @Input() title: string = '';
    @Input() widgetId?: string;

    private _data: any;
    public cargando: boolean = true;

    // Usamos el Setter (igual que en Virtual Gate) en lugar de ngOnChanges
    @Input() set data(value: any) {
        this._data = value;

        if (value) {
            this.cargando = false;

            // Validamos que lleguen los datos requeridos
            if (value.series && value.labels) {
                this.doughnutChartData = {
                    labels: value.labels,
                    datasets: [{
                        data: value.series,
                        // Usa los colores que vienen del backend o los predeterminados de contenedores
                        backgroundColor: value.colores || ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                };
            } else {
                // Fallback (Mock) si la API no manda la data completa
                console.warn('⚠️ Faltan series/labels en Contenedores, usando Mock.');
                this.doughnutChartData = {
                    labels: ['En Free Time', 'En Riesgo', 'Vencidos'],
                    datasets: [{
                        data: [60, 25, 15],
                        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                };
            }
        }
    }

    get data(): any { return this._data; }

    constructor(private _torreService: DashboardService) { }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }

    // Opciones de configuración de Chart.js calcadas de Virtual Gate
    public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#94a3b8',
                    font: { size: 11 },
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 8
                }
            }
        }
    };

    public doughnutChartData!: ChartData<'doughnut'>;

    ngOnInit() { }
}
