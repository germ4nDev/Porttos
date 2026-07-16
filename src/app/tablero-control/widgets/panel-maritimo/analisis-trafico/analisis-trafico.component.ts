import { Component, Input, ViewEncapsulation, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';
import Chart from 'chart.js/auto'; // Asegúrate de tener chart.js instalado

@Component({
    selector: 'app-analisis-trafico',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './analisis-trafico.component.html',
    styleUrl: './analisis-trafico.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AnalisisTraficoComponent implements AfterViewInit, OnChanges {
    @Input() data: any; // Aquí recibimos el JSON que armamos en el backend
    @Input() widgetId?: string;

    @ViewChild('trafficChart') trafficChart!: ElementRef;
    public chartInstance: any;

    constructor(private _torreService: DashboardService) { }

    ngAfterViewInit() {
        this.renderizarGrafica();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data'] && !changes['data'].firstChange) {
            this.renderizarGrafica();
        }
    }

    renderizarGrafica() {
        if (!this.data || !this.data.chartEvolucion || !this.trafficChart) return;

        // Destruir gráfica anterior si existe para evitar superposiciones
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const ctx = this.trafficChart.nativeElement.getContext('2d');

        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: this.data.chartEvolucion,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#a0a0a0', usePointStyle: true, boxWidth: 8 }
                    },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: {
                        stacked: true, // 🔥 Magia para apilar las barras
                        grid: { display: false, color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#a0a0a0' }
                    },
                    y: {
                        stacked: true, // 🔥 Magia para apilar las barras
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: {
                            color: '#a0a0a0',
                            callback: function (value) {
                                // Formatear el eje Y para que diga "1M", "500K", etc.
                                if (Number(value) >= 1000000) return (Number(value) / 1000000) + 'M';
                                if (Number(value) >= 1000) return (Number(value) / 1000) + 'K';
                                return value;
                            }
                        }
                    }
                }
            }
        });
    }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || 'ANALISIS_TRAFICO', this.data);
    }
}
