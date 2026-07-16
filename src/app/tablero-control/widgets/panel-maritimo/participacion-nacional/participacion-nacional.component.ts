import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

Chart.register(...registerables);

@Component({
    selector: 'app-participacion-nacional',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './participacion-nacional.component.html',
    styleUrl: './participacion-nacional.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ParticipacionNacionalComponent implements AfterViewInit, OnChanges {
    @Input() data: any;
    @Input() widgetId?: string;

    @ViewChild('donutChart') donutChart!: ElementRef;

    public chartInstance: any;
    constructor(
        private _torreService: DashboardService
    ) { }

    ngAfterViewInit() {
        this.renderizarGrafica();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data'] && !changes['data'].firstChange) {
            this.renderizarGrafica();
        }
    }

    renderizarGrafica() {
        if (!this.donutChart) return;

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        // Si no hay data, usamos un mock visual para que no quede en blanco
        const labels = this.data?.labels || ['TCBUEN', 'SPRBUN', 'AGUADULCE', 'COMPAS', 'OTROS'];
        const valores = this.data?.valores || [35, 30, 20, 10, 5];

        this.chartInstance = new Chart(this.donutChart.nativeElement, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    // Paleta de colores idéntica a tu diseño
                    backgroundColor: ['#3b82f6', '#0ea5e9', '#f59e0b', '#ef4444', '#10b981'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '45%', // Mantenemos el grosor que te gustó
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom', // 🔥 Movemos la leyenda abajo
                        labels: {
                            color: '#a0a0a0',
                            usePointStyle: true,
                            pointStyle: 'rect', // 🔥 Cuadrados en lugar de círculos
                            padding: 20, // Espacio para que respiren horizontalmente
                            font: {
                                size: 10,
                                weight: 'bold' // Un poco más de peso para que resalten
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return ` ${context.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }
}
