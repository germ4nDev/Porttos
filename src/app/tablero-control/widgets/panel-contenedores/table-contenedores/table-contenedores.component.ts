import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-table-contenedores',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './table-contenedores.component.html',
    styleUrls: ['./table-contenedores.component.scss']
})
export class TableContenedoresComponent implements OnChanges {
    @Input() widgetId!: string;
    @Input() data: any; // El orquestador inyecta un 'any'

    public movimientos: any[] = []; // Inicializado como array seguro

    constructor(private _torreService: DashboardService) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.data) {
            // 1. Verificamos si la data es directamente un array
            if (Array.isArray(this.data)) {
                this.movimientos = this.data;
            }
            // 2. O si por alguna razón el backend lo envolvió en un objeto { movimientos: [...] }
            else if (this.data.movimientos && Array.isArray(this.data.movimientos)) {
                this.movimientos = this.data.movimientos;
            }
            // 3. Si llega un objeto vacío {} temporalmente, lo dejamos vacío para proteger el ngFor
            else {
                this.movimientos = [];
            }
        }
    }

    getEstadoClase(estado: string): string {
        if (!estado) return 'badge-default';

        const est = estado.toLowerCase();

        // Verde: Operaciones en orden
        if (est.includes('programado')) {
            return 'badge-success';
        }
        // Rojo: Problemas o alertas
        else if (est.includes('demora') || est.includes('lleno')) {
            return 'badge-danger';
        }
        // Azul: Tránsitos y esperas
        else if (est.includes('ruta') || est.includes('esperando')) {
            return 'badge-info';
        }

        return 'badge-default';
    }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }
}
