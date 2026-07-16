// import { Component, Input, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IWidget } from 'src/app/theme/shared/interfaces/torre-control/widget.interface';
// import { TerminalDocksDetailComponent } from "../terminal-docks-detail/terminal-docks-detail.component";
// import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

// export interface MetricaPie {
//     label: string;
//     valor: string | number;
// }

// export interface TerminalSLA {
//     nombre: string;
//     subtitulo: string;
//     muelles: string[]; // Ej: ['TC-1', 'TC-2']
//     estado_operativo: string; // Ej: 'OPERATIVO' o 'RIESGO'
//     badge_class: string; // Ej: 'status-badge' o 'badge-danger'
//     metricas_pie: MetricaPie[];
//     observacion_ia?: string;
// }

// @Component({
//     selector: 'app-terminal-summary-card',
//     standalone: true,
//     imports: [CommonModule, TerminalDocksDetailComponent],
//     templateUrl: './terminal-summary-card.component.html',
//     styleUrls: ['./terminal-summary-card.component.scss']
// })
// export class TerminalSummaryCardComponent implements IWidget, OnInit {
//     @Input() data: any;
//     @Input() title: string = '';
//     @Input() widgetId?: string;
//     @Input() terminalId!: string;
//     public mostrarTabla: boolean = false;
//     public cargandoIA: boolean = true;
//     public dataTerminal!: TerminalSLA;
//     public estadoError: boolean = false;

//     constructor(private _torreService: DashboardService) { }

//     ngOnInit(): void {
//         this.ejecutarAnalisisIA();
//     }

//     // 3. LA LÓGICA DE CONEXIÓN
//     ejecutarAnalisisIA(): void {
//         this.cargandoIA = true;
//         this.estadoError = false;
//     }

//     // 4. PLAN DE CONTINGENCIA (Fallback)
//     private generarDataDeRespaldo(): TerminalSLA {
//         return {
//             nombre: this.terminalId,
//             subtitulo: 'Datos no disponibles temporalmente',
//             muelles: [],
//             estado_operativo: 'SIN CONEXIÓN',
//             badge_class: 'badge-danger',
//             metricas_pie: []
//         };
//     }

//     maximizar() {
//         // Le pasas tu ID y tu Data al servicio
//         this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
//     }

//     public toggleVista(): void {
//         this.mostrarTabla = !this.mostrarTabla;

//         // 🚨 DEBUG PARA LA CONSOLA:
//         console.log(`=== DATA DEL TERMINAL: ${this.data?.nombreTerminal || 'Desconocido'} ===`);
//         console.log(this.data);
//     }
// }

import { Component, Input, ChangeDetectorRef, OnChanges, SimpleChanges, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalDocksDetailComponent } from "../terminal-docks-detail/terminal-docks-detail.component";
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';
export interface MetricaPie {
    label: string;
    valor: string | number;
}

export interface TerminalSLA {
    nombre: string;
    subtitulo: string;
    muelles: string[];
    estado_operativo: string;
    badge_class: string;
    metricas_pie: MetricaPie[];
    observacion_ia?: string;
}
@Component({
    selector: 'app-terminal-summary-card',
    standalone: true,
    imports: [CommonModule, TerminalDocksDetailComponent],
    templateUrl: './terminal-summary-card.component.html',
    styleUrls: ['./terminal-summary-card.component.scss']
})
export class TerminalSummaryCardComponent implements OnChanges, OnInit {
    @Input() data: any;
    @Input() widgetId?: string;

    public mostrarTabla: boolean = false;
    public cargandoIA: boolean = true;
    public dataTerminal: any; // Mantén el tipo que tenías, o pon any temporalmente
    public estadoError: boolean = false;
    public processedData: any = {};
    public esVistaCompacta: boolean = true;

    constructor(
        private cdr: ChangeDetectorRef,
        private _torreService: DashboardService,
        private el: ElementRef // 🚨 2. Inyectamos ElementRef para leer el DOM
    ) { }

    ngOnInit(): void {
        // console.log('💳 ¿La tarjeta recibió la propiedad data?:', this.data);
    }

    ngAfterViewInit(): void {
        // 🚨 3. El componente pregunta: "¿Estoy dentro de un modal?"
        // Aquí puedes poner las clases que use tu librería (ej: .modal, .mat-dialog-container, .p-dialog)
        const contenedorModal = this.el.nativeElement.closest('.modal, dialog, .cdk-overlay-pane, .modal-dialog');

        if (contenedorModal) {
            this.esVistaCompacta = false; // Estamos en el modal, mostramos TODAS las columnas
            this.mostrarTabla = true;     // Aseguramos que la tabla se vea abierta de inmediato
            this.cdr.detectChanges();     // Refrescamos la vista para evitar errores de Angular
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] && changes['data'].currentValue) {
            // Aseguramos que la data sea el objeto completo procesado por el adaptador
            this.data = changes['data'].currentValue;

            // 🚨 VERIFICACIÓN DE ESTRUCTURA:
            // Si el transform devolvió bien la data, 'this.data.tableData' debería existir.
            // if (this.data && Array.isArray(this.data.tableData)) {
            //     console.log('✅ Estructura de tabla validada:', this.data.tableData.length, 'filas listas.');
            // } else {
            //     console.warn('⚠️ La data recibida no contiene tableData, revisa el transform del adaptador.');
            // }

            this.cargandoIA = false;
            this.cdr.detectChanges(); // Fuerza la actualización de la vista tras el cambio
        }
    }

    maximizar() {
        // Le pasas tu ID y tu Data al servicio
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }

    public toggleVista(): void {
        this.mostrarTabla = !this.mostrarTabla;

        // 🚨 DEBUG PARA LA CONSOLA:
        // console.log(`=== DATA DEL TERMINAL: ${this.data?.nombreTerminal || 'Desconocido'} ===`);
        // console.log(this.data);
    }
}
