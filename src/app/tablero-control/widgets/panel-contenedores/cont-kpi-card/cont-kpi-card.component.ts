import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';
import { KpiCardAdapter } from 'src/app/theme/shared/adapters/kpi-card.adapter';
import { KpiCardModel } from 'src/app/theme/shared/_helpers/models/tablero-control/kpi-card.model';
import { FiltroTableroService } from 'src/app/theme/shared/service/tablero-control/filtro-tablero.service';

@Component({
    selector: 'app-cont-kpi-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cont-kpi-card.component.html',
    styleUrl: './cont-kpi-card.component.scss'
})
export class ContKpiCardComponent implements OnInit {
    @Input() data!: KpiCardModel;
    @Input() widgetId!: string;

    public titulo: string = 'KPI';
    public valor: string | number = '0';
    public subtitulo: string = '';
    public color: string = '#22d3ee'; // Color por defecto (Cyan)

    constructor(
        private cdr: ChangeDetectorRef,
        private filtroService: FiltroTableroService,
        private _torreService: DashboardService
    ) { }

    ngOnInit(): void {
        this.filtroService.ciudad$.subscribe((ciudad) => {
            if (ciudad) {
                //this.actualizarDatos(ciudad);
            }
        });
    }

    ngOnChanges(): void {
        if (this.data) {
            this.titulo = this.data.titulo || this.titulo;
            this.valor = this.data.valor || this.valor;
            this.subtitulo = this.data.subtitulo || this.subtitulo;
            this.color = this.data.color || this.color;
        }
    }
}
