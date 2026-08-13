import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-chart-doughnut',
    standalone: true,
    imports: [CommonModule, NgChartsModule],
    templateUrl: './chart-doughnut.component.html',
    styleUrls: ['./chart-doughnut.component.scss']
})
export class ChartDoughnutComponent implements OnInit {
    @Input() title: string = '';
    @Input() widgetId?: string;

    private _data: any;
    public cargando: boolean = true;

    @Input() set data(value: any) {
        this._data = value;

        // Verificamos si la data general ya llegó
        if (value && value.resumen) {
            this.cargando = false; // Apagamos el loader apenas responda la API

            // Intentamos leer la data real del backend
            const distData = value.resumen.distribucionCamiones;

            if (distData && distData.series && distData.labels) {
                // PLAN A: El backend mandó la data correctamente
                this.doughnutChartData = {
                    labels: distData.labels,
                    datasets: [{
                        data: distData.series,
                        backgroundColor: ['#0ea5e9', '#8b5cf6', '#14b8a6', '#f59e0b', '#64748b'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                };
            } else {
                // PLAN B (Fallback): La API respondió, pero olvidamos meter 'distribucionCamiones' en Node.js
                console.warn('⚠️ Falta el nodo distribucionCamiones en Node.js, usando Mock.');
                this.doughnutChartData = {
                    labels: ['Pre-gate A', 'Pre-gate B', 'Pre-gate C', 'Vía alterna', 'En tránsito'],
                    datasets: [{
                        data: [35, 20, 15, 10, 20], // Data simulada
                        backgroundColor: ['#0ea5e9', '#8b5cf6', '#14b8a6', '#f59e0b', '#64748b'],
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

    public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%', // Grosor de la dona
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
