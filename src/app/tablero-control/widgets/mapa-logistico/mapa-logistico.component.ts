
/*
    Author: German Valencia
    Componente: Mapa Logístico - Integración Completa
    (Checkpoints circulares, KPIs desglosados y Radar asíncrono)
*/
import { Component, ElementRef, OnDestroy, ViewChild, AfterViewInit, OnInit, Input, HostBinding, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ThemeService } from '../../../theme/shared/service/theme.service';
import { LocalStorageService, SocketService } from 'src/app/theme/shared/service';
import { MapaGeneralService } from '../../../theme/shared/service/tablero-control/mapa-general.service';
import { Subscription, interval } from 'rxjs';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';
import maplibregl, { Map, GeoJSONSource } from 'maplibre-gl';
import { parse } from 'wellknown';
import * as turf from '@turf/turf';
import { FiltroTableroService } from 'src/app/theme/shared/service/tablero-control/filtro-tablero.service';
import { IWidget } from 'src/app/theme/shared/interfaces/torre-control/widget.interface';
import { ToastrService } from 'ngx-toastr';
import { MapSocketService } from 'src/app/theme/shared/service/tablero-control/map-socket.service';

const INFRA_THEME = {
    'puerto': { fill: '#cbd5e1', line: '#475569', circle: '#cbd5e1' },
    'terminal': { fill: '#fbbf24', line: '#d97706', circle: '#fbbf24' },
    'muelle': { fill: '#0ea5e9', line: '#0284c7', circle: '#0ea5e9' },
    'bodega_almacenamiento': { fill: '#8b5cf6', line: '#6d28d9', circle: '#8b5cf6' },
    'patio_contenedores': { fill: '#a3e635', line: '#4d7c0f', circle: '#a3e635' },
    'patio_vehiculos': { fill: '#14b8a6', line: '#0f766e', circle: '#14b8a6' },
    'almacenamiento_granel': { fill: '#fb923c', line: '#c2410c', circle: '#fb923c' },
    'almacenamiento_liquido': { fill: '#38bdf8', line: '#075985', circle: '#38bdf8' },
    'default': { fill: '#94a3b8', line: '#475569', circle: '#94a3b8' }
};

export const NOMENCLATURA_ENTIDADES = [
    { id: 'naves', label: 'Motonaves en tránsito', color: '#06b6d4' },
    { id: 'clima', label: 'Alertas IDEAM', color: '#8b5cf6' },
    { id: 'accidentes', label: 'Incidentes Viales', color: '#ef4444' },
    { id: 'terrestre', label: 'Flota Terrestre', color: '#10b981' },
    { id: 'peajes', label: 'Peajes (Control)', color: '#eab308' }
];

export const ESTADOS_OPERATIVOS = [
    { id: 'libre', label: 'Libre / Fluido', color: '#22c55e' },
    { id: 'ocupado', label: 'Ocupado / Capacidad Media', color: '#facc15' },
    { id: 'congestionado', label: 'Congestionado / Retraso', color: '#f59e0b' },
    { id: 'critico', label: 'Crítico / Bloqueado', color: '#dc2626' },
    { id: 'desocupado', label: 'Desocupado / Sin Operación', color: '#94a3b8' }
];

export type TipoMapaBase = 'outdoor' | 'terreno' | 'satelite';

@Component({
    selector: 'app-mapa-logistico',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './mapa-logistico.component.html',
    styleUrls: ['./mapa-logistico.component.scss']
})
export class MapaLogisticoComponent implements AfterViewInit, OnInit, OnDestroy, IWidget {
    @ViewChild('mapContainer') mapContainer!: ElementRef;

    @Input() title: string = '';
    @Input() config: any = { colspan: 12 };
    @Input() widgetId?: string;
    @Input() data: any;
    @Input() puertoSeleccionado: any;

    public map!: Map;
    public isDark: boolean = false;
    public estiloBase: TipoMapaBase = 'outdoor';

    private pollingSubscription!: Subscription;
    private subs: Subscription = new Subscription();
    private geocercasSubscription!: Subscription;
    private resizeObserver!: ResizeObserver;
    private alertaSub!: Subscription;
    private peajesGeoJson: any = null;
    private ultimosIncidentes: any = null;
    private ultimaFlotaGeoJson: any = null;
    private lastGeocercaStr: string = '';

    public mostrarCapas: boolean = false;
    public mostrarLeyenda: boolean = false;
    public entidades = NOMENCLATURA_ENTIDADES;
    public estados = ESTADOS_OPERATIVOS;

    private alertaTerrestreSub!: Subscription;
    private maritimoSub!: Subscription;

    public menuCapas = [
        { grupo: 'Operación Marítima', icono: 'directions_boat', abierto: true, capas: [{ id: 'naves', nombre: 'Motonaves en tránsito', activa: true }] },
        { grupo: 'Infraestructura', icono: 'domain', abierto: true, capas: [{ id: 'infra', nombre: 'Puertos y Terminales', activa: true }] },
        {
            grupo: 'Operación Terrestre', icono: 'local_shipping', abierto: true, capas: [
                { id: 'terrestre', nombre: 'Flota en ruta (GPS)', activa: true },
                { id: 'vias', nombre: 'Red Vial Nacional', activa: true },
                { id: 'peajes', nombre: 'Peajes y Geocercas', activa: true }
            ]
        },
        { grupo: 'Riesgos y Clima', icono: 'warning', abierto: true, capas: [{ id: 'accidentes', nombre: 'Incidentes Viales', activa: true }, { id: 'clima', nombre: 'Alertas IDEAM', activa: true }] }
    ];

    constructor(
        private _themeService: ThemeService,
        private _localStorage: LocalStorageService,
        private _torreService: DashboardService,
        public _mapaService: MapaGeneralService,
        public _mapaSocketService: MapSocketService,
        private _filtroTableroService: FiltroTableroService,
        private http: HttpClient,
        private toastr: ToastrService,
        private _socketService: SocketService,
        private ngZone: NgZone
    ) {
        this.isDark = this._localStorage.getThemeSettings()?.isDarkTheme || false;
    }

    @HostBinding('class') get hostClass() {
        return `col-span-${this.config?.colspan || 12}`;
    }

    ngOnInit(): void {
        this.subs.add(this._themeService.isDarkTheme$.subscribe(isDark => {
            this.isDark = isDark;
            if (this.map) {
                this.map.setStyle(this.getStyle());
                this.map.once('style.load', () => this.inicializarCapas());
            }
        }));

        this.subs.add(this._filtroTableroService.ciudad$.subscribe((ciudadEmitida: any) => {
            let idEsperado: string | null = null;
            if (typeof ciudadEmitida === 'string') idEsperado = ciudadEmitida;
            else if (ciudadEmitida?.id_puerto) idEsperado = ciudadEmitida.id_puerto;
            else if (ciudadEmitida?.id) idEsperado = ciudadEmitida.id;
            else if (ciudadEmitida?.target?.value) idEsperado = ciudadEmitida.target.value;

            if (idEsperado) this.verificarCambioDeSessionYVolar(idEsperado, 0);
        }));

        this.cargarPeajesEstaticos();

        // this.alertaSub = this._socketService.listen('alerta-terrestre').subscribe((data: any) => {

        //     console.log('📥 ¡ALERTA TERRESTRE RECIBIDA!', data);
        //     // 🟢 3. Disparamos el Toast Visual en pantalla
        //     this.toastr.info(
        //         `Ingresó a: ${data.geocerca}`,
        //         `🚛 Alerta: Camión ${data.placa}`,
        //         {
        //             timeOut: 6000,
        //             positionClass: 'toast-bottom-right',
        //             progressBar: true
        //         }
        //     );
        // });

        this.iniciarAlertasTerrestres();
        this.iniciarCapaMaritima();
    }

    ngAfterViewInit(): void {
        this.inicializarMapa();

        this.resizeObserver = new ResizeObserver(() => {
            if (this.map) requestAnimationFrame(() => this.map.resize());
        });

        if (this.mapContainer?.nativeElement) {
            this.resizeObserver.observe(this.mapContainer.nativeElement);
        }
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
        if (this.pollingSubscription) this.pollingSubscription.unsubscribe();
        if (this.geocercasSubscription) this.geocercasSubscription.unsubscribe();
        if (this.resizeObserver) this.resizeObserver.disconnect();
        if (this.map) this.map.remove();
        if (this.alertaSub) {
            this.alertaSub.unsubscribe();
        }
        if (this.alertaTerrestreSub) {
            this.alertaTerrestreSub.unsubscribe();
        }

        // Le decimos al backend que salimos de la sala y apagamos la escucha
        this._mapaSocketService.desconectarSalaMaritima();
        if (this.maritimoSub) {
            this.maritimoSub.unsubscribe();
        }
    }

    // ==========================================
    // 1. LÓGICA DE CAMIONES (TOASTS)
    // ==========================================
    private iniciarAlertasTerrestres(): void {
        // Usamos listen() que es el alias que creaste en tu SocketService
        this.alertaTerrestreSub = this._socketService.listen('alerta-terrestre').subscribe((data: any) => {
            console.log('📥 ¡ALERTA TERRESTRE RECIBIDA!', data);

            this.toastr.warning(
                `Ingresó a: ${data.geocerca}`,
                `🚛 Alerta: Camión ${data.placa}`,
                {
                    timeOut: 6000,
                    positionClass: 'toast-bottom-right',
                    progressBar: true
                }
            );
        });
    }

    // ==========================================
    // 2. LÓGICA DE MOTONAVES (BARCOS EN EL MAPA)
    // ==========================================
    private iniciarCapaMaritima(): void {
        // 1. Le pedimos al backend que nos una a la sala de barcos
        this._mapaSocketService.conectarSalaMaritima();

        // 2. Nos suscribimos al BehaviorSubject para reaccionar cada vez que llegue data
        this.maritimoSub = this._mapaSocketService.maritimoData$.subscribe((geoJson) => {

            if (geoJson && geoJson.features && geoJson.features.length > 0) {
                console.log(`✅ ¡El mapa recibió ${geoJson.features.length} barcos!`);

                // 🟢 AQUÍ ACTUALIZAS TU MAPA DE MAPLIBRE/MAPBOX
                // Si ya tienes el mapa cargado, actualizas el "source" con la nueva data:
                // if (this.mapaInstancia.getSource('motonaves-source')) {
                //   this.mapaInstancia.getSource('motonaves-source').setData(geoJson);
                // }
            }
        });
    }

    public cambiarEstiloBase(nuevoEstilo: TipoMapaBase): void {
        if (this.estiloBase === nuevoEstilo) return;
        this.estiloBase = nuevoEstilo;
        if (this.map) {
            this.map.setStyle(this.getStyle());
            this.map.once('style.load', () => this.inicializarCapas());
        }
    }

    public togglePanelCapas(): void {
        this.mostrarCapas = !this.mostrarCapas;
        if (this.mostrarCapas) this.mostrarLeyenda = false;
    }

    public toggleLeyenda(): void {
        this.mostrarLeyenda = !this.mostrarLeyenda;
        if (this.mostrarLeyenda) this.mostrarCapas = false;
    }

    public toggleGrupoMenu(grupo: any): void {
        grupo.abierto = !grupo.abierto;
    }

    private hacerCircular(geojsonOriginal: any, radioMetrosDB?: number): any {
        try {
            if (!geojsonOriginal) return null;
            let geom = geojsonOriginal;
            if (geojsonOriginal.type === 'FeatureCollection') geom = geojsonOriginal.features[0]?.geometry;
            else if (geojsonOriginal.type === 'Feature') geom = geojsonOriginal.geometry;

            if (!geom) return geojsonOriginal;

            // Dibujar círculo usando el radio de la base de datos si existe
            if (radioMetrosDB && radioMetrosDB > 0) {
                const centro = turf.centroid(geom);
                return turf.circle(centro.geometry.coordinates, radioMetrosDB / 1000, { steps: 64, units: 'kilometers' }).geometry;
            }

            // Fallbacks si no viene radio específico
            if (geom.type === 'Point') return turf.circle(geom.coordinates, 2, { steps: 64, units: 'kilometers' }).geometry;

            const centro = turf.centroid(geom);
            const bbox = turf.bbox(geom);
            const puntoBorde = turf.point([centro.geometry.coordinates[0], bbox[1]]);
            let radioKm = turf.distance(centro, puntoBorde, { units: 'kilometers' });

            if (radioKm === 0) radioKm = 1;
            return turf.circle(centro.geometry.coordinates, radioKm, { steps: 64, units: 'kilometers' }).geometry;
        } catch (e) {
            return geojsonOriginal;
        }
    }

    private convertirWKT_ACirculo(wkt: string, radioMetrosDB?: number): any {
        try {
            const geojsonOriginal = parse(wkt);
            return this.hacerCircular(geojsonOriginal, radioMetrosDB);
        } catch (e) {
            return parse(wkt);
        }
    }

    private cargarPeajesEstaticos(): void {
        this.subs.add(
            this.http.get('/assets/data/Peajes_20260705.geojson').subscribe({
                next: (data) => {
                    this.peajesGeoJson = data;
                    if (this.map && this.map.getSource('peajes-source')) {
                        this.actualizarFuente('peajes-source', this.peajesGeoJson);
                    }
                    this.procesarRelacionIncidentePeaje();
                }
            })
        );
    }

    private verificarCambioDeSessionYVolar(idEsperado: string, intento: number): void {
        if (!this.map || !this.map.isStyleLoaded()) return;

        if (!idEsperado || idEsperado === 'ALL') {
            this.irAColombia();
            return;
        }

        const puerto = this._localStorage.getPuertoLocalStorage();
        const idActual = puerto?.id_puerto || puerto?.nombre || '';
        const esPuertoCorrecto = idActual && (idActual.toUpperCase().includes(idEsperado.toUpperCase()) || idEsperado.toUpperCase().includes(idActual.toUpperCase()));

        const currentGeocercaStr = puerto?.geocerca_geo
            ? (typeof puerto.geocerca_geo === 'string' ? puerto.geocerca_geo : JSON.stringify(puerto.geocerca_geo))
            : (puerto?.puerto_geocerca_wkt || '');

        if (currentGeocercaStr && currentGeocercaStr !== this.lastGeocercaStr && esPuertoCorrecto) {
            this.leerSessionYEnfocar(true);
        } else if (intento < 20) {
            setTimeout(() => this.verificarCambioDeSessionYVolar(idEsperado, intento + 1), 250);
        } else {
            this.leerSessionYEnfocar(true);
        }
    }

    private leerSessionYEnfocar(moverCamara: boolean = true): void {
        if (!this.map || !this.map.isStyleLoaded()) return;

        this.map.resize();
        const puerto = this._localStorage.getPuertoLocalStorage();
        const highlightSource = this.map.getSource('highlight-source') as GeoJSONSource;

        if (!puerto || (!puerto.geocerca_geo && !puerto.puerto_geocerca_wkt)) {
            if (moverCamara) this.irAColombia(highlightSource);
            return;
        }

        this.lastGeocercaStr = puerto.geocerca_geo
            ? (typeof puerto.geocerca_geo === 'string' ? puerto.geocerca_geo : JSON.stringify(puerto.geocerca_geo))
            : (puerto.puerto_geocerca_wkt || '');

        let geojsonObj = null;
        try {
            if (puerto.geocerca_geo) {
                geojsonObj = typeof puerto.geocerca_geo === 'string' ? JSON.parse(puerto.geocerca_geo) : puerto.geocerca_geo;
            } else if (puerto.puerto_geocerca_wkt) {
                geojsonObj = parse(puerto.puerto_geocerca_wkt);
            }
            if (geojsonObj) geojsonObj = this.hacerCircular(geojsonObj);
        } catch (e) { }

        if (geojsonObj) {
            let dataToSet: any = { type: 'FeatureCollection', features: [] };
            if (geojsonObj.type === 'FeatureCollection') dataToSet = geojsonObj;
            else if (geojsonObj.type === 'Feature') dataToSet.features.push(geojsonObj);
            else dataToSet.features.push({ type: 'Feature', geometry: geojsonObj, properties: {} });

            if (highlightSource) highlightSource.setData(dataToSet);

            if (!moverCamara) return;

            const bounds = this.calcularBboxDesdeGeoJSON(dataToSet);
            let centroExacto = null;
            if (puerto.ubicacion_geo) {
                try {
                    const ubi = typeof puerto.ubicacion_geo === 'string' ? JSON.parse(puerto.ubicacion_geo) : puerto.ubicacion_geo;
                    centroExacto = turf.center(ubi).geometry.coordinates;
                } catch (e) { }
            }

            if (bounds && centroExacto) {
                const camera = this.map.cameraForBounds(bounds, { padding: 50 });
                const zoomCalculado = camera?.zoom ? Math.min(camera.zoom, 14) : 14;
                this.map.flyTo({ center: centroExacto as [number, number], zoom: zoomCalculado, duration: 2500, essential: true });
            } else if (bounds) {
                this.map.fitBounds(bounds, { padding: 50, duration: 2500, maxZoom: 14, essential: true });
            } else {
                this.irAColombia(highlightSource);
            }
        } else {
            if (moverCamara) this.irAColombia(highlightSource);
        }
    }

    private irAColombia(source?: GeoJSONSource): void {
        if (!this.map) return;
        const highlight = source || this.map.getSource('highlight-source') as GeoJSONSource;
        if (highlight) highlight.setData({ type: 'FeatureCollection', features: [] });
        this.map.resize();
        this.map.flyTo({ center: [-73.5, 4.0], zoom: 5.5, duration: 2000 });
    }

    private calcularBboxDesdeGeoJSON(geojson: any): maplibregl.LngLatBounds | null {
        if (!geojson) return null;
        try {
            const bbox = turf.bbox(geojson);
            return new maplibregl.LngLatBounds([bbox[0], bbox[1]], [bbox[2], bbox[3]]);
        } catch (e) {
            return null;
        }
    }

    private inicializarMapa(): void {
        let mapOptions: any = {
            container: this.mapContainer.nativeElement,
            style: this.getStyle(),
            attributionControl: false,
            center: [-73.5, 4.0],
            zoom: 5.5
        };

        this.map = new maplibregl.Map(mapOptions);

        this.map.on('style.load', () => {
            this.inicializarCapas();
            this.suscribirseADatos();
            this.configurarEventosClicks();

            this.iniciarRadarGeocercas();
            this.iniciarRadarTiempoReal();
        });

        this.map.once('idle', () => {
            const comprobarDimensiones = setInterval(() => {
                if (this.mapContainer.nativeElement.offsetWidth > 0) {
                    clearInterval(comprobarDimensiones);
                    this.map.resize();
                    this.leerSessionYEnfocar(true);
                }
            }, 100);
            setTimeout(() => clearInterval(comprobarDimensiones), 3000);
        });

        this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
    }

    private inicializarCapas(): void {
        const emptyData: any = { type: 'FeatureCollection', features: [] };

        ['infra-source', 'naves-source', 'clima-source', 'alertas-viales-source', 'terrestre-source', 'highlight-source', 'peajes-source', 'geocercas-peajes-source', 'geocercas-kpi-source'].forEach(id => {
            if (!this.map.getSource(id)) {
                const isClusterable = (id === 'terrestre-source' || id === 'alertas-viales-source' || id === 'peajes-source' || id === 'naves-source');
                this.map.addSource(id, {
                    type: 'geojson',
                    data: emptyData,
                    cluster: isClusterable,
                    clusterMaxZoom: 14,
                    clusterRadius: 50
                } as any);
            }
        });

        if (!this.map.getSource('vias-source')) {
            this.map.addSource('vias-source', { type: 'geojson', data: '/assets/data/Red_Vial_20260626.geojson' });
        }

        if (!this.map.getSource('geocercas-maritimas-source')) {
            this.map.addSource('geocercas-maritimas-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        }

        this.map.addLayer({
            id: 'maritima-fill-layer',
            type: 'fill',
            source: 'geocercas-maritimas-source',
            paint: {
                'fill-color': '#06b6d4', // Color azul cian marítimo
                'fill-opacity': 0.2
            }
        });


        if (this.peajesGeoJson) this.actualizarFuente('peajes-source', this.peajesGeoJson);

        const layers = [
            { id: 'puerto-fill', type: 'fill', source: 'infra-source', filter: ['all', ['==', '$type', 'Polygon'], ['==', 'tipo', 'puerto']], paint: { 'fill-color': !this.isDark ? '#60a5fa' : '#3b82f6', 'fill-opacity': 0.15 } },
            { id: 'capa-infra-fill', type: 'fill', source: 'infra-source', filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'tipo', 'puerto']], paint: { 'fill-color': this._getMatchConfig('fill'), 'fill-opacity': 0.7 } },
            { id: 'puerto-line', type: 'line', source: 'infra-source', filter: ['all', ['==', '$type', 'Polygon'], ['==', 'tipo', 'puerto']], paint: { 'line-color': !this.isDark ? '#699dd8' : '#567cf7', 'line-width': 2.5, 'line-dasharray': [4, 2] } },
            { id: 'capa-infra-line', type: 'line', source: 'infra-source', filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'tipo', 'puerto']], paint: { 'line-color': this._getMatchConfig('line'), 'line-width': 1.5 } },

            { id: 'vias-layer', type: 'line', source: 'vias-source', layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'visible' }, paint: { 'line-color': !this.isDark ? '#5d85be' : '#64748b', 'line-width': 1.8, 'line-opacity': 0.75 } },
            { id: 'geocercas-layer', type: 'fill', source: 'geocercas-peajes-source', paint: { 'fill-color': '#eab308', 'fill-opacity': 0.15 } },
            { id: 'geocercas-line-layer', type: 'line', source: 'geocercas-peajes-source', paint: { 'line-color': '#ca8a04', 'line-width': 1, 'line-dasharray': [4, 4] } },
            { id: 'highlight-layer', type: 'line', source: 'highlight-source', paint: { 'line-color': this.isDark ? '#f59e0b' : '#c2410c', 'line-width': 4, 'line-opacity': 0.9, 'line-dasharray': [2, 2] }, layout: { 'line-cap': 'round', 'line-join': 'round' } },

            { id: 'capa-infra-point', type: 'circle', source: 'infra-source', filter: ['==', '$type', 'Point'], paint: { 'circle-radius': 8, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff', 'circle-color': ['match', ['get', 'estado_operativo'], 'libre', '#22c55e', 'ocupado', '#facc15', 'congestionado', '#f59e0b', 'critico', '#dc2626', 'desocupado', '#94a3b8', '#38bdf8'] } },

            { id: 'geocerca-fill-layer', type: 'fill', source: 'geocercas-kpi-source', paint: { 'fill-color': ['match', ['get', 'estado_kpi'], 'ROJO', '#dc2626', 'AMARILLO', '#facc15', 'VERDE', '#22c55e', '#94a3b8'], 'fill-opacity': 0.3 } },
            { id: 'geocerca-line-layer', type: 'line', source: 'geocercas-kpi-source', paint: { 'line-color': '#3b82f6', 'line-width': 2, 'line-dasharray': [4, 2] } },

            { id: 'terrestre-clusters', type: 'circle', source: 'terrestre-source', filter: ['has', 'point_count'], paint: { 'circle-color': '#10b981', 'circle-radius': 15, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' } },
            { id: 'terrestre-cluster-count', type: 'symbol', source: 'terrestre-source', filter: ['has', 'point_count'], layout: { 'text-field': '{point_count}', 'text-size': 12 }, paint: { 'text-color': '#ffffff' } },
            {
                id: 'terrestre-individual',
                type: 'circle',
                source: 'terrestre-source',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': [
                        'case',
                        ['>', ['get', 'velocidad'], 0], '#00ffcc',
                        [
                            'match', ['get', 'estado_camion'],
                            'DETENIDO_POR_TRAFICO', '#f59e0b',
                            'DETENIDO', '#dc2626',
                            'DESCARGANDO', '#0ea5e9',
                            'MANTENIMIENTO', '#8b5cf6',
                            '#475569'
                        ]
                    ],
                    'circle-radius': [
                        'case',
                        ['>', ['get', 'velocidad'], 0], 8,
                        6
                    ],
                    'circle-stroke-width': 1.5,
                    'circle-stroke-color': '#ffffff'
                }
            },
            { id: 'peajes-clusters', type: 'circle', source: 'peajes-source', filter: ['has', 'point_count'], paint: { 'circle-color': '#eab308', 'circle-radius': 15, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' } },
            { id: 'peajes-cluster-count', type: 'symbol', source: 'peajes-source', filter: ['has', 'point_count'], layout: { 'text-field': ['to-string', ['get', 'point_count']], 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12, 'text-allow-overlap': true }, paint: { 'text-color': '#ffffff' } },
            { id: 'peajes-individual', type: 'circle', source: 'peajes-source', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': '#eab308', 'circle-radius': 5, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#ffffff' } },

            { id: 'viales-clusters', type: 'circle', source: 'alertas-viales-source', filter: ['has', 'point_count'], paint: { 'circle-color': '#ef4444', 'circle-radius': 15, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' } },
            { id: 'viales-cluster-count', type: 'symbol', source: 'alertas-viales-source', filter: ['has', 'point_count'], layout: { 'text-field': ['to-string', ['get', 'point_count']], 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12, 'text-allow-overlap': true }, paint: { 'text-color': '#ffffff' } },
            {
                id: 'viales-individual',
                type: 'circle',
                source: 'alertas-viales-source',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': [
                        'match', ['get', 'tipoEvento'],
                        'ACCIDENTE', '#dc2626',
                        'CONGESTION', '#f59e0b',
                        'CIERRE_VIAL', '#000000',
                        'MANTENIMIENTO_OBRA', '#facc15',
                        'ALERTA_CLIMATICA', '#38bdf8',
                        'VEHICULO_AVERIDADO', '#8b5cf6',
                        '#ef4444'
                    ],
                    'circle-radius': [
                        'case', ['>=', ['get', 'nivelSeveridad'], 3], 9, 6
                    ],
                    'circle-stroke-width': [
                        'case', ['==', ['get', 'afectaPeaje'], true], 4, 2
                    ],
                    'circle-stroke-color': '#ffffff'
                }
            },
            { id: 'naves-clusters', type: 'circle', source: 'naves-source', filter: ['has', 'point_count'], paint: { 'circle-color': '#06b6d4', 'circle-radius': 15, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' } },
            { id: 'naves-cluster-count', type: 'symbol', source: 'naves-source', filter: ['has', 'point_count'], layout: { 'text-field': ['to-string', ['get', 'point_count']], 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12, 'text-allow-overlap': true }, paint: { 'text-color': '#ffffff' } },
            { id: 'naves-individual', type: 'circle', source: 'naves-source', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': '#06b6d4', 'circle-radius': 6, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#ffffff' } },
            {
                id: 'naves-nombres',
                type: 'symbol',
                source: 'naves-source',
                filter: ['!', ['has', 'point_count']],
                layout: {
                    'text-field': ['get', 'nombre_motonave'],
                    'text-size': 11,
                    'text-offset': [0, 1],
                    'text-anchor': 'top'
                },
                paint: {
                    'text-color': '#ffffff',
                    'text-halo-color': '#020617',
                    'text-halo-width': 2
                }
            },
            { id: 'clima-layer', type: 'circle', source: 'clima-source', paint: { 'circle-color': '#8b5cf6', 'circle-radius': 7, 'circle-stroke-width': 1, 'circle-stroke-color': '#ffffff' } }
        ];

        layers.forEach(l => {
            try {
                if (this.map.getLayer(l.id)) this.map.removeLayer(l.id);
                this.map.addLayer(l as any);
            } catch (e) { }
        });

        this._mapaService.cargarDatosIniciales();
    }

    // 🟢 INICIO DE RADAR Y PETICIÓN AL SERVICIO
    private iniciarRadarGeocercas(): void {
        this.consultarYPintarGeocercas();
        this.geocercasSubscription = interval(30000).subscribe(() => {
            this.consultarYPintarGeocercas();
        });
    }

    private consultarYPintarGeocercas(): void {
        this._mapaService.getGeocercasKPIs().subscribe({
            next: (res: any) => {
                if (!res.data) return;

                const features = res.data.map((item: any) => ({
                    type: 'Feature',
                    geometry: this.convertirWKT_ACirculo(item.wkt, item.radio_metros),
                    properties: {
                        nombre_faro: item.nombre_faro,
                        tipo_faro: item.tipo_faro,
                        estado_kpi: item.estado_kpi,
                        // Camiones
                        total_camiones: item.total_camiones,
                        camiones_ruta: item.camiones_ruta,
                        camiones_detenidos: item.camiones_detenidos,
                        // Naves
                        total_naves: item.total_naves,
                        naves_fondeadas: item.naves_fondeadas,
                        naves_avisadas: item.naves_avisadas,
                        naves_arribadas: item.naves_arribadas
                    }
                }));

                this.actualizarFuente('geocercas-kpi-source', { type: 'FeatureCollection', features });
            },
            error: (err) => console.error("Error radar Faros en el componente:", err)
        });
    }

    private iniciarRadarTiempoReal(): void {
        this.pollingSubscription = interval(10000).subscribe(() => {
            this._mapaService.getFlotaGeoJSON().subscribe({
                next: (nuevoGeoJSON) => {
                    this.ultimaFlotaGeoJson = nuevoGeoJSON;
                    const source = this.map?.getSource('terrestre-source') as GeoJSONSource;
                    if (source) {
                        source.setData(nuevoGeoJSON);
                    }
                }
            });
        });
    }

    private suscribirseADatos() {
        this.subs.add(this._mapaService.gemeloDigital$.subscribe(data => {
            if (!data) return;
            if (data.CAPA_INFRAESTRUCTURA) this.actualizarFuente('infra-source', this.procesarInfraestructuraWkt(data.CAPA_INFRAESTRUCTURA));
            if (data.CAPA_TERRESTRE) {
                this.ultimaFlotaGeoJson = data.CAPA_TERRESTRE;
                this.actualizarFuente('terrestre-source', data.CAPA_TERRESTRE);
            }
            if (data.CAPA_CLIMA) this.actualizarFuente('clima-source', data.CAPA_CLIMA);
            if (data.CAPA_VIAS) this.actualizarFuente('vias-source', data.CAPA_VIAS);
        }));

        this.subs.add(this._mapaService.naves$.subscribe(data => { if (data) this.actualizarFuente('naves-source', data); }));

        this.subs.add(this._mapaService.accidentes$.subscribe(data => {
            this.ultimosIncidentes = data;
            this.procesarRelacionIncidentePeaje();
        }));

        this.subs.add(this._mapaService.visibilidad$.subscribe(vis => {
            if (!this.map || !this.map.isStyleLoaded()) return;

            const isInfraVisible = vis['infra'] !== false;

            const mapping = [
                { id: 'vias-layer', visible: vis['vias'] },
                { id: 'naves-clusters', visible: vis['naves'] },
                { id: 'naves-cluster-count', visible: vis['naves'] },
                { id: 'naves-individual', visible: vis['naves'] },
                { id: 'capa-infra-fill', visible: isInfraVisible },
                { id: 'capa-infra-line', visible: isInfraVisible },
                { id: 'capa-infra-point', visible: isInfraVisible },
                { id: 'puerto-fill', visible: isInfraVisible },
                { id: 'puerto-line', visible: isInfraVisible },
                { id: 'terrestre-clusters', visible: vis['terrestre'] },
                { id: 'terrestre-cluster-count', visible: vis['terrestre'] },
                { id: 'terrestre-individual', visible: vis['terrestre'] },
                { id: 'clima-layer', visible: vis['clima'] },
                { id: 'viales-clusters', visible: vis['accidentes'] },
                { id: 'viales-cluster-count', visible: vis['accidentes'] },
                { id: 'viales-individual', visible: vis['accidentes'] },
                { id: 'peajes-clusters', visible: vis['peajes'] !== false },
                { id: 'peajes-cluster-count', visible: vis['peajes'] !== false },
                { id: 'peajes-individual', visible: vis['peajes'] !== false },
                { id: 'geocercas-layer', visible: vis['peajes'] !== false },
                { id: 'geocercas-line-layer', visible: vis['peajes'] !== false }
            ];

            mapping.forEach(m => {
                if (this.map.getLayer(m.id)) {
                    this.map.setLayoutProperty(m.id, 'visibility', m.visible ? 'visible' : 'none');
                }
            });
        }));
    }

    private procesarRelacionIncidentePeaje(): void {
        const geocercasFeatures: any[] = [];

        if (this.peajesGeoJson && this.peajesGeoJson.features) {
            this.peajesGeoJson.features.forEach((peaje: any) => {
                if (peaje.geometry && peaje.geometry.coordinates) {
                    const puntoTurf = turf.point(peaje.geometry.coordinates);
                    const buffer2km = turf.buffer(puntoTurf, 2, { units: 'kilometers' });
                    if (buffer2km) {
                        buffer2km.properties = { nombrePeaje: peaje.properties?.nombre || 'Peaje' };
                        geocercasFeatures.push(buffer2km);
                    }
                }
            });
            this.actualizarFuente('geocercas-peajes-source', { type: 'FeatureCollection', features: geocercasFeatures });
        }

        if (!this.ultimosIncidentes || !this.ultimosIncidentes.features) return;

        this.ultimosIncidentes.features.forEach((incidente: any) => {
            incidente.properties.afectaPeaje = false;
            incidente.properties.peajeAfectado = '';

            if (incidente.geometry && incidente.geometry.coordinates && geocercasFeatures.length > 0) {
                const puntoIncidente = turf.point(incidente.geometry.coordinates);
                for (const geocerca of geocercasFeatures) {
                    if (turf.booleanPointInPolygon(puntoIncidente, geocerca)) {
                        incidente.properties.afectaPeaje = true;
                        incidente.properties.peajeAfectado = geocerca.properties.nombrePeaje;
                        break;
                    }
                }
            }
        });

        this.actualizarFuente('alertas-viales-source', this.ultimosIncidentes);
    }

    private procesarInfraestructuraWkt(puertosArray: any[]): any {
        const features: any[] = [];
        if (!Array.isArray(puertosArray)) return { type: 'FeatureCollection', features };

        puertosArray.forEach(puerto => {
            if (puerto.puerto_geocerca_wkt) {
                const geo = this.convertirWKT_ACirculo(puerto.puerto_geocerca_wkt);
                if (geo) features.push({ type: 'Feature', geometry: geo as any, properties: { id: puerto.id_puerto, nombre: puerto.nombre_puerto, tipo: 'puerto' } });
            }
            if (Array.isArray(puerto.terminales)) {
                puerto.terminales.forEach((terminal: any) => {
                    if (terminal.terminal_geocerca_wkt) {
                        const geo = parse(terminal.terminal_geocerca_wkt);
                        if (geo) features.push({ type: 'Feature', geometry: geo as any, properties: { id: terminal.id_terminal, nombre: terminal.nombre_terminal, tipo: 'terminal' } });
                    }
                    if (Array.isArray(terminal.muelles)) {
                        terminal.muelles.forEach((muelle: any) => {
                            if (muelle.muelle_geocerca_wkt) {
                                const geo = parse(muelle.muelle_geocerca_wkt);
                                if (geo) features.push({ type: 'Feature', geometry: geo as any, properties: { id: muelle.id_interno, nombre: muelle.nombre_muelle, tipo: 'muelle' } });
                            }
                        });
                    }
                    if (Array.isArray(terminal.infraestructuras)) {
                        terminal.infraestructuras.forEach((infra: any) => {
                            const tipo = infra.tipo_infra ? infra.tipo_infra.toLowerCase() : 'infra_general';
                            if (infra.infra_geocerca_wkt) {
                                const geo = parse(infra.infra_geocerca_wkt);
                                if (geo) features.push({ type: 'Feature', geometry: geo as any, properties: { id: infra.id_infraestructura, nombre: infra.nombre_infra, tipo } });
                            } else if (infra.latitud && infra.longitud) {
                                features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [infra.longitud, infra.latitud] }, properties: { id: infra.id_infraestructura, nombre: infra.nombre_infra, tipo, estado_operativo: infra.estado_operativo } });
                            }
                        });
                    }
                });
            }
        });
        return { type: 'FeatureCollection', features };
    }

    private configurarEventosClicks(): void {
        const capasClickeables = ['capa-infra-fill', 'capa-infra-point', 'naves-individual', 'terrestre-individual', 'viales-individual', 'clima-layer', 'peajes-individual', 'geocerca-fill-layer'];

        capasClickeables.forEach(layerId => {
            if (this.map.getLayer(layerId)) {
                this.map.on('click', layerId, (e) => {
                    if (!e.features || e.features.length === 0) return;
                    const html = this._generarContenidoPopup(layerId, e.features[0]);
                    const themeClass = this.isDark ? 'popup-dark' : 'popup-light';
                    new maplibregl.Popup({ closeButton: true, className: `qplus-popup popup-${layerId} ${themeClass}` })
                        .setLngLat(e.lngLat).setHTML(html).addTo(this.map);
                });
                this.map.on('mouseenter', layerId, () => this.map.getCanvas().style.cursor = 'pointer');
                this.map.on('mouseleave', layerId, () => this.map.getCanvas().style.cursor = '');
            }
        });
    }

    private _generarContenidoPopup(layerId: string, feature: any): string {
        const data = feature.properties || {};

        switch (layerId) {
            case 'capa-infra-fill':
            case 'capa-infra-point':
                return `<div class="custom-map-popup infra"><h3>${data.nombre || 'Sin nombre'}</h3><p><strong>Tipo:</strong> ${data.tipo ? data.tipo.toUpperCase() : 'N/A'}</p></div>`;

            case 'naves-individual':
                // Protegemos contra nulos en caso de que sea una nave en tránsito sin match
                const estadoNave = data.estado_nave || 'EN TRÁNSITO';
                const omi = data.omi || 'N/A';
                const bandera = data.bandera || 'Desconocida';
                const eta = data.eta || '--';
                const agencia = data.agencia || '--';
                const velocidadnv = data.velocidad !== null ? `${data.velocidad} nudos` : '--';
                const destinoAis = data.destino_ais || '--';
                const procedencia = data.puerto_procedencia || '--';
                const terminal = data.instalacion_portuaria || '--';
                const calado = data.calado ? `${data.calado} m` : '--';

                // Colores dinámicos según el estado
                let badgeColor = '#64748b'; // Gris para tránsito
                if (estadoNave === 'AVISADAS') badgeColor = '#a855f7'; // Morado
                if (estadoNave === 'FONDEADAS') badgeColor = '#facc15'; // Amarillo
                if (estadoNave === 'ARRIBADAS') badgeColor = '#22c55e'; // Verde

                return `
        <div class="custom-map-popup nave-popup" style="min-width: 290px;">
            <div class="qplus-popup-header" style="border-bottom: 2px solid #06b6d4; padding-bottom: 10px; margin-bottom: 10px;">
                <h3 style="color:#06b6d4; margin:0 0 6px 0; font-size: 16px;">🚢 ${data.nombre_motonave || 'Desconocida'}</h3>

                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <span style="background-color: #334155; color: #fff; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">MMSI: ${data.mmsi || 'N/A'}</span>
                    <span style="background-color: ${badgeColor}; color: ${estadoNave === 'FONDEADAS' ? '#000' : '#fff'}; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">${estadoNave}</span>
                </div>
            </div>

            <div class="qplus-popup-body" style="font-size: 12px;">
                <!-- SECCIÓN AIS (TELEMETRÍA CRUDA) -->
                <div style="margin-bottom: 10px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 2px 0; color: #94a3b8; width: 35%;">Bandera:</td><td style="padding: 2px 0; font-weight: bold;">${bandera}</td></tr>
                        <tr><td style="padding: 2px 0; color: #94a3b8;">Velocidad:</td><td style="padding: 2px 0; font-weight: bold;">${velocidadnv}</td></tr>
                        <tr><td style="padding: 2px 0; color: #94a3b8;">Destino AIS:</td><td style="padding: 2px 0; font-weight: bold;">${destinoAis}</td></tr>
                    </table>
                </div>

                <!-- SECCIÓN ADMINISTRATIVA (SOLO SI HAY MATCH) -->
                <div style="border-top: 1px dashed #475569; padding-top: 10px; opacity: ${estadoNave === 'EN TRÁNSITO' ? '0.4' : '1'};">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 2px 0; color: #94a3b8; width: 35%;">Procedencia:</td><td style="padding: 2px 0; font-weight: bold;">${procedencia}</td></tr>
                        <tr><td style="padding: 2px 0; color: #94a3b8;">Agencia:</td><td style="padding: 2px 0; font-weight: bold;">${agencia}</td></tr>
                        <tr><td style="padding: 2px 0; color: #94a3b8;">ETA:</td><td style="padding: 2px 0; font-weight: bold; color: #facc15;">${eta}</td></tr>
                        <tr><td style="padding: 2px 0; color: #94a3b8;">Terminal:</td><td style="padding: 2px 0; font-weight: bold; color: #22c55e;">${terminal}</td></tr>
                        <tr><td style="padding: 2px 0; color: #94a3b8;">Calado/OMI:</td><td style="padding: 2px 0; font-weight: bold;">${calado} / ${omi}</td></tr>
                    </table>
                </div>
            </div>
        </div>
    `;

            // 🟢 POPUP DE FAROS CON INFORMACIÓN DESGLOSADA
            case 'geocerca-fill-layer':
                const colorKpi = data.estado_kpi === 'ROJO' ? '#dc2626' : (data.estado_kpi === 'AMARILLO' ? '#facc15' : '#22c55e');
                const textoColor = data.estado_kpi === 'AMARILLO' ? '#000' : '#fff';

                // Definir si mostramos el bloque marítimo, el terrestre, o ambos
                const htmlTerrestre = data.total_camiones > 0 || data.tipo_faro !== 'MARITIMA' ? `
                    <div style="margin-top: 8px; border-top: 1px solid #334155; padding-top: 8px;">
                        <div style="margin-bottom: 4px;"><strong>🚛 Terrestre en zona:</strong> ${data.total_camiones}</div>
                        <div style="margin-bottom: 4px; color: #22c55e; font-size: 11px;">&nbsp;↳ En movimiento: ${data.camiones_ruta}</div>
                        <div style="margin-bottom: 4px; color: #ef4444; font-size: 11px;">&nbsp;↳ Detenidos/Filas: ${data.camiones_detenidos}</div>
                    </div>
                ` : '';

                const navesClasificadas = data.naves_fondeadas + data.naves_avisadas + data.naves_arribadas;
                const navesTránsito = data.total_naves - navesClasificadas;

                const htmlMaritimo = data.total_naves > 0 || data.tipo_faro === 'MARITIMA' ? `
                    <div style="margin-top: 8px; border-top: 1px solid #334155; padding-top: 8px;">
                        <div style="margin-bottom: 4px; color: #06b6d4;"><strong>🚢 Naves en zona:</strong> ${data.total_naves}</div>
                        <div style="margin-bottom: 4px; color: #facc15; font-size: 11px;">&nbsp;↳ Fondeadas (Espera): ${data.naves_fondeadas}</div>
                        <div style="margin-bottom: 4px; color: #a855f7; font-size: 11px;">&nbsp;↳ Avisadas (Aprox): ${data.naves_avisadas}</div>
                        <div style="margin-bottom: 4px; color: #22c55e; font-size: 11px;">&nbsp;↳ Arribadas (Muelle): ${data.naves_arribadas}</div>
                        <div style="margin-bottom: 4px; color: #94a3b8; font-size: 11px;">&nbsp;↳ Tránsito / Sin match: ${navesTránsito}</div>
                    </div>
                ` : '';

                return `
                    <div class="custom-map-popup kpi" style="min-width: 230px;">
                        <div class="qplus-popup-header" style="border-bottom: 2px solid ${colorKpi}; padding-bottom: 8px;">
                            <h3 style="color:${colorKpi}; margin:0; font-size: 15px;">📍 ${data.nombre_faro}</h3>
                            <span class="qplus-badge" style="background-color:${colorKpi}; color: ${textoColor}; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: bold; margin-top: 5px; display: inline-block;">
                                ESTADO ${data.estado_kpi}
                            </span>
                        </div>
                        <div class="qplus-popup-body" style="font-size: 13px;">
                            ${htmlTerrestre}
                            ${htmlMaritimo}
                        </div>
                    </div>
                `;
            case 'viales-individual':
                const tipo = data.tipoEvento ? data.tipoEvento.replace(/_/g, ' ') : 'ALERTA VIAL';
                const sev = parseInt(data.nivelSeveridad, 10);

                let sevBadgeClass = 'success';
                let sevText = '🟢 BAJA';
                if (sev >= 3) { sevBadgeClass = 'danger'; sevText = '🔴 ALTA'; }
                else if (sev === 2) { sevBadgeClass = 'warning'; sevText = '🟠 MEDIA'; }

                let fechaVial = 'Fecha desconocida';
                if (data.fechaInicio) {
                    fechaVial = new Date(data.fechaInicio).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                }

                let htmlVial = `
                    <div class="qplus-popup-header">
                        <h3>🚨 ${tipo}</h3>
                        <span class="qplus-badge ${sevBadgeClass}">${sevText}</span>
                    </div>
                    <div class="qplus-popup-body">
                        <div class="qplus-col">
                            <span class="qplus-label">📍 Corredor:</span>
                            <span class="qplus-value">${data.corredor || data.corredorVial || 'No especificado'}</span>
                        </div>
                        <div class="qplus-col">
                            <span class="qplus-label">🛣️ Sector:</span>
                            <span class="qplus-value">${data.sector || 'No especificado'}</span>
                        </div>
                        <div class="qplus-col">
                            <span class="qplus-label">🕒 Reportado:</span>
                            <span class="qplus-value">${fechaVial}</span>
                        </div>
                        <div class="qplus-divider" style="color: #e2e8f0; font-size: 11px; max-height: 80px; overflow-y: auto;">
                            ${data.descripcion || 'Sin descripción detallada.'}
                        </div>
                `;

                if (data.afectaPeaje === true || data.afectaPeaje === 'true') {
                    htmlVial += `<div class="qplus-alert-box">⚠️ CRÍTICO: Cerca a ${data.peajeAfectado}</div>`;
                }
                return htmlVial + `</div>`;

            case 'terrestre-individual':
                const placa = data.placa || 'SIN PLACA';
                const conductor = data.conductor || 'No asignado';
                const velocidad = data.velocidad !== undefined ? data.velocidad : 0;

                const estadoCrudo = data.estado_camion || data.estado || 'DESCONOCIDO';
                const estadoCamion = estadoCrudo.replace(/_/g, ' ').toUpperCase();

                let estadoBadgeClass = 'warning';
                let estadoText = `🟡 ${estadoCamion}`;

                if (estadoCamion.includes('RUTA')) { estadoBadgeClass = 'success'; estadoText = '🟢 EN RUTA'; }
                else if (estadoCamion.includes('TRAFICO') || estadoCamion.includes('TRÁFICO')) { estadoBadgeClass = 'danger'; estadoText = '🟠 TRÁFICO'; }
                else if (estadoCamion.includes('DETENIDO')) { estadoBadgeClass = 'danger'; estadoText = '🔴 DETENIDO'; }
                else if (estadoCamion.includes('DESCARGANDO')) { estadoBadgeClass = 'info'; estadoText = '🔵 DESCARGANDO'; }

                return `
                    <div class="qplus-popup-header">
                        <h3>🚛 ${placa}</h3>
                        <span class="qplus-badge ${estadoBadgeClass}">${estadoText}</span>
                    </div>
                    <div class="qplus-popup-body">
                        <div class="qplus-row">
                            <span class="qplus-label">👨‍✈️ Conductor:</span>
                            <span class="qplus-value">${conductor}</span>
                        </div>
                        <div class="qplus-row">
                            <span class="qplus-label">💨 Velocidad:</span>
                            <span class="qplus-value" style="color: ${velocidad > 0 ? '#38bdf8' : '#f1f5f9'};">${velocidad} km/h</span>
                        </div>
                        <div class="qplus-row">
                            <span class="qplus-label">🚚 Tipo:</span>
                            <span class="qplus-value">${data.tipo_camion || 'Furgón'}</span>
                        </div>
                    </div>
                `;

            case 'peajes-individual':
                const nombrePeaje = data.nombre || 'Punto de Control';
                let totalCamiones = 0;
                let incidentesCercanos = 0;
                let tieneIncidenteCritico = false;

                try {
                    if (feature.geometry && feature.geometry.coordinates) {
                        const centroPeaje = turf.point(feature.geometry.coordinates);
                        const areaInfluencia = turf.buffer(centroPeaje, 2, { units: 'kilometers' });

                        if (areaInfluencia) {
                            if (this.ultimaFlotaGeoJson && this.ultimaFlotaGeoJson.features) {
                                this.ultimaFlotaGeoJson.features.forEach((camion: any) => {
                                    if (camion.geometry && camion.geometry.coordinates) {
                                        if (turf.booleanPointInPolygon(turf.point(camion.geometry.coordinates), areaInfluencia as any)) {
                                            totalCamiones++;
                                        }
                                    }
                                });
                            }

                            if (this.ultimosIncidentes && this.ultimosIncidentes.features) {
                                this.ultimosIncidentes.features.forEach((inc: any) => {
                                    if (inc.geometry && inc.geometry.coordinates) {
                                        if (turf.booleanPointInPolygon(turf.point(inc.geometry.coordinates), areaInfluencia as any)) {
                                            incidentesCercanos++;
                                            if (inc.properties.nivelSeveridad >= 3) {
                                                tieneIncidenteCritico = true;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                } catch (e) {
                    console.warn("Error calculando KPI de peaje", e);
                }

                let estadoKpiP = 'VERDE';
                let colorHexP = '#22c55e';
                let estadoTextoP = 'Flujo Normal';

                if (tieneIncidenteCritico || totalCamiones >= 20) {
                    estadoKpiP = 'ROJO';
                    colorHexP = '#dc2626';
                    estadoTextoP = 'Crítico / Congestión';
                } else if (incidentesCercanos > 0 || totalCamiones >= 5) {
                    estadoKpiP = 'AMARILLO';
                    colorHexP = '#facc15';
                    estadoTextoP = 'Tráfico Denso';
                }

                return `
                    <div class="custom-map-popup kpi" style="min-width: 200px;">
                        <div class="qplus-popup-header" style="border-bottom: 2px solid ${colorHexP}; padding-bottom: 8px; margin-bottom: 8px;">
                            <h3 style="color:${colorHexP}; margin:0; font-size: 15px;">🏢 ${nombrePeaje}</h3>
                            <span class="qplus-badge" style="background-color:${colorHexP}; color: ${estadoKpiP === 'AMARILLO' ? '#000' : '#fff'}; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: bold; margin-top: 5px; display: inline-block;">
                                ESTADO ${estadoKpiP}
                            </span>
                        </div>
                        <div class="qplus-popup-body" style="font-size: 13px;">
                            <div style="margin-bottom: 4px;"><strong>🚦 Operación:</strong> ${estadoTextoP}</div>
                            <div style="margin-bottom: 4px;"><strong>🚛 Camiones en zona (2km):</strong> ${totalCamiones}</div>
                            <div style="margin-bottom: 4px;"><strong>⚠️ Incidentes cercanos:</strong> ${incidentesCercanos}</div>
                        </div>
                    </div>
                `;
            case 'geocerca-fill-layer':
                const colorKpi2 = data.estado_kpi === 'ROJO' ? '#dc2626' : (data.estado_kpi === 'AMARILLO' ? '#facc15' : '#22c55e');

                return `
                    <div class="custom-map-popup kpi" style="min-width: 210px;">
                        <div class="qplus-popup-header" style="border-bottom: 2px solid ${colorKpi2};">
                            <h3 style="color:${colorKpi2}; margin:0; font-size: 15px;">📍 ${data.nombre_faro}</h3>
                        </div>
                        <div class="qplus-popup-body" style="font-size: 13px; padding-top: 10px;">
                            <div style="margin-bottom: 4px;"><strong>🚛 Total Camiones:</strong> ${data.total_camiones}</div>
                            <div style="margin-bottom: 4px; color: #06b6d4;"><strong>🚢 Total Motonaves:</strong> ${data.total_naves}</div>
                        </div>
                    </div>
                `;
            default:
                return `<div class="custom-map-popup"><h3>Información</h3></div>`;
        }
    }

    private actualizarFuente(sourceId: string, data: any): void {
        if (!this.map || !this.map.getSource(sourceId)) return;
        (this.map.getSource(sourceId) as any).setData(data);
    }

    private getStyle(): string {
        const MAPTILER_KEY = 'WMNuRXDl7kbmZ19cOGo2';

        switch (this.estiloBase) {
            case 'terreno':
                return this.isDark
                    ? `https://api.maptiler.com/maps/topo-v2-dark/style.json?key=${MAPTILER_KEY}`
                    : `https://api.maptiler.com/maps/topo-v2/style.json?key=${MAPTILER_KEY}`;
            case 'satelite':
                return `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`;
            case 'outdoor':
            default:
                return this.isDark
                    ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_KEY}`
                    : `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;
        }
    }

    public centrarMapa(): void {
        this.leerSessionYEnfocar(true);
    }

    public maximizar(): void {
        this._torreService.abrirModoEnfoque(this.widgetId || '', []);
    }

    public toggleCapaMenu(capaId: string, event: any): void {
        const estado = event.target.checked;
        this._mapaService.actualizarVisibilidadCapa(capaId, estado);
    }

    private _getMatchConfig(property: 'fill' | 'line' | 'circle'): any[] {
        const matchArray: any[] = ['match', ['get', 'tipo']];
        Object.entries(INFRA_THEME).forEach(([tipo, colores]) => {
            if (tipo !== 'default') matchArray.push(tipo, colores[property]);
        });
        matchArray.push(INFRA_THEME['default'][property]);
        return matchArray;
    }

    public toggleMapaBase(): void {
        const nuevoEstilo = this.estiloBase === 'satelite' ? 'outdoor' : 'satelite';
        this.cambiarEstiloBase(nuevoEstilo);
    }
}
