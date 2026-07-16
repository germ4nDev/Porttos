import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WIDGET_MAP } from './../../../tablero-control/torre-control/widget-registry';

@Component({
    selector: 'app-widget-selector',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './widget-selector.component.html'
})
export class WidgetSelectorComponent implements OnInit {
    @Input() type: string = '';
    @Input() data: any = null;

    // AÑADE ESTA VARIABLE PARA GUARDAR EL ESTADO
    public componenteVisual: any = null;

    ngOnInit() {
        console.log('🏗️ Selector intentando pintar:', this.type);

        // Asigna el valor a la variable, no al getter
        this.componenteVisual = WIDGET_MAP[this.type].componente;

        if (!this.componenteVisual) {
            console.error(`❌ ERROR: No encontré componente para el tipo: "${this.type}"`);
        }
    }
}
