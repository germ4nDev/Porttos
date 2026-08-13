import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-chart-stacked-bar',
    standalone: true,
    imports: [CommonModule, NgChartsModule],
    templateUrl: './chart-stacked-bar.component.html',
    styleUrls: ['./chart-stacked-bar.component.scss']
})
export class ChartStackedBarComponent implements OnInit {
    @Input() title: string = '';
    @Input() widgetId?: string;

    private _data: any;
    public cargando: boolean = true;

    @Input() set data(value: any) {
        this._data = value;

        // Verificamos si la data general (el objeto resumen) ya llegó desde la API
        if (value && value.resumen) {
            this.cargando = false; // ¡Apagamos el loader de inmediato!

            const citasData = value.resumen.citasPorHora;
            const colors = ['#0ea5e9', '#8b5cf6', '#14b8a6']; // Azul, Morado, Verde

            if (citasData && citasData.series && citasData.categorias) {
                // PLAN A: El backend mandó la data correctamente
                this.barChartData = {
                    labels: citasData.categorias,
                    datasets: citasData.series.map((serie: any, index: number) => ({
                        label: serie.name,
                        data: serie.data,
                        backgroundColor: colors[index],
                        stack: 'Stack 0', // Apila las barras en la misma columna
                        borderRadius: 2
                    }))
                };
            } else {
                // PLAN B (Fallback): La API respondió, pero olvidamos meter 'citasPorHora' en Node.js
                console.warn('⚠️ Falta el nodo citasPorHora en Node.js, usando Mock de proyecciones.');

                const mockCategorias = ['18h', '19h', '20h', '21h', '22h', '23h', '0h', '1h', '2h', '3h', '4h', '5h'];
                const mockSeries = [
                    { name: 'SPRBUN', data: [25, 45, 60, 80, 55, 40, 45, 65, 55, 45, 30, 25] },
                    { name: 'TCBUEN', data: [15, 30, 40, 50, 45, 30, 30, 35, 35, 25, 20, 15] },
                    { name: 'Aguadulce', data: [15, 20, 35, 45, 30, 20, 25, 25, 20, 15, 10, 10] }
                ];

                this.barChartData = {
                    labels: mockCategorias,
                    datasets: mockSeries.map((serie: any, index: number) => ({
                        label: serie.name,
                        data: serie.data,
                        backgroundColor: colors[index],
                        stack: 'Stack 0',
                        borderRadius: 2
                    }))
                };
            }
        }
    }

    get data(): any { return this._data; }

    constructor(private _torreService: DashboardService) { }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }

    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true, // Habilitar apilamiento en X
                ticks: { color: '#94a3b8' },
                grid: { display: false },
                border: { display: false }
            },
            y: {
                stacked: true, // Habilitar apilamiento en Y
                beginAtZero: true,
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(255,255,255,0.05)' },
                border: { display: false }
            }
        },
        plugins: {
            legend: {
                position: 'top',
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

    public barChartData!: ChartData<'bar'>;

    ngOnInit() { }
}
