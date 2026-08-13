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

    public componenteVisual: any = null;

    ngOnInit() {
        console.log('🏗️ Selector intentando pintar:', this.type);

        const registro = WIDGET_MAP[this.type];

        if (registro && registro.componente) {
            this.componenteVisual = registro.componente;
        } else {
            console.error(`❌ ERROR CRÍTICO: El widget "${this.type}" NO está registrado en WIDGET_MAP.`);
            this.componenteVisual = null;
        }
    }
}
