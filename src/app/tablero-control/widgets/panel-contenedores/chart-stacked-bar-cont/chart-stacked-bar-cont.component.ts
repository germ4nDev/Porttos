import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-chart-stacked-bar-cont', // 👈 Selector corregido para evitar conflictos
    standalone: true,
    imports: [CommonModule, NgChartsModule],
    templateUrl: './chart-stacked-bar-cont.component.html',
    styleUrls: ['./chart-stacked-bar-cont.component.scss']
})
export class ChartStackedBarContComponent implements OnInit {
    @Input() title: string = '';
    @Input() widgetId?: string;

    private _data: any;
    public cargando: boolean = true;

    @Input() set data(value: any) {
        this._data = value;

        if (value) {
            this.cargando = false; // Apagamos el loader

            if (value.series && value.categorias) {
                // Colores por defecto (Azul, Cyan, Amarillo, Rojo) si el backend no los manda
                const colors = value.colores || ['#3b82f6', '#22d3ee', '#f59e0b', '#ef4444'];

                // Mapeamos la data al formato de Chart.js
                this.barChartData = {
                    labels: value.categorias,
                    datasets: value.series.map((serie: any, index: number) => ({
                        label: serie.name || `Serie ${index + 1}`,
                        data: serie.data,
                        backgroundColor: colors[index % colors.length],
                        stack: 'Stack 0', // Crucial para apilar las barras
                        borderRadius: 2
                    }))
                };
            } else {
                // Fallback (Mock) si la API no manda la data completa
                console.warn('⚠️ Faltan series/categorias en Contenedores, usando Mock.');
                this.barChartData = {
                    labels: ['Patio A', 'Patio B', 'Patio C'],
                    datasets: [
                        { label: 'Por devolver', data: [40, 30, 20], backgroundColor: '#3b82f6', stack: 'Stack 0', borderRadius: 2 },
                        { label: 'Capacidad', data: [60, 70, 80], backgroundColor: '#22d3ee', stack: 'Stack 0', borderRadius: 2 }
                    ]
                };
            }
        }
    }

    get data(): any { return this._data; }

    constructor(private _torreService: DashboardService) { }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }

    // Configuración de Chart.js para barras apiladas
    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        // 💡 TIP: Si quieres que las barras sean HORIZONTALES en vez de verticales,
        // descomenta la siguiente línea:
        // indexAxis: 'y',
        scales: {
            x: {
                stacked: true,
                ticks: { color: '#94a3b8' },
                grid: { display: false },
                border: { display: false }
            },
            y: {
                stacked: true,
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
