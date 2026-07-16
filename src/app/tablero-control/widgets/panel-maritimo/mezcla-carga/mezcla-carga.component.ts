// import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, ViewEncapsulation, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Chart, registerables } from 'chart.js';
// import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';
// import { ThemeService } from 'src/app/theme/shared/service';

// Chart.register(...registerables);

// @Component({
//     selector: 'app-mezcla-carga',
//     standalone: true,
//     imports: [CommonModule],
//     templateUrl: './mezcla-carga.component.html',
//     styleUrl: './mezcla-carga.component.scss',
//     encapsulation: ViewEncapsulation.None
// })
// export class MezclaCargaComponent implements OnInit, AfterViewInit, OnChanges {
//     @Input() data: any;

//     // 🔥 Agrega estas dos líneas para satisfacer al motor dinámico de QPLUS
//     @Input() widgetId?: string;
//     @Input() config?: any;

//     @ViewChild('barChart') barChart!: ElementRef;
//     private subs: any[] = [];
//     public chartInstance: any;
//     textoColor: string = '';
//     subtitleColor: string = '';
//     borderColor: string = '';

//     constructor(
//         private _torreService: DashboardService,
//         private _themeService: ThemeService
//     ) { }


//     ngAfterViewInit() {
//         this.renderizarGrafica();
//     }

//     ngOnInit(): void {
//         // Si ya tienes data inicial, renderiza de una vez
//         if (this.data) {
//             this.renderizarGrafica();
//         }

//         this.subs.push(
//             this._themeService.isDarkTheme$.subscribe(() => {
//                 console.log("La torre avisó: Refrescando gráfica...");
//                 this.renderizarGrafica();
//             })
//         );
//     }

//     ngOnChanges(changes: SimpleChanges) {
//         // Si la data cambia, vuelve a renderizar
//         if (changes['data'] && !changes['data'].isFirstChange()) {
//             this.renderizarGrafica();
//         }
//     }

//     renderizarGrafica() {

//         if (!this.barChart) return;

//         if (this.chartInstance) {
//             this.chartInstance.destroy();
//         }

//         const colorTexto = this.getCssVariableValue('--text-color') || '#ffffff';
//         const colorSubtitulo = this.getCssVariableValue('--text-subtitle-color') || '#a0a0a0';
//         const colorGrid = this.getCssVariableValue('--border-color') || 'rgba(255,255,255,0.1)';

//         // Datos por defecto si el backend no ha respondido aún
//         const labels = this.data?.labels || ['Contenedores', 'Granel sólido', 'General/vehíc.', 'Granel líquido', 'Carbón'];
//         const valores = this.data?.valores || [13.5, 5.8, 1.8, 0.8, 0.6];
//         const colores = ['#3b82f6', '#10b981', '#fab131', '#06b6d4', '#8c6e5c'];

//         this.chartInstance = new Chart(this.barChart.nativeElement, {
//             type: 'bar',
//             data: {
//                 labels: labels,
//                 datasets: [{
//                     data: valores,
//                     backgroundColor: colores,
//                     borderWidth: 0,
//                     borderRadius: 2,
//                     barThickness: 20
//                 }]
//             },
//             options: {
//                 indexAxis: 'y',
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         callbacks: {
//                             label: (context) => ` ${context.raw} Mt`
//                         }
//                     }
//                 },
//                 scales: {
//                     x: {
//                         grid: { color: 'rgba(255, 255, 255, 0.05)' },
//                         ticks: {
//                             color: colorSubtitulo,
//                             font: { size: 10 },
//                             callback: function (value) {
//                                 return value + 'Mt';
//                             }
//                         }
//                     },
//                     y: {
//                         grid: { display: false },
//                         ticks: {
//                             color: colorTexto,
//                             font: { size: 11, weight: 'bold' }
//                         }
//                     }
//                 }
//             }
//         });
//     }

//     private getCssVariableValue(variableName: string): string {
//         // Busca el valor en el elemento raíz (:root)
//         return getComputedStyle(document.documentElement)
//             .getPropertyValue(variableName)
//             .trim();
//     }

//     maximizar() {
//         this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
//     }
// }

import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';
import { LocalStorageService, ThemeService } from 'src/app/theme/shared/service';
import { Subscription } from 'rxjs'; // 🔥 Importación necesaria

Chart.register(...registerables);

@Component({
    selector: 'app-mezcla-carga',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './mezcla-carga.component.html',
    styleUrl: './mezcla-carga.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class MezclaCargaComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    @Input() data: any;
    @Input() widgetId?: string;
    @Input() config?: any;

    @ViewChild('barChart') barChart!: ElementRef;

    private themeSub: Subscription = new Subscription(); // 🔥 Gestión de suscripciones
    public chartInstance: any;
    themeSettings: any;

    constructor(
        private _torreService: DashboardService,
        private _localStorageService: LocalStorageService,
        private _themeService: ThemeService
    ) { }

    ngOnInit(): void {
        // 🔥 Suscripción centralizada al cambio de tema
        this.themeSettings = this._localStorageService.getThemeSettings();
        console.log('theme settings', this.themeSettings);

        this.themeSub = this._themeService.isDarkTheme$.subscribe(() => {
            console.log("Detectado cambio de tema, refrescando gráfica...");
            this.renderizarGrafica();
        });
    }

    ngAfterViewInit() {
        this.renderizarGrafica();
    }

    ngOnChanges(changes: SimpleChanges) {
        // Si la data cambia, vuelve a renderizar
        if (changes['data'] && !changes['data'].isFirstChange()) {
            this.renderizarGrafica();
        }
    }

    ngOnDestroy(): void {
        // 🔥 IMPORTANTE: Evita fugas de memoria limpiando la suscripción
        if (this.themeSub) {
            this.themeSub.unsubscribe();
        }
        // Destruye el gráfico para liberar memoria
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }
    }

    renderizarGrafica() {
        if (!this.barChart || !this.barChart.nativeElement) return;

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        // 🔥 LEEMOS EL VALOR DEL CSS EN EL MOMENTO DEL RENDER
        let colorTexto = '#ffffff';
        let colorSubtitulo = '#a0a0a0';
        let colorGrid = 'rgba(255,255,255,0.1)';

        if (this.themeSettings.isDarkTheme == true) {
            colorTexto = '#b4b4b4';
            colorSubtitulo = '#9c9c9c';
            colorGrid = '#6e6e6e';
        } else {
            colorTexto = '#212529';
            colorSubtitulo = '#464e57';
            colorGrid = '#e6e6e6';
        }

        const labels = this.data?.labels || ['Contenedores', 'Granel sólido', 'General/vehíc.', 'Granel líquido', 'Carbón'];
        const valores = this.data?.valores || [13.5, 5.8, 1.8, 0.8, 0.6];
        const colores = ['#3b82f6', '#10b981', '#fab131', '#06b6d4', '#8c6e5c'];

        this.chartInstance = new Chart(this.barChart.nativeElement, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: colores,
                    borderWidth: 0,
                    borderRadius: 2,
                    barThickness: 30
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => ` ${context.raw} Mt`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: colorGrid },
                        ticks: {
                            color: colorSubtitulo,
                            font: { size: 10 },
                            callback: (value) => value + ' Mt'
                        }
                    },
                    y: {
                        grid: { display: false },
                        ticks: {
                            color: colorTexto,
                            font: { size: 11, weight: 'bold' }
                        }
                    }
                }
            }
        });
    }

    private getCssVariableValue(variableName: string): string {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(variableName)
            .trim();
    }

    maximizar() {
        this._torreService.abrirModoEnfoque(this.widgetId || '', this.data);
    }
}
