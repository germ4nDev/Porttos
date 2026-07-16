import { Component, Input, ViewEncapsulation } from '@angular/core';
import { IWidget } from '../../../theme/shared/interfaces/torre-control/widget.interface';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-table-widget',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './table-widget.component.html',
    styleUrl: './table-widget.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class TableWidgetComponent implements IWidget {
    @Input() data: any; // { columnas: ['Nombre', 'ETA'], filas: [{Nombre: 'Motonave A', ETA: '12:00'}] }
    @Input() title: string = '';
}
