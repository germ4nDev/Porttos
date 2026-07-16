import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { IWidget } from 'src/app/theme/shared/interfaces/torre-control/widget.interface';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-eta-chart',
    standalone: true,
    imports: [CommonModule, NgChartsModule],
    templateUrl: './eta-chart.component.html',
    styleUrls: ['./eta-chart.component.scss']
})
export class EtaChartComponent implements IWidget, OnInit {
    @Input() title: string = '';
    @Input() widgetId?: string;

    // 1. Variable privada para almacenar el valor internamente
    private _data: any;
    public cargando: boolean = true;

    // 2. EL AJUSTE CLAVE: El 'set' intercepta cuando el Padre (Torre de Control)
    // le inyecta la data al componente. Sin esto, si la data llega tarde,
    // el gráfico se queda vacío.
    @Input() set data(value: any) {
        this._data = value;
        if (value && value.labels) {
            this.cargando = false;
            // Cuando llega la data, actualizamos barChartData inmediatamente
            this.barChartData = {
                labels: value.labels,
                datasets: value.datasets
            };
        }
    }

    // Getter necesario para completar el patrón
    get data(): any { return this._data; }

    constructor(private _torreService: DashboardService) { }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }

    // Configuración visual (El look & feel)
    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#94a3b8',
                    stepSize: 0.5,
                    callback: (value) => value + 'h'
                },
                grid: { color: 'rgba(255,255,255,0.05)' },
                border: { display: false }
            },
            x: {
                ticks: { color: '#94a3b8' },
                grid: { display: false },
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

    ngOnInit() {
        // El ngOnInit es para inicializaciones iniciales,
        // pero la reactividad real ocurre en el 'set data' de arriba.
    }
}
