// /*
//     Author: German Valencia
//     Pattern: PORTTOS Generic Widget - Stacked Bar Chart Contenedores (Standalone)
// */
// import { Component, Input, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { NgChartsModule } from 'ng2-charts';
// import { ChartConfiguration, ChartData } from 'chart.js';
// import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

// @Component({
//     selector: 'app-chart-bar-cont',
//     standalone: true,
//     imports: [CommonModule, NgChartsModule],
//     templateUrl: './chart-bar-cont.component.html',
//     styleUrls: ['./chart-bar-cont.component.scss']
// })
// export class ChartBarContComponent implements OnInit {
//     @Input() widgetId?: string;

//     private _data: any;
//     public cargando: boolean = true;

//     @Input() set data(value: any) {
//         this._data = value;

//         if (value) {
//             this.cargando = false; // Apagamos el loader

//             if (value.series && value.categorias) {
//                 // Colores por defecto si el backend no los manda
//                 const colors = value.colores || ['#3b82f6', '#22d3ee', '#f59e0b', '#ef4444'];

//                 // Mapeamos la data al formato de Chart.js
//                 this.barChartData = {
//                     labels: value.categorias,
//                     datasets: value.series.map((serie: any, index: number) => ({
//                         label: serie.name || `Serie ${index + 1}`,
//                         data: serie.data,
//                         backgroundColor: colors[index % colors.length],
//                         stack: 'Stack 0', // Crucial para apilar las barras
//                         borderRadius: 4
//                     }))
//                 };
//             } else {
//                 // Fallback (Mock) visual si la API no manda la data completa
//                 console.warn('⚠️ Faltan series/categorias en Contenedores, usando Mock.');
//                 this.barChartData = {
//                     labels: ['Patio A', 'Patio B', 'Patio C'],
//                     datasets: [
//                         { label: 'Por devolver', data: [40, 30, 20], backgroundColor: '#3b82f6', stack: 'Stack 0', borderRadius: 4 },
//                         { label: 'Capacidad', data: [60, 70, 80], backgroundColor: '#22d3ee', stack: 'Stack 0', borderRadius: 4 }
//                     ]
//                 };
//             }
//         }
//     }

//     get data(): any { return this._data; }

//     constructor(private _torreService: DashboardService) { }

//     ngOnInit() { }

//     maximizar() {
//         this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
//     }

//     // Configuración de Chart.js para barras horizontales apiladas
//     public barChartOptions: ChartConfiguration['options'] = {
//         responsive: true,
//         maintainAspectRatio: false,
//         indexAxis: 'y', // 👈 ¡ESTA ES LA CLAVE PARA QUE SEAN HORIZONTALES!
//         scales: {
//             x: {
//                 stacked: true, // Apilamiento horizontal
//                 ticks: { color: '#94a3b8' },
//                 grid: { color: 'rgba(255,255,255,0.05)' },
//                 border: { display: false }
//             },
//             y: {
//                 stacked: true, // Apilamiento vertical
//                 ticks: { color: '#94a3b8' },
//                 grid: { display: false },
//                 border: { display: false }
//             }
//         },
//         plugins: {
//             legend: {
//                 position: 'top',
//                 align: 'end',
//                 labels: {
//                     color: '#94a3b8',
//                     font: { size: 11 },
//                     usePointStyle: true,
//                     pointStyle: 'circle',
//                     boxWidth: 8
//                 }
//             }
//         }
//     };

//     public barChartData!: ChartData<'bar'>;
// }
/*
    Author: German Valencia
    Pattern: PORTTOS Generic Widget - Grouped Bar Chart Contenedores (Standalone)
*/
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';

@Component({
    selector: 'app-chart-bar-cont',
    standalone: true,
    imports: [CommonModule, NgChartsModule],
    templateUrl: './chart-bar-cont.component.html',
    styleUrls: ['./chart-bar-cont.component.scss']
})
export class ChartBarContComponent implements OnInit {
    @Input() widgetId?: string;

    private _data: any;
    public cargando: boolean = true;

    @Input() set data(value: any) {
        this._data = value;

        if (value) {
            this.cargando = false;

            if (value.series && value.categorias) {
                // 🚀 CAMBIO: Colores por defecto ajustados al diseño (Morado y Verde)
                const colors = value.colores || ['#a855f7', '#10b981'];

                this.barChartData = {
                    labels: value.categorias,
                    datasets: value.series.map((serie: any, index: number) => ({
                        label: serie.name || `Serie ${index + 1}`,
                        data: serie.data,
                        backgroundColor: colors[index % colors.length],
                        // 🚀 CAMBIO: Eliminamos la propiedad stack para que queden lado a lado
                        borderRadius: 4
                    }))
                };
            } else {
                // Fallback (Mock) visual si la API no manda la data completa
                console.warn('⚠️ Faltan series/categorias en Contenedores, usando Mock.');
                this.barChartData = {
                    labels: ['Maersk', 'MSC', 'CMA CGM', 'Hapag', 'Evergreen', 'ONE', 'COSCO'],
                    datasets: [
                        { label: 'Por devolver', data: [140, 118, 98, 82, 55, 48, 40], backgroundColor: '#a855f7', borderRadius: 4 },
                        { label: 'Cap. patios', data: [80, 90, 110, 120, 150, 140, 160], backgroundColor: '#10b981', borderRadius: 4 }
                    ]
                };
            }
        }
    }

    get data(): any { return this._data; }

    constructor(private _torreService: DashboardService) { }

    ngOnInit() { }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }

    // 🚀 CAMBIO: Configuración de Chart.js para barras VERTICALES AGRUPADAS
    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        // indexAxis: 'y', // <-- Eliminado para que sea vertical
        scales: {
            x: {
                stacked: false, // <-- Eliminado el apilamiento
                ticks: { color: '#94a3b8' },
                grid: { display: false },
                border: { display: false }
            },
            y: {
                stacked: false, // <-- Eliminado el apilamiento
                ticks: { color: '#94a3b8' },
                grid: {
                    color: 'rgba(255,255,255,0.05)', // Líneas guía horizontales sutiles
                    display: true
                },
                border: { display: false }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    color: '#94a3b8',
                    font: { size: 11 },
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 8
                }
            }
        }
    };

    public barChartData!: ChartData<'bar'>;
}
