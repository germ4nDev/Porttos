import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LocalStorageService, NavigationService, SwalAlertService } from 'src/app/theme/shared/service';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavBarComponent } from "src/app/theme/layout/admin/nav-bar/nav-bar.component";
import { NavContentComponent } from "src/app/theme/layout/admin/navigation/nav-content/nav-content.component";
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { MapaLogisticoComponent } from "../widgets/mapa-logistico/mapa-logistico.component";

// SERVICIOS
import { MapSocketService } from '../../theme/shared/service/tablero-control/map-socket.service';
import { MaritimoService } from '../../theme/shared/service/tablero-control/maritimo.service';
import { MapaGeneralService } from '../../theme/shared/service/tablero-control/mapa-general.service';

@Component({
    selector: 'app-dashboard-panel',
    standalone: true,
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule,
        NavBarComponent,
        NavContentComponent,
        MapaLogisticoComponent // Solo inyectamos el componente de MapLibre
    ],
    templateUrl: './dashboard-panel.component.html',
    styleUrl: './dashboard-panel.component.scss'
})
export class DashboardPanelComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>();
    activeTab: 'menu' | 'filters' | 'main' = 'menu';
    menuItems$!: Observable<NavigationItem[]>;
    hasFiltersSlot: boolean = false;

    private subscriptions = new Subscription();

    constructor(
        private _localStorageService: LocalStorageService,
        private _navigationService: NavigationService,
        private _mapSocketService: MapSocketService,
        private _maritimoService: MaritimoService,
        private _mapaGeneralService: MapaGeneralService, // El Cerebro (State Manager)
        private _translate: TranslateService,
        private _swalService: SwalAlertService
    ) {
        console.log('🚨🚨🚨 TORRE DE CONTROL: ORQUESTADOR INICIADO 🚨🚨🚨');
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems();
        this.menuItems$ = this._navigationService.menuItems$;

        // Arrancamos los motores que empujan datos al servicio
        this.iniciarMotoresDeDatos();
        this.cargarArchivosEstaticos();
    }

    // ========================================================================
    // MOTORES DE SINCRONIZACIÓN REACTIVA (Empujan datos al Cerebro)
    // ========================================================================
    private iniciarMotoresDeDatos(): void {
        // 1. CICLO LENTO: Gemelo Digital (Infraestructura, Clima) - Cada 5 min
        this.subscriptions.add(
            timer(0, 300000).pipe(
                switchMap(() => this._mapaGeneralService.obtenerGemeloDigital())
            ).subscribe({
                next: (data: any) => {
                    console.log('✅ Gemelo Digital Sincronizado');
                    if (data?.CAPA_INFRAESTRUCTURA) this._mapaGeneralService.actualizarInfraestructura(data.CAPA_INFRAESTRUCTURA);
                    if (data?.CAPA_TERRESTRE) this._mapaGeneralService.actualizarTerrestre(data.CAPA_TERRESTRE);
                    if (data?.CAPA_CLIMA) this._mapaGeneralService.actualizarClima(data.CAPA_CLIMA);
                },
                error: (err) => console.error('❌ Error Gemelo Digital:', err)
            })
        );

        // 2. CICLO RÁPIDO: Tráfico Terrestre (Camiones) - Cada 15 segundos
        this.subscriptions.add(
            timer(0, 15000).pipe(
                switchMap(() => this._mapaGeneralService.obtenerCapaTerrestreMapa())
            ).subscribe({
                next: (response: any) => {
                    this._mapaGeneralService.actualizarTerrestre(response.data || response);
                },
                error: (err) => console.error('❌ Error Tráfico Terrestre:', err)
            })
        );

        // 3. CICLO MARÍTIMO: Naves - Cada 5 min
        this.subscriptions.add(
            timer(0, 300000).pipe(
                switchMap(() => this._maritimoService.obtenerCapaMaritimaMapa())
            ).subscribe({
                next: (geoJson) => {
                    // En la Fase 2 pondremos el transformadorAca
                    this._mapaGeneralService.actualizarNaves(geoJson);
                },
                error: (err) => console.error('❌ Error Naves Marítimas:', err)
            })
        );

        // 4. CICLO ALERTAS: IDEAM - Cada 5 min
        this.subscriptions.add(
            timer(0, 300000).pipe(
                switchMap(() => this._mapaGeneralService.getAlertasActivas())
            ).subscribe({
                next: (response: any) => {
                    if (response.success && response.data) {
                        const geoJson = this.transformarAlertasAGeoJson(response.data);
                        this._mapaGeneralService.actualizarClima(geoJson); // Envía a clima o crea un nuevo Subject para alertas si prefieres
                        console.log('☁️ Alertas procesadas:', geoJson.features.length);
                    }
                },
                error: (err) => console.error('❌ Error Alertas:', err)
            })
        );

        // 🟢 5. CICLO INVIAS: Accidentes y Bloqueos Viales - Cada 3 min
        this.subscriptions.add(
            timer(0, 180000).pipe(
                switchMap(() => this._mapaGeneralService.obtenerAccidentesYBloqueosViales())
            ).subscribe({
                next: (geoJson: any) => {
                    this._mapaGeneralService.actualizarAccidentes(geoJson);
                    console.log('🚨 Reportes INVIAS procesados:', geoJson.features?.length || 0);
                },
                error: (err) => console.error('❌ Error INVIAS:', err)
            })
        );
    }

    private cargarArchivosEstaticos() {
        // Cargamos la red vial estática y la empujamos al servicio
        fetch('assets/data/Red_Vial_20260626.geojson')
            .then(res => res.json())
            .then(data => {
                this._mapaGeneralService.actualizarVias(data);
                console.log('🛣️ Red vial estática cargada en memoria');
            })
            .catch(err => console.error('Error cargando red vial:', err));
    }

    // ========================================================================
    // UTILIDADES
    // ========================================================================
    private transformarAlertasAGeoJson(data: any[]): any {
        return {
            type: 'FeatureCollection',
            features: data.map((alerta) => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [Number(alerta.longitud), Number(alerta.latitud)]
                },
                properties: {
                    tipoAlerta: alerta.tipoAlerta,
                    descripcion: alerta.descripcion,
                    nivelSeveridad: alerta.nivelSeveridad,
                    sector: alerta.nombreSector,
                    corredor: alerta.corredorVial
                }
            }))
        };
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}
