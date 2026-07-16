/*
    Author: German Valencia
    Component: TerminalCardComponent
    Pattern: QPLUS Standalone Widget - Centralized Theme Inheritance
*/
import { Component, Input, OnInit } from '@angular/core'; // Importamos OnInit
import { CommonModule } from '@angular/common';
import { IWidget } from 'src/app/theme/shared/interfaces/torre-control/widget.interface';

@Component({
    selector: 'app-terminal-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './terminal-card.component.html',
    styleUrls: ['./terminal-card.component.scss']
})
export class TerminalCardComponent implements IWidget, OnInit {
    @Input() data: any;
    @Input() title: string = '';

    ngOnInit(): void {
        // En ngOnInit la data de la factoría ya fue inyectada y mapeada correctamente
        console.log('Data del terminal inicializada:', this.data);
    }
}
