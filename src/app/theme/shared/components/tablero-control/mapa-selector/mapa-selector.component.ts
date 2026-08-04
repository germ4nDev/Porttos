// // import { Component, forwardRef, ElementRef, ViewChild, OnDestroy, HostBinding, Input, OnInit, Output, EventEmitter } from '@angular/core';
// // import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
// // import { CommonModule } from '@angular/common';
// // import maplibregl from 'maplibre-gl';
// // import MapboxDraw from '@mapbox/mapbox-gl-draw';
// // import { Subscription } from 'rxjs';
// // import { ThemeService } from '../../../service/theme.service';
// // import { LocalStorageService } from 'src/app/theme/shared/service/local-storage.service';
// // import { mapboxDrawStyles } from './mapbox-draw-styles';
// // import * as turf from '@turf/turf';

// // @Component({
// //     selector: 'app-mapa-selector',
// //     standalone: true,
// //     imports: [CommonModule],
// //     templateUrl: './mapa-selector.component.html',
// //     styleUrls: ['./mapa-selector.component.scss'],
// //     providers: [
// //         {
// //             provide: NG_VALUE_ACCESSOR,
// //             useExisting: forwardRef(() => MapaSelectorComponent),
// //             multi: true
// //         }
// //     ]
// // })
// // export class MapaSelectorComponent implements ControlValueAccessor, OnInit, OnDestroy {
// //     @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
// //     @HostBinding('class.is-invalid') invalid = false;
// //     private _savedFeatures: any = null;
// //     @Input() modo: 'punto' | 'poligono' | 'linea' = 'punto';
// //     @Input() set savedFeatures(value: any) {
// //         console.log("📥 [Hijo] El padre inyectó:", value); // <-- AQUÍ
// //         this._savedFeatures = value;

// //         if (this.draw && value) {
// //             this.restoreFilteredData();
// //         }
// //     }
// //     isModalOpen: boolean = false;
// //     private map!: maplibregl.Map;
// //     protected draw!: MapboxDraw;

// //     @Output() onConfirm = new EventEmitter<any>();

// //     // Agrega este getter público

// //     private marker: maplibregl.Marker | null = null;
// //     public isDark: boolean = false;
// //     private subs: Subscription = new Subscription();
// //     public currentSelectionMode: 'point' | 'polygon' = 'polygon';
// //     private innerValue: any = { ubicacion: null, geocerca: null };
// //     private tempValue: any = { ubicacion: null, geocerca: null };
// //     private savedFeatureCollection: any = null;
// //     private onChange = (val: any) => { };
// //     private onTouched = () => { };

// //     constructor(
// //         private _themeService: ThemeService,
// //         private _localStorage: LocalStorageService
// //     ) {
// //         this.isDark = this._localStorage.getThemeSettings()?.isDarkTheme || false;
// //     }

// //     get savedFeatures(): any {
// //         return this._savedFeatures;
// //     }

// //     public get drawInstance(): MapboxDraw {
// //         return this.draw;
// //     }

// //     ngOnInit(): void {
// //         this.subs.add(
// //             this._themeService.isDarkTheme$.subscribe((isDark) => {
// //                 this.isDark = isDark;

// //                 // Si el mapa ya está inicializado y abierto en el modal
// //                 if (this.map && this.map.loaded()) {
// //                     this.map.setStyle(this.getStyle());

// //                     // CRÍTICO: MapLibre borra los elementos al cambiar el estilo base.
// //                     // Esperamos a que cargue el nuevo tema y volvemos a pintar los marcadores/polígonos.
// //                     this.map.once('style.load', () => {
// //                         this.refreshMapState();
// //                     });
// //                 }
// //             })
// //         );
// //     }

// //     openModal() {
// //         this.isModalOpen = true;
// //         this.tempValue = JSON.parse(JSON.stringify(this.innerValue));

// //         // 🛠️ NUEVO: Normalizar la ubicación a formato {lat, lon}
// //         // para que el marcador rojo entienda dónde ubicarse al abrir el modal.
// //         if (this.modo === 'punto') {
// //             const coords = this.extraerCoordenadasPunto(); // Función del paso anterior
// //             if (coords) {
// //                 this.tempValue.ubicacion = { lat: coords.lat, lon: coords.lon };
// //             }
// //         }

// //         console.log("📤 [Padre] Pasando al hijo:", this._savedFeatures);
// //         setTimeout(() => this.initMap(), 100);
// //     }

// //     closeModal() {
// //         this.isModalOpen = false;
// //         if (this.map) this.map.remove();
// //     }

// //     confirmSelection() {
// //         this.innerValue = JSON.parse(JSON.stringify(this.tempValue));
// //         const data = this.draw.getAll();
// //         this.onConfirm.emit(data);
// //         console.log("📤 [Hijo] Enviando al padre:", data);
// //         this.emitChange();
// //         if (this.draw) {
// //             this.savedFeatureCollection = this.draw.getAll();
// //             console.log('feature saved', this.savedFeatureCollection);
// //         }
// //         this.closeModal();
// //     }

// //     getDisplayText(): string {
// //         // --- MODO PUNTO ---
// //         if (this.modo === 'punto') {

// //             // 1. NUEVO: Verificar si la data viene de la BD como un GeoJSON FeatureCollection
// //             const isGeoJson = this._savedFeatures?.type === 'FeatureCollection' &&
// //                 this._savedFeatures?.features?.length > 0;

// //             if (isGeoJson) {
// //                 const geometry = this._savedFeatures.features[0].geometry;
// //                 if (geometry.type === 'Point' && geometry.coordinates) {
// //                     const lon = geometry.coordinates[0];
// //                     const lat = geometry.coordinates[1];
// //                     return `📍 Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
// //                 }
// //             }

// //             // 2. Tu lógica original (sirve de respaldo para el innerValue del componente)
// //             const ubicacion = this.innerValue?.ubicacion ||
// //                 this._savedFeatures?.ubicacion ||
// //                 (this._savedFeatures?.lat ? this._savedFeatures : null);

// //             if (ubicacion && ubicacion.lat !== undefined && ubicacion.lon !== undefined) {
// //                 return `📍 Lat: ${ubicacion.lat.toFixed(4)}, Lon: ${ubicacion.lon.toFixed(4)}`;
// //             }
// //         }

// //         // --- MODO POLÍGONO ---
// //         if (this.modo === 'poligono') {
// //             // Verifica si hay una geocerca configurada actualmente o si el padre pasó una desde la BD
// //             const tieneGeocerca = this.innerValue?.geocerca || this._savedFeatures;

// //             if (tieneGeocerca) {
// //                 return '🗺️ Polígono delimitado configurado';
// //             }
// //         }

// //         return '';
// //     }

// //     private initMap(): void {
// //         const coordsPunto = this.modo === 'punto' ? this.extraerCoordenadasPunto() : null;

// //         // Determinar el centro inicial y el zoom de forma segura
// //         const initialCenter: [number, number] = coordsPunto ? [coordsPunto.lon, coordsPunto.lat] : [-75.5, 6.2];
// //         const initialZoom = coordsPunto ? 14 : 5;

// //         this.map = new maplibregl.Map({
// //             container: this.mapContainer.nativeElement,
// //             style: this.getStyle(),
// //             center: initialCenter, // Pasamos el array limpio sin undefined
// //             zoom: initialZoom,
// //             attributionControl: false
// //         });

// //         this.map.on('load', () => {
// //             this.draw = new MapboxDraw({
// //                 displayControlsDefault: false,
// //                 styles: mapboxDrawStyles,
// //                 controls: {
// //                     point: false,
// //                     polygon: false,
// //                     trash: false
// //                 }
// //             });

// //             if (this._savedFeatures) {
// //                 if (this.modo === 'poligono') {
// //                     // Solo dejamos que Draw maneje los polígonos
// //                     this.draw.add(this._savedFeatures);

// //                     // B) Hacemos el zoom (Ajusta esto según la librería que uses, usualmente Turf.js)
// //                     try {
// //                         // 1. Obtenemos el bounding box de Turf (devuelve un arreglo [minX, minY, maxX, maxY])
// //                         const bbox = turf.bbox(this._savedFeatures);

// //                         // 2. Lo formateamos explícitamente al tipo que MapLibre entiende sin quejarse
// //                         const bounds: maplibregl.LngLatBoundsLike = [
// //                             [bbox[0], bbox[1]], // Esquina Suroeste (minLng, minLat)
// //                             [bbox[2], bbox[3]]  // Esquina Noreste (maxLng, maxLat)
// //                         ];

// //                         // 3. Aplicamos el zoom
// //                         this.map.fitBounds(bounds, { padding: 40, maxZoom: 16 });

// //                     } catch (e) {
// //                         console.error("Error calculando el centro del polígono", e);
// //                     }
// //                 }
// //             }
// //             this.renderMarker();

// //             this.map.addControl(this.draw as unknown as maplibregl.IControl);
// //             if (this.savedFeatures) {
// //                 this.restoreFilteredData();
// //             }

// //             this.map.on('styledata', () => {
// //                 const style = this.map.getStyle();
// //                 if (!style || !style.layers) return;
// //                 style.layers.forEach((layer: any) => {
// //                     if (layer.id.includes('gl-draw') && layer.paint && layer.paint['line-dasharray']) {
// //                         const dash = layer.paint['line-dasharray'];
// //                         if (Array.isArray(dash) && dash.length > 0 && typeof dash[0] === 'number') {
// //                             this.map.setPaintProperty(layer.id, 'line-dasharray', ["literal", dash]);
// //                         }
// //                     }
// //                 });
// //             });

// //             this.map.on('click', (e) => {
// //                 if (this.modo === 'poligono') return;

// //                 const target = e.originalEvent.target as HTMLElement;
// //                 if (target.closest('.mapboxgl-ctrl-group') || target.closest('.mapboxgl-ctrl')) return;

// //                 this.handlePointPlacement(e.lngLat);
// //             });

// //             if (this.modo === 'poligono') {
// //                 this.map.on('draw.create', (e) => this.updateGeocerca(e.features[0]));
// //                 this.map.on('draw.update', (e) => this.updateGeocerca(e.features[0]));
// //                 this.map.on('draw.delete', () => this.updateGeocerca(null));
// //             }

// //             setTimeout(() => {
// //                 this.enfocarMapa();
// //             }, 200);

// //             this.refreshMapState();
// //         });
// //     }

// //     private extraerCoordenadasPunto(): { lon: number, lat: number } | null {
// //         const data = this.tempValue?.ubicacion || this._savedFeatures;
// //         if (!data) return null;

// //         // 1. Si es un click reciente o ya tiene el formato {lat, lon}
// //         if (data.lat !== undefined && data.lon !== undefined) {
// //             return { lon: data.lon, lat: data.lat };
// //         }

// //         // 2. Si la BD envía un GeoJSON FeatureCollection completo
// //         if (data.type === 'FeatureCollection' && data.features?.length > 0) {
// //             const geom = data.features[0].geometry;
// //             if (geom && geom.type === 'Point') {
// //                 return { lon: geom.coordinates[0], lat: geom.coordinates[1] };
// //             }
// //         }

// //         // 3. Si la BD envía un Feature directo
// //         if (data.type === 'Feature' && data.geometry?.type === 'Point') {
// //             return { lon: data.geometry.coordinates[0], lat: data.geometry.coordinates[1] };
// //         }

// //         // 4. Si la BD envía la geometría pura (Point)
// //         if (data.type === 'Point' && data.coordinates) {
// //             return { lon: data.coordinates[0], lat: data.coordinates[1] };
// //         }

// //         return null;
// //     }

// //     private enfocarMapa() {
// //         if (!this.map) return;
// //         console.log('************tempValue', this._savedFeatures);

// //         const bounds = new maplibregl.LngLatBounds();
// //         let hasData = false;

// //         // 1. Lógica para MODO PUNTO
// //         if (this.modo === 'punto' && this.tempValue?.ubicacion_geo) {

// //             bounds.extend([this.tempValue.ubicacion_geo.lon, this.tempValue.ubicacion_geo.lat]);
// //             hasData = true;
// //         }
// //         // else  2. Lógica para MODO POLÍGONO (Extraemos las coordenadas dibujadas por MapboxDraw)
// //         // if (this.modo === 'poligono' && this.draw) {
// //         const data = this.draw.getAll();
// //         if (data && data.features.length > 0) {
// //             data.features.forEach((feature: any) => {
// //                 if (feature.geometry.type === 'Polygon') {
// //                     // Extraemos cada vértice del polígono para asegurar que la cámara cubra toda la geocerca
// //                     feature.geometry.coordinates[0].forEach((coord: [number, number]) => {
// //                         bounds.extend(coord);
// //                     });
// //                     hasData = true;
// //                 } else if (feature.geometry.type === 'Point') {
// //                     bounds.extend(feature.geometry.coordinates as [number, number]);
// //                     hasData = true;
// //                 }
// //             });
// //         }
// //         // }

// //         // 3. Ejecutar el zoom / paneo
// //         if (hasData) {
// //             this.map.fitBounds(bounds, {
// //                 padding: { top: 50, bottom: 50, left: 50, right: 50 }, // Margen para que no quede pegado a los bordes
// //                 maxZoom: 15, // Crucial para los puntos: evita que haga un zoom infinito (nivel 22)
// //                 duration: 1000 // Duración de la animación del viaje de la cámara (ms)
// //             });
// //         }
// //     }

// //     restoreFilteredData() {
// //         if (!this.draw) return;

// //         try {
// //             this.draw.deleteAll();
// //         } catch (e) { }

// //         const dataToProcess = this._savedFeatures;
// //         if (!dataToProcess) return;

// //         // 1. Extraer el dato real del contenedor
// //         let rawData = dataToProcess.type ? dataToProcess :
// //             (this.modo === 'punto' ? dataToProcess.ubicacion : dataToProcess.geocerca);

// //         if (!rawData) return;

// //         // 2. Normalizar la estructura para MapboxDraw
// //         let featureCollection: any;

// //         if (rawData.type === 'FeatureCollection') {
// //             featureCollection = rawData;
// //         } else if (rawData.type === 'Feature') {
// //             // NUEVO: Si la base de datos ya envió un Feature, no lo volvemos a envolver
// //             featureCollection = {
// //                 type: 'FeatureCollection',
// //                 features: [rawData]
// //             };
// //         } else {
// //             // Si es la geometría pura (Polygon o Point), la envolvemos en un Feature
// //             featureCollection = {
// //                 type: 'FeatureCollection',
// //                 features: [{
// //                     type: 'Feature',
// //                     geometry: rawData.type ? rawData : { type: 'Point', coordinates: [rawData.lon, rawData.lat] },
// //                     properties: {}
// //                 }]
// //             };
// //         }

// //         // 3. Validación Final y Pintado
// //         if (featureCollection.features && featureCollection.features.length > 0) {
// //             // Filtramos features inválidas por seguridad
// //             featureCollection.features = featureCollection.features.filter((f: any) => f.geometry && f.geometry.type);

// //             if (featureCollection.features.length > 0) {
// //                 console.log("🎨 Dibujando ahora mismo:", featureCollection);
// //                 try {
// //                     this.draw.add(featureCollection);
// //                 } catch (error) {
// //                     console.error("Error al pintar la geocerca. Revisa la estructura del GeoJSON:", error);
// //                 }
// //             }
// //         }
// //     }

// //     activatePolygonMode() {
// //         this.draw.changeMode('draw_polygon');
// //     }

// //     deleteSelected() {
// //         this.draw.trash(); // El método nativo de Mapbox para borrar
// //     }

// //     private handlePointPlacement(lngLat: maplibregl.LngLat) {
// //         this.tempValue.ubicacion = { lat: lngLat.lat, lon: lngLat.lng };
// //         this.renderMarker();
// //     }

// //     private renderMarker() {
// //         if (this.marker) this.marker.remove();

// //         if (this.modo === 'punto' && this.tempValue?.ubicacion?.lat !== undefined && this.tempValue?.ubicacion?.lon !== undefined) {

// //             const customIcon = document.createElement('div');
// //             customIcon.className = 'custom-map-marker';
// //             customIcon.innerHTML = `
// //             <svg width="32" height="42" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
// //                 <ellipse cx="12" cy="34" rx="6" ry="2" fill="rgba(0,0,0,0.3)" />
// //                 <path d="M12 0C7.03 0 3 4.03 3 9c0 5.25 9 27 9 27s9-21.75 9-27c0-4.97-4.03-9-9-9z" fill="#FF0000"/>
// //                 <circle cx="12" cy="9" r="4.5" fill="#FFFFFF"/>
// //             </svg>
// //         `;
// //             customIcon.style.cursor = 'pointer';

// //             // Añadimos draggable: true
// //             this.marker = new maplibregl.Marker({
// //                 element: customIcon,
// //                 anchor: 'bottom',
// //                 draggable: true // 🛠️ Permite mover el pin con el click sostenido
// //             })
// //                 .setLngLat([this.tempValue.ubicacion.lon, this.tempValue.ubicacion.lat])
// //                 .addTo(this.map);

// //             // 🛠️ Actualizamos los datos temporales cuando el usuario suelta el pin
// //             this.marker.on('dragend', () => {
// //                 const lngLat = this.marker!.getLngLat();
// //                 this.tempValue.ubicacion.lon = lngLat.lng;
// //                 this.tempValue.ubicacion.lat = lngLat.lat;
// //             });
// //         }
// //     }

// //     private updateGeocerca(feature: any) {
// //         if (!feature) {
// //             this.tempValue.geocerca = null;
// //             return;
// //         }

// //         // 1. Si es un Feature estándar de GeoJSON (tiene 'geometry')
// //         if (feature.geometry && feature.geometry.coordinates) {
// //             this.tempValue.geocerca = { type: 'Polygon', coordinates: feature.geometry.coordinates };
// //         }
// //         // 2. Si el objeto pasado ES la geometría directamente
// //         else if (feature.type === 'Polygon' && feature.coordinates) {
// //             this.tempValue.geocerca = { type: 'Polygon', coordinates: feature.coordinates };
// //         }
// //         // 3. Fallback seguro
// //         else {
// //             this.tempValue.geocerca = null;
// //         }
// //     }

// //     private refreshMapState() {
// //         if (!this.map || !this.map.loaded()) return;
// //         this.renderMarker();
// //         if (this.modo === 'poligono') {
// //             this.draw.deleteAll();
// //             if (this.tempValue.geocerca) {
// //                 this.draw.add({ type: 'Feature', geometry: this.tempValue.geocerca, properties: {} });
// //             }
// //         }
// //     }

// //     private emitChange() { this.onChange(this.innerValue); this.onTouched(); }
// //     writeValue(value: any): void {
// //         if (!value) {
// //             this.innerValue = { ubicacion: null, geocerca: null };
// //             return;
// //         }

// //         // Si el valor ya viene con la estructura correcta { geocerca: ... } o { ubicacion: ... }
// //         if (value.ubicacion !== undefined || value.geocerca !== undefined) {
// //             this.innerValue = value;
// //         } else {
// //             // Si el backend envía directamente la geometría (Ej: { type: 'Polygon', coordinates: [...] })
// //             // Lo acomodamos internamente para que coincida con la estructura de tu componente
// //             this.innerValue = {
// //                 ubicacion: this.modo === 'punto' ? value : null,
// //                 geocerca: this.modo === 'poligono' ? value : null
// //             };
// //         }
// //     }
// //     registerOnChange(fn: any): void { this.onChange = fn; }
// //     registerOnTouched(fn: any): void { this.onTouched = fn; }

// //     private getStyle(): string {
// //         const MAPTILER_KEY = 'WMNuRXDl7kbmZ19cOGo2';

// //         return this.isDark
// //             ? 'https://api.maptiler.com/maps/outdoor-v4-dark/style.json?key=' + MAPTILER_KEY
// //             : 'https://api.maptiler.com/maps/outdoor-v2/style.json?key=' + MAPTILER_KEY;
// //     }

// //     ngOnDestroy(): void {
// //         this.subs.unsubscribe(); // Corrección: Se limpia la suscripción correcta
// //         if (this.map) this.map.remove();
// //     }
// // }

/*
    Author: German Valencia
    Componente: Mapa Logístico - Integración Completa
    (Checkpoints circulares, KPIs desglosados y Radar asíncrono)
*/
import { Component, forwardRef, ElementRef, ViewChild, OnDestroy, HostBinding, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../service/theme.service';
import { LocalStorageService } from 'src/app/theme/shared/service/local-storage.service';
import { mapboxDrawStyles } from './mapbox-draw-styles';
import * as turf from '@turf/turf';

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
        console.log("📥 [Hijo] El padre inyectó:", value);
        this._savedFeatures = value;

        // 🛡️ EL GUARDIA: Solo interactúa con Draw si está 100% montado en el mapa
        if (this.map && this.map.isStyleLoaded() && this.draw) {
            this.restoreFilteredData();
        }
    }

    isModalOpen: boolean = false;
    private map!: maplibregl.Map;
    protected draw!: MapboxDraw;

    @Output() onConfirm = new EventEmitter<any>();

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
                if (this.map && this.map.loaded()) {
                    this.map.setStyle(this.getStyle());
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

        if (this.modo === 'punto') {
            const coords = this.extraerCoordenadasPunto();
            if (coords) {
                this.tempValue.ubicacion = { lat: coords.lat, lon: coords.lon };
            }
        }

        console.log("📤 [Padre] Pasando al hijo:", this._savedFeatures);
        setTimeout(() => this.initMap(), 100);
    }

    closeModal() {
        this.isModalOpen = false;
        if (this.map) this.map.remove();
    }

    confirmSelection() {
        this.innerValue = JSON.parse(JSON.stringify(this.tempValue));

        // Verificamos que Draw exista antes de pedirle datos
        const data = this.draw ? this.draw.getAll() : null;
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
        if (this.modo === 'punto') {
            const isGeoJson = this._savedFeatures?.type === 'FeatureCollection' &&
                this._savedFeatures?.features?.length > 0;

            if (isGeoJson) {
                const geometry = this._savedFeatures.features[0].geometry;
                if (geometry.type === 'Point' && geometry.coordinates) {
                    const lon = geometry.coordinates[0];
                    const lat = geometry.coordinates[1];
                    return `📍 Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                }
            }

            const ubicacion = this.innerValue?.ubicacion ||
                this._savedFeatures?.ubicacion ||
                (this._savedFeatures?.lat ? this._savedFeatures : null);

            if (ubicacion && ubicacion.lat !== undefined && ubicacion.lon !== undefined) {
                return `📍 Lat: ${ubicacion.lat.toFixed(4)}, Lon: ${ubicacion.lon.toFixed(4)}`;
            }
        }

        if (this.modo === 'poligono') {
            const tieneGeocerca = this.innerValue?.geocerca || this._savedFeatures;
            if (tieneGeocerca) {
                return '🗺️ Polígono delimitado configurado';
            }
        }

        return '';
    }

    // private initMap(): void {
    //     const coordsPunto = this.modo === 'punto' ? this.extraerCoordenadasPunto() : null;
    //     const initialCenter: [number, number] = coordsPunto ? [coordsPunto.lon, coordsPunto.lat] : [-75.5, 6.2];
    //     const initialZoom = coordsPunto ? 14 : 5;

    //     this.map = new maplibregl.Map({
    //         container: this.mapContainer.nativeElement,
    //         style: this.getStyle(),
    //         center: initialCenter,
    //         zoom: initialZoom,
    //         attributionControl: false
    //     });

    //     // 1. Instanciamos Draw INMEDIATAMENTE
    //     this.draw = new MapboxDraw({
    //         displayControlsDefault: false,
    //         styles: mapboxDrawStyles,
    //         controls: {
    //             point: false,
    //             polygon: false,
    //             trash: false
    //         }
    //     });

    //     // 2. Vinculamos Draw al mapa ANTES de que cargue o intente pintar algo (Evita el TypeError)
    //     this.map.addControl(this.draw as unknown as maplibregl.IControl);

    //     this.map.on('load', () => {

    //         // 3. Ya con el mapa cargado y Draw vinculado, restauramos datos si es polígono
    //         if (this._savedFeatures && this.modo === 'poligono') {
    //             this.restoreFilteredData();

    //             // 4. Zoom exacto usando Turf
    //             try {
    //                 const bbox = turf.bbox(this._savedFeatures);
    //                 const bounds: maplibregl.LngLatBoundsLike = [
    //                     [bbox[0], bbox[1]],
    //                     [bbox[2], bbox[3]]
    //                 ];
    //                 this.map.fitBounds(bounds, { padding: 40, maxZoom: 16 });
    //             } catch (e) {
    //                 console.error("Error calculando el centro del polígono", e);
    //             }
    //         }

    //         this.renderMarker();

    //         this.map.on('styledata', () => {
    //             const style = this.map.getStyle();
    //             if (!style || !style.layers) return;
    //             style.layers.forEach((layer: any) => {
    //                 if (layer.id.includes('gl-draw') && layer.paint && layer.paint['line-dasharray']) {
    //                     const dash = layer.paint['line-dasharray'];
    //                     if (Array.isArray(dash) && dash.length > 0 && typeof dash[0] === 'number') {
    //                         this.map.setPaintProperty(layer.id, 'line-dasharray', ["literal", dash]);
    //                     }
    //                 }
    //             });
    //         });

    //         this.map.on('click', (e) => {
    //             if (this.modo === 'poligono') return;
    //             const target = e.originalEvent.target as HTMLElement;
    //             if (target.closest('.mapboxgl-ctrl-group') || target.closest('.mapboxgl-ctrl')) return;
    //             this.handlePointPlacement(e.lngLat);
    //         });

    //         if (this.modo === 'poligono') {
    //             this.map.on('draw.create', (e) => this.updateGeocerca(e.features[0]));
    //             this.map.on('draw.update', (e) => this.updateGeocerca(e.features[0]));
    //             this.map.on('draw.delete', () => this.updateGeocerca(null));
    //         }

    //         // Mantenemos esto por si es un punto o si turf fallara
    //         setTimeout(() => {
    //             this.enfocarMapa();
    //         }, 200);

    //     });
    // }
    private initMap(): void {
        // 1. Fijamos el centro y zoom siempre en Colombia al inicio
        const initialCenter: [number, number] = [-74.0, 4.0]; // Coordenadas centrales de Colombia aprox.
        const initialZoom = 4.5; // Zoom alejado para ver todo el país

        this.map = new maplibregl.Map({
            container: this.mapContainer.nativeElement,
            style: this.getStyle(),
            center: initialCenter, // 🇨🇴 Siempre arranca en Colombia
            zoom: initialZoom,
            attributionControl: false
        });

        // 1. Instanciamos Draw INMEDIATAMENTE
        this.draw = new MapboxDraw({
            displayControlsDefault: false,
            styles: mapboxDrawStyles,
            controls: {
                point: false,
                polygon: false,
                trash: false
            }
        });

        // 2. Vinculamos Draw al mapa ANTES de que cargue
        this.map.addControl(this.draw as unknown as maplibregl.IControl);

        this.map.on('load', () => {

            // 3. Restauramos datos si es polígono
            if (this._savedFeatures && this.modo === 'poligono') {
                this.restoreFilteredData();
            }

            // Dibujamos el marcador si es punto
            this.renderMarker();

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

            // 4. Disparamos el efecto de "vuelo" (tanto para punto como para polígono)
            setTimeout(() => {
                this.enfocarMapa();
            }, 200);

        });
    }

    private extraerCoordenadasPunto(): { lon: number, lat: number } | null {
        const data = this.tempValue?.ubicacion || this._savedFeatures;
        if (!data) return null;

        if (data.lat !== undefined && data.lon !== undefined) {
            return { lon: data.lon, lat: data.lat };
        }

        if (data.type === 'FeatureCollection' && data.features?.length > 0) {
            const geom = data.features[0].geometry;
            if (geom && geom.type === 'Point') {
                return { lon: geom.coordinates[0], lat: geom.coordinates[1] };
            }
        }

        if (data.type === 'Feature' && data.geometry?.type === 'Point') {
            return { lon: data.geometry.coordinates[0], lat: data.geometry.coordinates[1] };
        }

        if (data.type === 'Point' && data.coordinates) {
            return { lon: data.coordinates[0], lat: data.coordinates[1] };
        }

        return null;
    }

    // private enfocarMapa() {
    //     if (!this.map) return;

    //     const bounds = new maplibregl.LngLatBounds();
    //     let hasData = false;

    //     if (this.modo === 'punto' && this.tempValue?.ubicacion_geo) {
    //         bounds.extend([this.tempValue.ubicacion_geo.lon, this.tempValue.ubicacion_geo.lat]);
    //         hasData = true;
    //     }

    //     if (this.draw) {
    //         const data = this.draw.getAll();
    //         if (data && data.features.length > 0) {
    //             data.features.forEach((feature: any) => {
    //                 if (feature.geometry.type === 'Polygon') {
    //                     feature.geometry.coordinates[0].forEach((coord: [number, number]) => {
    //                         bounds.extend(coord);
    //                     });
    //                     hasData = true;
    //                 } else if (feature.geometry.type === 'Point') {
    //                     bounds.extend(feature.geometry.coordinates as [number, number]);
    //                     hasData = true;
    //                 }
    //             });
    //         }
    //     }

    //     if (hasData) {
    //         this.map.fitBounds(bounds, {
    //             padding: { top: 50, bottom: 50, left: 50, right: 50 },
    //             maxZoom: 15,
    //             duration: 1000
    //         });
    //     }
    // }
    private enfocarMapa() {
        if (!this.map) return;

        // 1. Lógica exclusiva para MODO PUNTO (Vuelo de cámara a una coordenada)
        if (this.modo === 'punto' && this.tempValue?.ubicacion) {
            this.map.flyTo({
                center: [this.tempValue.ubicacion.lon, this.tempValue.ubicacion.lat],
                zoom: 15, // Nivel de acercamiento al puerto
                duration: 1500, // 1.5 segundos de animación
                essential: true // Asegura que la animación ocurra
            });
            return; // Terminamos aquí para no ejecutar lo del polígono
        }

        // 2. Lógica exclusiva para MODO POLÍGONO (Encuadrar un área)
        if (this.modo === 'poligono' && this.draw) {
            const bounds = new maplibregl.LngLatBounds();
            let hasData = false;

            const data = this.draw.getAll();
            if (data && data.features.length > 0) {
                data.features.forEach((feature: any) => {
                    if (feature.geometry.type === 'Polygon') {
                        feature.geometry.coordinates[0].forEach((coord: [number, number]) => {
                            bounds.extend(coord);
                        });
                        hasData = true;
                    } else if (feature.geometry.type === 'Point') {
                        bounds.extend(feature.geometry.coordinates as [number, number]);
                        hasData = true;
                    }
                });
            }

            if (hasData) {
                this.map.fitBounds(bounds, {
                    padding: { top: 50, bottom: 50, left: 50, right: 50 },
                    maxZoom: 15,
                    duration: 1500
                });
            }
        }
    }

    restoreFilteredData() {
        if (!this.draw) return;

        try {
            this.draw.deleteAll();
        } catch (e) { }

        const dataToProcess = this._savedFeatures;
        if (!dataToProcess) return;

        let rawData = dataToProcess.type ? dataToProcess :
            (this.modo === 'punto' ? dataToProcess.ubicacion : dataToProcess.geocerca);

        if (!rawData) return;

        let featureCollection: any;

        if (rawData.type === 'FeatureCollection') {
            featureCollection = rawData;
        } else if (rawData.type === 'Feature') {
            featureCollection = {
                type: 'FeatureCollection',
                features: [rawData]
            };
        } else {
            featureCollection = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: rawData.type ? rawData : { type: 'Point', coordinates: [rawData.lon, rawData.lat] },
                    properties: {}
                }]
            };
        }

        if (featureCollection.features && featureCollection.features.length > 0) {
            featureCollection.features = featureCollection.features.filter((f: any) => f.geometry && f.geometry.type);

            if (featureCollection.features.length > 0) {
                console.log("🎨 Dibujando ahora mismo:", featureCollection);
                try {
                    this.draw.add(featureCollection);
                } catch (error) {
                    console.error("Error al pintar la geocerca:", error);
                }
            }
        }
    }

    activatePolygonMode() {
        if (this.draw) this.draw.changeMode('draw_polygon');
    }

    deleteSelected() {
        if (this.draw) this.draw.trash();
    }

    private handlePointPlacement(lngLat: maplibregl.LngLat) {
        this.tempValue.ubicacion = { lat: lngLat.lat, lon: lngLat.lng };
        this.renderMarker();
    }

    private renderMarker() {
        if (this.marker) this.marker.remove();

        if (this.modo === 'punto' && this.tempValue?.ubicacion?.lat !== undefined && this.tempValue?.ubicacion?.lon !== undefined) {

            const customIcon = document.createElement('div');
            customIcon.className = 'custom-map-marker';
            customIcon.innerHTML = `
            <svg width="32" height="42" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="12" cy="34" rx="6" ry="2" fill="rgba(0,0,0,0.3)" />
                <path d="M12 0C7.03 0 3 4.03 3 9c0 5.25 9 27 9 27s9-21.75 9-27c0-4.97-4.03-9-9-9z" fill="#FF0000"/>
                <circle cx="12" cy="9" r="4.5" fill="#FFFFFF"/>
            </svg>
        `;
            customIcon.style.cursor = 'pointer';

            this.marker = new maplibregl.Marker({
                element: customIcon,
                anchor: 'bottom',
                draggable: true
            })
                .setLngLat([this.tempValue.ubicacion.lon, this.tempValue.ubicacion.lat])
                .addTo(this.map);

            this.marker.on('dragend', () => {
                const lngLat = this.marker!.getLngLat();
                this.tempValue.ubicacion.lon = lngLat.lng;
                this.tempValue.ubicacion.lat = lngLat.lat;
            });
        }
    }

    private updateGeocerca(feature: any) {
        if (!feature) {
            this.tempValue.geocerca = null;
            return;
        }

        if (feature.geometry && feature.geometry.coordinates) {
            this.tempValue.geocerca = { type: 'Polygon', coordinates: feature.geometry.coordinates };
        }
        else if (feature.type === 'Polygon' && feature.coordinates) {
            this.tempValue.geocerca = { type: 'Polygon', coordinates: feature.coordinates };
        }
        else {
            this.tempValue.geocerca = null;
        }
    }

    private refreshMapState() {
        if (!this.map || !this.map.loaded()) return;
        this.renderMarker();
        if (this.modo === 'poligono' && this.draw) {
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

        if (value.ubicacion !== undefined || value.geocerca !== undefined) {
            this.innerValue = value;
        } else {
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
        this.subs.unsubscribe();
        if (this.map) this.map.remove();
    }
}
