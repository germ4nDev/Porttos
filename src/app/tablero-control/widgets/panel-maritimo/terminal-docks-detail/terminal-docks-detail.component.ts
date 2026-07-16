import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IWidget } from 'src/app/theme/shared/interfaces/torre-control/widget.interface';

@Component({
    selector: 'app-terminal-docks-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './terminal-docks-detail.component.html',
    styleUrls: ['./terminal-docks-detail.component.scss']
})
export class TerminalDocksDetailComponent implements OnChanges {
    @Input() data: any[] = [];

    // 🚨 ESTA ES LA BANDERA: Si es true, oculta columnas secundarias. Por defecto es true.
    @Input() vistaCompacta: boolean = true;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data']) {
            // Control de cambios si es necesario
        }
    }

    public getDotColor(especialidad: string): string {
        const esp = (especialidad || '').toLowerCase();
        if (esp.includes('contenedor')) return '#007bff'; // Azul
        if (esp.includes('granel')) return '#ffc107';      // Amarillo
        if (esp.includes('líquido')) return '#28a745';     // Verde
        return '#6c757d';                                  // Gris estándar
    }
}

