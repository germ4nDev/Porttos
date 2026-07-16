import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

Chart.register(...registerables);

@Component({
    selector: 'app-historico-anual',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './historico-anual.component.html',
    styleUrl: './historico-anual.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class HistoricoAnualComponent implements AfterViewInit, OnChanges {
    @Input() data: any;
    @Input() widgetId?: string;
    @Input() config?: any;
    @ViewChild('lineChart') lineChart!: ElementRef;
    chartInstance: any;
    constructor(private _torreService: DashboardService) { }

    ngAfterViewInit() { this.renderizar(); }
    ngOnChanges(c: SimpleChanges) { if (c['data'] && !c['data'].firstChange) this.renderizar(); }

    renderizar() {
        if (!this.lineChart) return;
        if (this.chartInstance) this.chartInstance.destroy();

        const ctx = this.lineChart.nativeElement.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.5)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

        const labels = this.data?.labels || ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
        const valores = this.data?.valores || [25.5, 20.8, 17.4, 18.0, 19.8, 19.0, 20.7, 23.1];

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    borderColor: '#06b6d4',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: '#06b6d4',
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v) => v + 'Mt' } }
                }
            }
        });
    }

    maximizar() {
        // Le pasas tu ID y tu Data al servicio
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }
}
