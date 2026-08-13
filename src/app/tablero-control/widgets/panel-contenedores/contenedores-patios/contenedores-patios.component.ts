import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-contenedores-patios',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './contenedores-patios.component.html',
    styleUrls: ['./contenedores-patios.component.scss']
})
export class ContenedoresPatiosComponent implements OnChanges {
    @Input() widgetId!: string;
    @Input() data: any; // Modificado de any[] a any para recibir lo del orquestador

    public listadoPatios: any[] = []; // Nueva variable segura para el HTML

    constructor(private _torreService: DashboardService) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.data) {
            if (Array.isArray(this.data)) {
                this.listadoPatios = this.data;
            } else if (this.data.saturacionPatios && Array.isArray(this.data.saturacionPatios)) {
                this.listadoPatios = this.data.saturacionPatios;
            } else {
                this.listadoPatios = [];
            }
        }
    }

    getColorBarra(porcentaje: number): string {
        if (porcentaje >= 90) return '#ef4444';
        if (porcentaje >= 75) return '#f59e0b';
        return '#22c55e';
    }

    getEstadoBadge(estado: string): string {
        switch (estado) {
            case 'CRÍTICO': return 'badge-danger bg-danger text-white';
            case 'ALTO': return 'badge-warning bg-warning text-dark';
            default: return 'badge-success bg-success text-white';
        }
    }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }
}
