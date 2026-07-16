import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

Chart.register(...registerables);

@Component({
    selector: 'app-tipo-operacion',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './tipo-operacion.component.html',
    styleUrl: './tipo-operacion.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class TipoOperacionComponent implements AfterViewInit, OnChanges {
    @Input() data: any;
    @ViewChild('opsChart') opsChart!: ElementRef;
    @Input() widgetId?: string;

    public chartInstance: any;

    constructor(private _torreService: DashboardService) { }

    ngAfterViewInit() { this.renderizar(); }

    ngOnChanges(changes: SimpleChanges) { if (changes['data'] && !changes['data'].firstChange) this.renderizar(); }

    renderizar() {
        if (!this.opsChart) return;
        if (this.chartInstance) this.chartInstance.destroy();

        const labels = this.data?.labels || ['Importación', 'Exportación', 'Transbordo', 'Cabotaje'];
        const valores = this.data?.valores || [45, 30, 15, 10];

        this.chartInstance = new Chart(this.opsChart.nativeElement, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: ['#06b6d4', '#3b82f6', '#8b5cf6', '#a78bfa'], // Tonos Cyan, Azul, Púrpura
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '45%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#a0a0a0', usePointStyle: true, pointStyle: 'rect', padding: 20, font: { size: 10 } }
                    }
                }
            }
        });
    }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }
}

