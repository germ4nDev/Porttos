/*
    Author: German Valencia
    Pattern: PORTTOS Generic Widget - KPI Card (Standalone)
*/
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-gate-kpi-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './gate-kpi-card.component.html',
    styleUrls: ['./gate-kpi-card.component.scss']
})
export class GateKpiCardComponent implements OnChanges {

    // 👈 Requerido por el orquestador para no lanzar el error NG0303
    @Input() widgetId!: string;

    // 👈 Data inyectada dinámicamente desde el backend
    @Input() data: any;

    // Valores por defecto para que la tarjeta no se vea vacía mientras carga
    public titulo: string = 'KPI';
    public valor: string | number = '0';
    public subtitulo: string = 'Cargando...';
    public color: string = '#22d3ee'; // Color Cyan por defecto para el borde/texto

    ngOnChanges(changes: SimpleChanges): void {
        // Cuando el orquestador inyecta la data, actualizamos las variables
        if (this.data) {
            this.titulo = this.data.titulo || this.titulo;
            this.valor = this.data.valor || this.valor;
            this.subtitulo = this.data.subtitulo || this.subtitulo;

            // Si el backend envía un color específico (ej. para pintar el borde rojo si es crítico)
            if (this.data.color) {
                this.color = this.data.color;
            }
        }
    }
}
