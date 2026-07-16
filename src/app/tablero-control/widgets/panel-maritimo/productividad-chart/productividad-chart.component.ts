
// import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
// import { CommonModule } from '@angular/common'; // 🚨 Obligatorio para usar *ngIf
// import { Chart, ChartOptions, registerables } from 'chart.js';
// import { Subscription } from 'rxjs';

// // Ajusta estas rutas a tu estructura QPLUS
// import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';
// import { FiltroTableroService } from 'src/app/theme/shared/service/tablero-control/filtro-tablero.service';
// import { ProductividadGraficaAdapter } from '../../../theme/shared/adapters/productividad.adapter';
// import { TorreControlService } from 'src/app/theme/shared/service/tablero-control/torre-control.service';

// // Registramos todos los elementos de Chart.js
// Chart.register(...registerables);

// @Component({
//     selector: 'app-widget-productividad',
//     standalone: true, // 🚨 Marca el componente como independiente
//     imports: [CommonModule], // 🚨 Inyectamos las dependencias directas del template
//     templateUrl: './productividad-chart.component.html',
//     styleUrls: ['./productividad-chart.component.scss']
// })
// export class ProductividadChartComponent implements OnInit, OnDestroy {
//     @Input() title: string = '';
//     @Input() widgetId?: string;
//     private _data: any;

//     // Capturamos el Canvas usando la referencia de Angular #productivityCanvas
//     @ViewChild('productivityCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
//     @Input() set data(value: any) {
//         this._data = value;
//         if (value && value.labels) {
//             // Cuando llega la data, actualizamos barChartData inmediatamente
//             // this.ChartData = {
//             //     labels: value.labels,
//             //     datasets: value.datasets
//             // };
//         }
//     }
//     public chartInstance: Chart | null = null;
//     public cargando: boolean = true;
//     private filtroSub: Subscription | null = null;

//     // Opciones visuales separadas de los datos
//     public chartOptions: ChartOptions<'line'> = {
//         responsive: true,
//         maintainAspectRatio: false,
//         elements: {
//             line: { tension: 0.4 }, // Curvatura (Smooth)
//             point: { radius: 4, hoverRadius: 6 }
//         },
//         scales: {
//             y: {
//                 beginAtZero: true,
//                 grid: { color: '#1e293b' },
//                 ticks: { color: '#94a3b8', callback: (v) => v + ' m/h' }
//             },
//             x: {
//                 grid: { display: false },
//                 ticks: { color: '#94a3b8' }
//             }
//         },
//         plugins: {
//             legend: { labels: { color: '#cbd5e1', usePointStyle: true } }
//         }
//     };

//     constructor(
//         private dashboardService: DashboardService,
//         private filtroService: FiltroTableroService,
//         private _torreService: DashboardService,
//         private adapter: ProductividadGraficaAdapter
//     ) { }

//     ngOnInit(): void {
//         // Escuchamos el cambio de ciudad del tablero general
//         this.filtroSub = this.filtroService.ciudad$.subscribe((ciudad) => {
//             if (ciudad) {
//                 console.log('filtrar datos de la ciudad', ciudad);
//                 // this.cargarDatosPorCiudad('CARTAGENA');
//                 this.cargarDatosPorCiudad(ciudad);
//             }
//         });
//     }

//     private cargarDatosPorCiudad(ciudad: string): void {
//         this.cargando = true;

//         this.dashboardService.obtenerProductividadData(ciudad).subscribe({
//             next: (response) => {
//                 console.log('🟢 TRACE 1 - Response crudo de la API:', response);
//                 // Desenvolvemos la data según lo vimos en tu consola
//                 const datosCrudos = response.data ? response.data : response;

//                 if (datosCrudos && datosCrudos.length > 0) {
//                     // Pasamos por el túnel del adaptador
//                     const chartData = this.adapter.transformParaChartJS(datosCrudos, ciudad);
//                     console.log('🟡 TRACE 2 - Salida del Adaptador (Lista para Chart.js):', chartData);
//                     // Aseguramos que la vista esté lista antes de pintar el canvas
//                     setTimeout(() => {
//                         this.renderizarGrafica(chartData);
//                         this.cargando = false;
//                     }, 0);
//                 } else {
//                     this.cargando = false;
//                 }
//             },
//             error: (err) => {
//                 console.error('Error cargando la gráfica de productividad:', err);
//                 this.cargando = false;
//             }
//         });
//     }

//     private renderizarGrafica(dataTransformada: any): void {
//         console.log('🔵 TRACE 3 - chartData asignado en el Componente:', dataTransformada);
//         // Validación de seguridad para asegurar que el ViewChild ya capturó el canvas
//         if (!this.canvasRef || !this.canvasRef.nativeElement) return;

//         // Si la gráfica ya fue creada antes, solo actualizamos sus datos para una transición suave
//         if (this.chartInstance) {
//             this.chartInstance.data = dataTransformada;
//             this.chartInstance.update();
//         }
//         // Si es la primera vez que carga, creamos la instancia
//         else {
//             const ctx = this.canvasRef.nativeElement.getContext('2d');
//             if (ctx) {
//                 this.chartInstance = new Chart(ctx, {
//                     type: 'line',
//                     data: dataTransformada,
//                     options: this.chartOptions
//                 });
//             }
//         }
//     }
//     maximizar() {
//         this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
//     }
//     ngOnDestroy(): void {
//         // Limpiamos memoria para evitar fugas al cambiar de vista
//         if (this.filtroSub) this.filtroSub.unsubscribe();
//         if (this.chartInstance) this.chartInstance.destroy();
//     }
// }

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartOptions, registerables } from 'chart.js';
import { Subscription } from 'rxjs';

import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';
import { FiltroTableroService } from 'src/app/theme/shared/service/tablero-control/filtro-tablero.service';
import { ProductividadGraficaAdapter } from '../../../../theme/shared/adapters/productividad.adapter';
import { TorreControlService } from 'src/app/theme/shared/service/tablero-control/torre-control.service';

Chart.register(...registerables);

@Component({
    selector: 'app-widget-productividad',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './productividad-chart.component.html',
    styleUrls: ['./productividad-chart.component.scss']
})
export class ProductividadChartComponent implements OnInit, OnDestroy {
    @Input() title: string = '';
    @Input() widgetId?: string;
    @Input() esModal: boolean = false;
    public _data: any; // La data original que viene del Input
    public legendItems: any[] = []; // Array para dibujar la leyenda custom en HTML

    @ViewChild('productivityCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

    @Input() set data(value: any) {
        this._data = value;
        // Si la data viene directamente en el input (modo offline/precarga)
        if (value && value.chartDatasets) {
            this.legendItems = value.chartDatasets;
        }
    }

    public chartInstance: Chart | null = null;
    public cargando: boolean = true;
    private filtroSub: Subscription | null = null;

    public chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            line: { tension: 0.4 },
            point: { radius: 4, hoverRadius: 6 }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#1e293b' },
                ticks: { color: '#94a3b8', callback: (v) => v + ' m/h' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
            }
        },
        plugins: {
            // 🔥 APAGAMOS la leyenda nativa para usar la nuestra en HTML
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        }
    };

    constructor(
        private dashboardService: DashboardService,
        private filtroService: FiltroTableroService,
        private _torreService: DashboardService,
        private adapter: ProductividadGraficaAdapter
    ) { }

    ngOnInit(): void {
        this.filtroSub = this.filtroService.ciudad$.subscribe((ciudad) => {
            if (ciudad) {
                console.log('filtrar datos de la ciudad', ciudad);
                this.cargarDatosPorCiudad(ciudad);
            }
        });
    }

    private cargarDatosPorCiudad(ciudad: string): void {
        this.cargando = true;

        this.dashboardService.obtenerProductividadData(ciudad).subscribe({
            next: (response) => {
                const datosCrudos = response.data ? response.data : response;

                if (datosCrudos && datosCrudos.length > 0) {
                    const chartData = this.adapter.transformParaChartJS(datosCrudos, ciudad);

                    // Extraemos los datasets para la leyenda HTML
                    this.legendItems = chartData.datasets;

                    setTimeout(() => {
                        this.renderizarGrafica(chartData);
                        this.cargando = false;
                    }, 0);
                } else {
                    this.cargando = false;
                }
            },
            error: (err) => {
                console.error('Error cargando la gráfica de productividad:', err);
                this.cargando = false;
            }
        });
    }

    private renderizarGrafica(dataTransformada: any): void {
        if (!this.canvasRef || !this.canvasRef.nativeElement) return;

        if (this.chartInstance) {
            this.chartInstance.data = dataTransformada;
            this.chartInstance.update();
        }
        else {
            const ctx = this.canvasRef.nativeElement.getContext('2d');
            if (ctx) {
                this.chartInstance = new Chart(ctx, {
                    type: 'line',
                    data: dataTransformada,
                    options: this.chartOptions
                });
            }
        }
    }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this._data);
    }

    ngOnDestroy(): void {
        if (this.filtroSub) this.filtroSub.unsubscribe();
        if (this.chartInstance) this.chartInstance.destroy();
    }
}
