// import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { BehaviorSubject, combineLatest, Observable, of, Subscription, timer } from 'rxjs';
// import { catchError, map, startWith, switchMap } from 'rxjs/operators';
// import { GradientConfig } from 'src/app/app-config'
// import { CronMonitorService } from '../../theme/shared/service/tablero-control/cron-monitor.service';
// import { DataLoaderComponent } from "src/app/theme/shared/components/data-loader/data-loader.component";
// import { DatatableComponent } from "src/app/theme/shared/components/data-table/data-table.component";
// import { NavContentComponent } from "src/app/theme/layout/admin/navigation/nav-content/nav-content.component";
// import { NavBarComponent } from "src/app/theme/layout/admin/nav-bar/nav-bar.component";
// import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
// import { NavigationService, PtllogActividadesService, LocalStorageService } from 'src/app/theme/shared/service';
// import { TranslateModule, TranslateService } from '@ngx-translate/core';
// import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model';
// import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model';
// import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
// import { RegistroCron } from 'src/app/theme/shared/_helpers/models/tablero-control/registro-cron.model';

// @Component({
//     selector: 'app-cron-monitor',
//     standalone: true,
//     imports: [CommonModule, TranslateModule, DataLoaderComponent, DatatableComponent, NavContentComponent, NavBarComponent],
//     templateUrl: './cron-monitor.component.html',
//     styleUrls: ['./cron-monitor.component.scss']
// })
// export class CronMonitorComponent implements OnInit, OnDestroy {
//     @Output() toggleSidebar = new EventEmitter<void>()
//     cronsTransformados$: Observable<RegistroCron[]> = of([])
//     cronsFiltradas$: Observable<RegistroCron[]> = of([])

//     DataModel: BaseSessionModel = new BaseSessionModel()
//     DataLogActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()
//     historialCrons: RegistroCron[] = [];

//     cargando: boolean = true;
//     ultimaActualizacion: Date = new Date();
//     gradientConfig
//     lang = localStorage.getItem('lang')
//     menuItems$!: Observable<NavigationItem[]>
//     hasFiltersSlot: boolean = false
//     activeTab: 'menu' | 'filters' | 'main' = 'menu'
//     subscriptions = new Subscription()
//     private pollingSubscription!: Subscription;
//     suscriptor: string = ''

//     filtroProcesoSubject = new BehaviorSubject<string>('todos')
//     filtroEstadoSubject = new BehaviorSubject<string>('todos')

//     constructor(
//         private _cronService: CronMonitorService,
//         private translate: TranslateService,
//         private _navigationService: NavigationService,
//         private _logActividadesService: PtllogActividadesService,
//         private _localStorageService: LocalStorageService,
//     ) {
//         this.gradientConfig = GradientConfig
//         this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
//         this.cronsFiltradas$ = this._cronService.crons$;
//     }

//     ngOnInit(): void {
//         this._navigationService.getNavigationItems();
//         this.menuItems$ = this._navigationService.menuItems$;
//         this.hasFiltersSlot = true;
//         this.subscriptions.add(
//             this._cronService.obtenerHistorial().subscribe({
//                 next: () => console.log('✅ Crons cargados y transmitidos exitosamente'),
//                 error: (err) => console.error('❌ Error al cargar Crons:', err)
//             })
//         );
//         this.setupRegistrosStream();
//     }

//     ngOnDestroy(): void {
//         // Evitamos fugas de memoria destruyendo la suscripción
//         if (this.pollingSubscription) {
//             this.pollingSubscription.unsubscribe();
//         }
//     }

//     setupRegistrosStream(): void {
//         this.cronsTransformados$ = this._cronService.crons$.pipe(
//             switchMap((crns: any) => {
//                 console.log('log del crons', crns);
//                 if (!crns) return of([])
//                 const transformedCrons = crns.data.map((fr: any) => {
//                     console.log('log del cron', fr);
//                     fr.fecha_form = new Date(fr.fecha_ejecucion).toLocaleDateString()
//                     return fr as RegistroCron
//                 })
//                 this.historialCrons = transformedCrons
//                 console.log('****** todos los historialCrons', this.historialCrons)
//                 return of(transformedCrons)
//             }),
//             catchError(err => {
//                 console.error('Error en el stream de faros:', err)
//                 return of([])
//             })
//         )

//         this.cronsFiltradas$ = combineLatest([
//             this.cronsTransformados$.pipe(startWith([])),
//             this.filtroProcesoSubject,
//             this.filtroEstadoSubject
//         ]).pipe(
//             map(([crns, proceso, estado]) => {
//                 let filteredRegistros = crns

//                 if (proceso !== 'todos') {
//                     filteredRegistros = filteredRegistros.filter((crn: any) => crn.proceso === proceso)
//                 }

//                 if (estado !== 'todos') {
//                     const estadoBoolean = estado === 'true'
//                     filteredRegistros = filteredRegistros.filter((crn: any) => crn.estado === estadoBoolean)
//                 }
//                 console.log('**************data de las faros', filteredRegistros)

//                 return filteredRegistros
//             })
//         )
//     }

//     columnasCrons: ColumnMetadata[] = [
//         {
//             name: 'fecha_ejecucion',
//             header: 'Fecha de Ejecución',
//             type: 'date'
//         },
//         {
//             name: 'proceso',
//             header: 'Túnel / Proceso',
//             type: 'text'
//         },
//         {
//             name: 'estado',
//             header: 'Estado',
//             type: 'estado'
//         },
//         {
//             name: 'registros_procesados',
//             header: 'Registros Procesados',
//             type: 'number'
//         },
//         {
//             name: 'duracion_ms',
//             header: 'Duración (ms)',
//             type: 'number'
//         }
//     ]

//     columnasDetailRegistros: ColumnMetadata[] = [
//         {
//             name: 'mensaje_error',
//             header: 'Observaciones / Detalle de Error',
//             type: 'text'
//         }
//     ]

//     obtenerClaseEstado(estado: string): string {
//         switch (estado) {
//             case 'EXITO': return 'badge-success';
//             case 'ERROR': return 'badge-danger';
//             case 'EN_PROCESO': return 'badge-warning';
//             default: return 'badge-secondary';
//         }
//     }

//     OnNuevaRegistroClick(): void {
//         console.log('Nuevo registro clickeado');
//     }

//     OnEditarRegistroClick(evento: any): void {
//         console.log('Editar registro:', evento);
//     }

//     OnEliminarRegistroClick(evento: any): void {
//         console.log('Eliminar registro:', evento);
//     }


//     toggleNav(): void {
//         this.toggleSidebar.emit()
//     }
// }
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, Observable, of, Subscription, timer } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { GradientConfig } from 'src/app/app-config';
import { CronMonitorService } from '../../theme/shared/service/tablero-control/cron-monitor.service';
import { DataLoaderComponent } from "src/app/theme/shared/components/data-loader/data-loader.component";
import { DatatableComponent } from "src/app/theme/shared/components/data-table/data-table.component";
import { NavContentComponent } from "src/app/theme/layout/admin/navigation/nav-content/nav-content.component";
import { NavBarComponent } from "src/app/theme/layout/admin/nav-bar/nav-bar.component";
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { NavigationService, PtllogActividadesService, LocalStorageService } from 'src/app/theme/shared/service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseSessionModel } from 'src/app/theme/shared/_helpers/models/BaseSession.model';
import { PTLLogActividadAPModel } from 'src/app/theme/shared/_helpers/models/PTLlogActividadAP.model';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { RegistroCron } from 'src/app/theme/shared/_helpers/models/tablero-control/registro-cron.model';

@Component({
    selector: 'app-cron-monitor',
    standalone: true,
    imports: [CommonModule, TranslateModule, DataLoaderComponent, DatatableComponent, NavContentComponent, NavBarComponent],
    templateUrl: './cron-monitor.component.html',
    styleUrls: ['./cron-monitor.component.scss']
})
export class CronMonitorComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>()
    cronsTransformados$: Observable<RegistroCron[]> = of([])
    cronsFiltradas$: Observable<RegistroCron[]> = of([])

    DataModel: BaseSessionModel = new BaseSessionModel()
    DataLogActividad: PTLLogActividadAPModel = new PTLLogActividadAPModel()
    historialCrons: RegistroCron[] = [];
    listaNombresCrons: string[] = []; // Agregado: Listado de procesos únicos

    cargando: boolean = true;
    ultimaActualizacion: Date = new Date();
    gradientConfig: any;
    lang = localStorage.getItem('lang')
    menuItems$!: Observable<NavigationItem[]>
    hasFiltersSlot: boolean = false
    activeTab: 'menu' | 'filters' | 'main' = 'menu'
    subscriptions = new Subscription()
    private pollingSubscription!: Subscription;
    suscriptor: string = ''

    filtroProcesoSubject = new BehaviorSubject<string>('todos')
    filtroEstadoSubject = new BehaviorSubject<string>('todos')

    constructor(
        private _cronService: CronMonitorService,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _logActividadesService: PtllogActividadesService,
        private _localStorageService: LocalStorageService,
    ) {
        this.gradientConfig = GradientConfig
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
        this.cronsFiltradas$ = this._cronService.crons$;
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems();
        this.menuItems$ = this._navigationService.menuItems$;
        this.hasFiltersSlot = true;
        this.subscriptions.add(
            this._cronService.obtenerHistorial().subscribe({
                next: () => console.log('✅ Crons cargados y transmitidos exitosamente'),
                error: (err) => console.error('❌ Error al cargar Crons:', err)
            })
        );
        this.setupRegistrosStream();
    }

    ngOnDestroy(): void {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
        }
        this.subscriptions.unsubscribe();
    }

    setupRegistrosStream(): void {
        this.cronsTransformados$ = this._cronService.crons$.pipe(
            switchMap((crns: any) => {
                if (!crns) return of([])

                // Nota: Asumiendo que crns ya es un array según tu servicio,
                // ajustamos para no usar crns.data si el servicio ya hizo el map
                const listado = Array.isArray(crns) ? crns : (crns.data || []);

                const transformedCrons = listado.map((fr: any) => {
                    fr.fecha_form = new Date(fr.fecha_ejecucion).toLocaleDateString()
                    return fr as RegistroCron
                });

                this.historialCrons = transformedCrons;

                // Agregado: Extraer nombres únicos para el select
                const nombres = transformedCrons.map((c: any) => c.proceso);
                this.listaNombresCrons = [...new Set(nombres)].sort() as string[];

                return of(transformedCrons)
            }),
            catchError(err => {
                console.error('Error en el stream de crons:', err)
                return of([])
            })
        )

        this.cronsFiltradas$ = combineLatest([
            this.cronsTransformados$.pipe(startWith([])),
            this.filtroProcesoSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([crns, proceso, estado]) => {
                let filteredRegistros = crns

                if (proceso !== 'todos') {
                    filteredRegistros = filteredRegistros.filter((crn: any) => crn.proceso === proceso)
                }

                // Ajustado: El estado ya no es booleano, es texto (EXITO, ERROR, EN_PROCESO)
                if (estado !== 'todos') {
                    filteredRegistros = filteredRegistros.filter((crn: any) => crn.estado === estado)
                }

                return filteredRegistros
            })
        )
    }

    // Métodos para reaccionar a los selects del HTML
    onFiltroProcesoChangeClick(event: any): void {
        this.filtroProcesoSubject.next(event.target.value);
    }

    onFiltroEstadoChangeClick(event: any): void {
        this.filtroEstadoSubject.next(event.target.value);
    }

    columnasCrons: ColumnMetadata[] = [
        {
            name: 'fecha_ejecucion',
            header: 'Fecha de Ejecución',
            type: 'date'
        },
        {
            name: 'proceso',
            header: 'Túnel / Proceso',
            type: 'text'
        },
        {
            name: 'estado',
            header: 'Estado',
            type: 'estado'
        },
        {
            name: 'registros_procesados',
            header: 'Registros Procesados',
            type: 'number'
        },
        {
            name: 'duracion_ms',
            header: 'Duración (ms)',
            type: 'number'
        }
    ]

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'mensaje_error',
            header: 'Observaciones / Detalle de Error',
            type: 'text'
        }
    ]

    obtenerClaseEstado(estado: string): string {
        switch (estado) {
            case 'EXITO': return 'badge-success';
            case 'ERROR': return 'badge-danger';
            case 'FALLIDO': return 'badge-danger';
            case 'EN_PROCESO': return 'badge-warning';
            default: return 'badge-secondary';
        }
    }

    OnNuevaRegistroClick(): void {
        console.log('Nuevo registro clickeado');
    }

    OnEditarRegistroClick(evento: any): void {
        console.log('Editar registro:', evento);
    }

    OnEliminarRegistroClick(evento: any): void {
        console.log('Eliminar registro:', evento);
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
