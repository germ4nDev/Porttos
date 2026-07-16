import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';
import { KpiCardAdapter } from 'src/app/theme/shared/adapters/kpi-card.adapter';
import { KpiCardModel } from 'src/app/theme/shared/_helpers/models/tablero-control/kpi-card.model';
import { FiltroTableroService } from 'src/app/theme/shared/service/tablero-control/filtro-tablero.service';

@Component({
    selector: 'app-kpi-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './kpi-card.component.html',
    styleUrls: ['./kpi-card.component.scss']
})
export class KpiCardComponent implements OnInit {
    @Input() data!: KpiCardModel;
    @Input() widgetId?: string;

    // Bandera para evitar que la tarjeta desaparezca si la carga falla
    public isLoading: boolean = false;

    constructor(
        private cdr: ChangeDetectorRef,
        private filtroService: FiltroTableroService,
        private _torreService: DashboardService
    ) { }

    ngOnInit(): void {
        this.filtroService.ciudad$.subscribe((ciudad) => {
            if (ciudad) {
                this.actualizarDatos(ciudad);
            }
        });
    }

    private actualizarDatos(ciudad: string): void {
        this.isLoading = true;
    }
}
