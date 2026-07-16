import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, Observable, shareReplay, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class MapaGeneralService {

    // ==========================================================
    // 1. ESTADO DE DATOS (Las tuberías de información)
    // 🟢 Agregamos pipe(shareReplay(1)) para que los widgets
    // reciban el último dato válido instantáneamente al suscribirse.
    // ==========================================================
    private navesSubject = new BehaviorSubject<any>(null);
    public naves$ = this.navesSubject.asObservable().pipe(shareReplay(1));

    private infraSubject = new BehaviorSubject<any>(null);
    public infra$ = this.infraSubject.asObservable().pipe(shareReplay(1));

    private terrestreSubject = new BehaviorSubject<any>(null);
    public terrestre$ = this.terrestreSubject.asObservable().pipe(shareReplay(1));

    private climaSubject = new BehaviorSubject<any>(null);
    public clima$ = this.climaSubject.asObservable().pipe(shareReplay(1));

    private viasSubject = new BehaviorSubject<any>(null);
    public vias$ = this.viasSubject.asObservable().pipe(shareReplay(1));

    private gemeloDigitalSubject = new BehaviorSubject<any>(null);
    public gemeloDigital$ = this.gemeloDigitalSubject.asObservable().pipe(shareReplay(1));

    private puertoSeleccionadoSubject = new BehaviorSubject<any>(null);
    public puertoSeleccionado$ = this.puertoSeleccionadoSubject.asObservable().pipe(shareReplay(1));

    private accidentesSubject = new BehaviorSubject<any>(null);
    public accidentes$: Observable<any> = this.accidentesSubject.asObservable().pipe(shareReplay(1));

    // ==========================================================
    // 2. ESTADO DE VISIBILIDAD
    // ==========================================================
    private visibilidadState: { [key: string]: boolean } = {
        naves: true,
        infra: true,
        terrestre: true,
        clima: true,
        vias: false,
        accidentes: true,
        limites: true
    };

    public visibilidad$ = new BehaviorSubject<{ [key: string]: boolean }>(this.visibilidadState);
    private datosCargados = false;

    constructor(private http: HttpClient) { }

    // ==========================================================
    // 3. EL MOTOR DE ARRANQUE
    // ==========================================================
    public cargarDatosIniciales(): void {
        // 🟢 Solo cargamos si los datos no existen.
        // Si el mapa se recarga, no vuelve a pedir todo al backend innecesariamente.
        if (this.datosCargados) return;

        this.getCapaInfraestructura().subscribe();
        this.getCapaClima().subscribe();
        this.getCapaNaves().subscribe();
        this.cargarEventosVialesActivos();

        // 🟢 NUEVO: Carga de flota GPS integrada (Reemplaza la antigua capa estática)
        this.cargarFlotaTerrestreGPS();

        console.log('🚀 [MapaGeneralService] Iniciando carga de datos...');
        this.datosCargados = true;
    }

    // ==========================================================
    // 4. MÉTODOS DE SERVICIOS API
    // ==========================================================
    public getCapaInfraestructura(): Observable<any> {
        return this.http.get<any>(`${base_url}/mapa-general/infraestructura`).pipe(
            tap(resp => {
                if (resp.success && resp.CAPA_INFRAESTRUCTURA) {
                    this.infraSubject.next(resp.CAPA_INFRAESTRUCTURA);
                    this.actualizarGemelo('CAPA_INFRAESTRUCTURA', resp.CAPA_INFRAESTRUCTURA);
                }
            })
        );
    }

    // Nota: Mantenemos este método por compatibilidad con tu código antiguo,
    // pero la flota real la está manejando getFlotaGeoJSON()
    public getCapaTerrestre(): Observable<any> {
        return this.http.get<any>(`${base_url}/mapa-general/terrestre`).pipe(
            tap(resp => {
                if (resp.success && resp.CAPA_TERRESTRE) {
                    // Solo actualizamos si no choca con el GPS en vivo
                    if (!this.terrestreSubject.getValue()) {
                        this.terrestreSubject.next(resp.CAPA_TERRESTRE);
                        this.actualizarGemelo('CAPA_TERRESTRE_ESTATICA', resp.CAPA_TERRESTRE);
                    }
                }
            })
        );
    }

    public getCapaClima(): Observable<any> {
        return this.http.get<any>(`${base_url}/mapa-general/clima`).pipe(
            tap(resp => {
                if (resp.success && resp.CAPA_CLIMA) {
                    this.climaSubject.next(resp.CAPA_CLIMA);
                    this.actualizarGemelo('CAPA_CLIMA', resp.CAPA_CLIMA);
                }
            })
        );
    }

    public getCapaNaves(): Observable<any> {
        return this.http.get<any>(`${base_url}/mapa-general/naves`).pipe(
            tap(resp => {
                if (resp.success && resp.data) {
                    this.navesSubject.next(resp.data);
                    this.actualizarGemelo('CAPA_NAVES', resp.data);
                }
            })
        );
    }

    // ==========================================================
    // 5. ACTUALIZADOR INTELIGENTE DEL GEMELO DIGITAL
    // ==========================================================
    private actualizarGemelo(key: string, data: any) {
        const currentData = this.gemeloDigitalSubject.getValue() || {};
        // 🟢 PREVENCIÓN: Solo actualizamos si realmente hay datos nuevos
        if (data) {
            this.gemeloDigitalSubject.next({
                ...currentData,
                [key]: data
            });
        }
    }

    // ==========================================================
    // 6. CONTROLADORES DE ESTADO Y UPDATERS
    // ==========================================================
    public actualizarVisibilidadCapa(capaId: string, visible: boolean): void {
        this.visibilidadState = { ...this.visibilidadState, [capaId]: visible };
        this.visibilidad$.next(this.visibilidadState);
    }

    public aplicarVista(vista: 'operativa' | 'emergencia' | 'resumen'): void { }

    public actualizarNaves(data: any): void { this.navesSubject.next(data); }
    public actualizarInfraestructura(data: any): void { this.infraSubject.next(data); }
    public actualizarTerrestre(data: any): void { this.terrestreSubject.next(data); }
    public actualizarClima(data: any): void { this.climaSubject.next(data); }
    public actualizarVias(data: any): void { this.viasSubject.next(data); }
    public actualizarAccidentes(data: any): void { this.accidentesSubject.next(data); }

    public seleccionarPuerto(puerto: any): void { this.puertoSeleccionadoSubject.next(puerto); }

    public obtenerGemeloDigital(): Observable<any> {
        return this.http.get<any>(`${base_url}/mapa-general/capas`).pipe(
            map(response => response?.data ? response.data : this.lanzarError('Formato inválido'))
        );
    }

    public obtenerCapaTerrestreMapa(): Observable<any> {
        return this.http.get<any>(`${base_url}/mapa-general/terrestre`).pipe(
            map(response => response?.data ? response.data : this.lanzarError('Formato inválido'))
        );
    }

    public getGeocercasKPIs(): Observable<any> {
        return this.http.get(`${base_url}/flota-terrestre/geocercas-kpis`);
    }

    // 🟢 ESTE ES EL ENDPOINT MAESTRO DE LA FLOTA GPS QUE USA EL COMPONENTE PARA EL RADAR
    public getFlotaGeoJSON(): Observable<any> {
        // Al agregar ?t= milisegundos, la URL cambia cada 10 segundos y el navegador no puede cachearla
        const timestamp = new Date().getTime();
        return this.http.get<any>(`${base_url}/flota-terrestre/activa?t=${timestamp}`);
    }

    public obtenerCapaNaves(): Observable<any> {
        return this.http.get<any>(`${base_url}/mapa-general/capa-naves`).pipe(
            map(response => response?.data ? response.data : this.lanzarError('Formato inválido'))
        );
    }

    public getAlertasActivas(): Observable<any> {
        return this.http.get(`${base_url}/alertas`);
    }

    public cargarEventosVialesActivos(): void {
        const endpoint = `${base_url}/eventos-viales/activos`;
        this.http.get<any>(endpoint).subscribe({
            next: (geoJsonData) => {
                this.accidentesSubject.next(geoJsonData);
                this.actualizarGemelo('CAPA_ACCIDENTES', geoJsonData);
            },
            error: (error) => { console.error('❌ Error incidentes:', error); }
        });
    }

    // 🟢 Método de carga inicial optimizado
    private cargarFlotaTerrestreGPS(): void {
        this.getFlotaGeoJSON().subscribe({
            next: (geoJsonFlota) => {
                // Al cargar la página, alimentamos tanto el subject como el gemelo digital
                this.terrestreSubject.next(geoJsonFlota);
                this.actualizarGemelo('CAPA_TERRESTRE', geoJsonFlota);
            },
            error: (error) => { console.error('❌ Error cargando Flota Terrestre GPS:', error); }
        });
    }

    public obtenerAccidentesYBloqueosViales(): Observable<any> {
        const urlSocrata = 'https://www.datos.gov.co/resource/7i66-rps2.json?$limit=500';
        const peticionLimpia = fetch(urlSocrata).then(response => {
            if (!response.ok) throw new Error('Error conectando con el INVIAS');
            return response.json();
        });
        return from(peticionLimpia).pipe(
            map((datos: any[]) => {
                const features = datos
                    .filter(incidente => incidente.latitud && incidente.longitud)
                    .map(incidente => ({
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [parseFloat(incidente.longitud), parseFloat(incidente.latitud)] },
                        properties: {
                            estado: incidente.estado_via || 'RESTRINGIDO',
                            descripcion: incidente.corredor_vial_via_que_conduce || 'Reporte vial',
                            jurisdiccion: incidente.jurisdiccion_ditra || 'N/A'
                        }
                    }));
                return { type: 'FeatureCollection', features };
            })
        );
    }

    public vincularMotonave(mmsi: string, idAviso: number, nombreOpcional?: string) {
        const payload = {
            mmsi: mmsi,
            idAviso: idAviso,
            nombreReferencia: nombreOpcional // Esto llegará al 'rawData' del DTO en Node
        };

        // Asumiendo que tu prefijo base de API es '/api/motonaves'
        return this.http.post(`${base_url}/motonaves/vincular`, payload);
    }

    private lanzarError(mensaje: string): never { throw new Error(mensaje); }
}
