import { Component, forwardRef, ElementRef, ViewChild, OnDestroy, HostBinding, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../service/theme.service';
import { LocalStorageService } from 'src/app/theme/shared/service/local-storage.service';
import { mapboxDrawStyles } from './mapbox-draw-styles';

@Component({
    selector: 'app-mapa-selector',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './mapa-selector.component.html',
    styleUrls: ['./mapa-selector.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MapaSelectorComponent),
            multi: true
        }
    ]
})
export class MapaSelectorComponent implements ControlValueAccessor, OnInit, OnDestroy {
    @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
    @HostBinding('class.is-invalid') invalid = false;
    private _savedFeatures: any = null;
    @Input() modo: 'punto' | 'poligono' | 'linea' = 'punto';
    @Input() set savedFeatures(value: any) {
        console.log("📥 [Hijo] El padre inyectó:", value); // <-- AQUÍ
        this._savedFeatures = value;

        if (this.draw && value) {
            this.restoreFilteredData();
        }
    }
    isModalOpen: boolean = false;
    private map!: maplibregl.Map;
    protected draw!: MapboxDraw;

    @Output() onConfirm = new EventEmitter<any>();

    // Agrega este getter público

    private marker: maplibregl.Marker | null = null;
    public isDark: boolean = false;
    private subs: Subscription = new Subscription();
    public currentSelectionMode: 'point' | 'polygon' = 'polygon';
    private innerValue: any = { ubicacion: null, geocerca: null };
    private tempValue: any = { ubicacion: null, geocerca: null };
    private savedFeatureCollection: any = null;
    private onChange = (val: any) => { };
    private onTouched = () => { };

    constructor(
        private _themeService: ThemeService,
        private _localStorage: LocalStorageService
    ) {
        this.isDark = this._localStorage.getThemeSettings()?.isDarkTheme || false;
    }

    get savedFeatures(): any {
        return this._savedFeatures;
    }

    public get drawInstance(): MapboxDraw {
        return this.draw;
    }

    ngOnInit(): void {
        this.subs.add(
            this._themeService.isDarkTheme$.subscribe((isDark) => {
                this.isDark = isDark;

                // Si el mapa ya está inicializado y abierto en el modal
                if (this.map && this.map.loaded()) {
                    this.map.setStyle(this.getStyle());

                    // CRÍTICO: MapLibre borra los elementos al cambiar el estilo base.
                    // Esperamos a que cargue el nuevo tema y volvemos a pintar los marcadores/polígonos.
                    this.map.once('style.load', () => {
                        this.refreshMapState();
                    });
                }
            })
        );
    }

    openModal() {
        this.isModalOpen = true;
        this.tempValue = JSON.parse(JSON.stringify(this.innerValue));
        console.log("📤 [Padre] Pasando al hijo:", this._savedFeatures);
        setTimeout(() => this.initMap(), 100);
    }

    closeModal() {
        this.isModalOpen = false;
        if (this.map) this.map.remove();
    }

    confirmSelection() {
        this.innerValue = JSON.parse(JSON.stringify(this.tempValue));
        const data = this.draw.getAll();
        this.onConfirm.emit(data);
        console.log("📤 [Hijo] Enviando al padre:", data);
        this.emitChange();
        if (this.draw) {
            this.savedFeatureCollection = this.draw.getAll();
            console.log('feature saved', this.savedFeatureCollection);
        }
        this.closeModal();
    }

    getDisplayText(): string {
        // --- MODO PUNTO ---
        if (this.modo === 'punto') {
            // Busca en el estado actual o cae de respaldo a los datos de la BD
            const ubicacion = this.innerValue?.ubicacion ||
                this._savedFeatures?.ubicacion ||
                (this._savedFeatures?.lat ? this._savedFeatures : null);

            if (ubicacion && ubicacion.lat !== undefined && ubicacion.lon !== undefined) {
                return `📍 Lat: ${ubicacion.lat.toFixed(4)}, Lon: ${ubicacion.lon.toFixed(4)}`;
            }
        }

        // --- MODO POLÍGONO ---
        if (this.modo === 'poligono') {
            // Verifica si hay una geocerca configurada actualmente o si el padre pasó una desde la BD
            const tieneGeocerca = this.innerValue?.geocerca || this._savedFeatures;

            if (tieneGeocerca) {
                return '🗺️ Polígono delimitado configurado';
            }
        }

        return '';
    }

    private initMap(): void {
        if (!this.mapContainer) return;

        this.map = new maplibregl.Map({
            container: this.mapContainer.nativeElement,
            style: this.getStyle(), // Corrección: Ahora usa la función dinámica
            center: this.tempValue?.ubicacion ? [this.tempValue.ubicacion.lon, this.tempValue.ubicacion.lat] : [-75.5, 6.2],
            zoom: this.tempValue?.ubicacion ? 14 : 5,
            attributionControl: false
        });

        this.map.on('load', () => {
            this.draw = new MapboxDraw({
                displayControlsDefault: false,
                styles: mapboxDrawStyles,
                controls: {
                    polygon: false,
                    trash: false
                }
            });

            this.map.addControl(this.draw as unknown as maplibregl.IControl);
            // --- AQUÍ APLICAMOS EL FILTRO POR TIPO ---
            if (this.savedFeatures) {
                this.restoreFilteredData();
            }

            this.map.on('styledata', () => {
                const style = this.map.getStyle();
                if (!style || !style.layers) return;
                style.layers.forEach((layer: any) => {
                    if (layer.id.includes('gl-draw') && layer.paint && layer.paint['line-dasharray']) {
                        const dash = layer.paint['line-dasharray'];
                        if (Array.isArray(dash) && dash.length > 0 && typeof dash[0] === 'number') {
                            this.map.setPaintProperty(layer.id, 'line-dasharray', ["literal", dash]);
                        }
                    }
                });
            });

            this.map.on('click', (e) => {
                if (this.modo === 'poligono') return;

                const target = e.originalEvent.target as HTMLElement;
                if (target.closest('.mapboxgl-ctrl-group') || target.closest('.mapboxgl-ctrl')) return;

                this.handlePointPlacement(e.lngLat);
            });

            if (this.modo === 'poligono') {
                this.map.on('draw.create', (e) => this.updateGeocerca(e.features[0]));
                this.map.on('draw.update', (e) => this.updateGeocerca(e.features[0]));
                this.map.on('draw.delete', () => this.updateGeocerca(null));
            }

            this.refreshMapState();
        });
    }

    restoreFilteredData() {
        if (!this.draw) return;

        try {
            this.draw.deleteAll();
        } catch (e) { }

        const dataToProcess = this._savedFeatures;
        if (!dataToProcess) return;

        // 1. Extraer el dato real del contenedor
        let rawData = dataToProcess.type ? dataToProcess :
            (this.modo === 'punto' ? dataToProcess.ubicacion : dataToProcess.geocerca);

        if (!rawData) return;

        // 2. Normalizar la estructura para MapboxDraw
        let featureCollection: any;

        if (rawData.type === 'FeatureCollection') {
            featureCollection = rawData;
        } else if (rawData.type === 'Feature') {
            // NUEVO: Si la base de datos ya envió un Feature, no lo volvemos a envolver
            featureCollection = {
                type: 'FeatureCollection',
                features: [rawData]
            };
        } else {
            // Si es la geometría pura (Polygon o Point), la envolvemos en un Feature
            featureCollection = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: rawData.type ? rawData : { type: 'Point', coordinates: [rawData.lon, rawData.lat] },
                    properties: {}
                }]
            };
        }

        // 3. Validación Final y Pintado
        if (featureCollection.features && featureCollection.features.length > 0) {
            // Filtramos features inválidas por seguridad
            featureCollection.features = featureCollection.features.filter((f: any) => f.geometry && f.geometry.type);

            if (featureCollection.features.length > 0) {
                console.log("🎨 Dibujando ahora mismo:", featureCollection);
                try {
                    this.draw.add(featureCollection);
                } catch (error) {
                    console.error("Error al pintar la geocerca. Revisa la estructura del GeoJSON:", error);
                }
            }
        }
    }

    activatePolygonMode() {
        this.draw.changeMode('draw_polygon');
    }

    deleteSelected() {
        this.draw.trash(); // El método nativo de Mapbox para borrar
    }

    private handlePointPlacement(lngLat: maplibregl.LngLat) {
        this.tempValue.ubicacion = { lat: lngLat.lat, lon: lngLat.lng };
        this.renderMarker();
    }

    private renderMarker() {
        if (this.marker) this.marker.remove();
        if (this.modo === 'punto' && this.tempValue.ubicacion) {
            this.marker = new maplibregl.Marker({ color: '#FF0000' })
                .setLngLat([this.tempValue.ubicacion.lon, this.tempValue.ubicacion.lat])
                .addTo(this.map);
        }
    }

    private updateGeocerca(feature: any) {
        if (!feature) {
            this.tempValue.geocerca = null;
            return;
        }

        // 1. Si es un Feature estándar de GeoJSON (tiene 'geometry')
        if (feature.geometry && feature.geometry.coordinates) {
            this.tempValue.geocerca = { type: 'Polygon', coordinates: feature.geometry.coordinates };
        }
        // 2. Si el objeto pasado ES la geometría directamente
        else if (feature.type === 'Polygon' && feature.coordinates) {
            this.tempValue.geocerca = { type: 'Polygon', coordinates: feature.coordinates };
        }
        // 3. Fallback seguro
        else {
            this.tempValue.geocerca = null;
        }
    }

    private refreshMapState() {
        if (!this.map || !this.map.loaded()) return;
        this.renderMarker();
        if (this.modo === 'poligono') {
            this.draw.deleteAll();
            if (this.tempValue.geocerca) {
                this.draw.add({ type: 'Feature', geometry: this.tempValue.geocerca, properties: {} });
            }
        }
    }

    private emitChange() { this.onChange(this.innerValue); this.onTouched(); }
    writeValue(value: any): void {
        if (!value) {
            this.innerValue = { ubicacion: null, geocerca: null };
            return;
        }

        // Si el valor ya viene con la estructura correcta { geocerca: ... } o { ubicacion: ... }
        if (value.ubicacion !== undefined || value.geocerca !== undefined) {
            this.innerValue = value;
        } else {
            // Si el backend envía directamente la geometría (Ej: { type: 'Polygon', coordinates: [...] })
            // Lo acomodamos internamente para que coincida con la estructura de tu componente
            this.innerValue = {
                ubicacion: this.modo === 'punto' ? value : null,
                geocerca: this.modo === 'poligono' ? value : null
            };
        }
    }
    registerOnChange(fn: any): void { this.onChange = fn; }
    registerOnTouched(fn: any): void { this.onTouched = fn; }

    private getStyle(): string {
        const MAPTILER_KEY = 'WMNuRXDl7kbmZ19cOGo2';

        return this.isDark
            ? 'https://api.maptiler.com/maps/outdoor-v4-dark/style.json?key=' + MAPTILER_KEY
            : 'https://api.maptiler.com/maps/outdoor-v2/style.json?key=' + MAPTILER_KEY;
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe(); // Corrección: Se limpia la suscripción correcta
        if (this.map) this.map.remove();
    }
}
