import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MaritimoService {

    // 🚨 IMPORTANTE: Ajusta esta ruta base para que coincida con tu Express
    // Por ejemplo, si tu backend corre en http://localhost:3000/api/torre-control
    private baseUrl = `${environment.apiUrl}/maritimo`;

    constructor(private http: HttpClient) { }

    /**
     * 1. Obtiene los KPIs operativos y la productividad (6 KPIs superiores)
     */
    obtenerOperacionesSLA(puerto: string): Observable<any> {
        const params = new HttpParams().set('puerto', puerto);

        return this.http.get<any>(`${this.baseUrl}/operaciones-sla`, { params }).pipe(
            catchError(error => {
                console.error('Error fetching Operaciones SLA:', error);
                // Retornamos un fallback vacío para que el dashboard no se rompa
                return of({ success: false, data: {} });
            })
        );
    }

    /**
     * 2. Obtiene la tabla de motonaves / LineUp
     */
    obtenerLineUp(puerto: string): Observable<any> {
        const params = new HttpParams().set('puerto', puerto);

        return this.http.get<any>(`${this.baseUrl}/lineup`, { params }).pipe(
            catchError(error => {
                console.error('Error fetching LineUp:', error);
                return of({ success: false, data: [] });
            })
        );
    }

    /**
     * 3. Obtiene el clima y estado del canal
     */
    obtenerClima(puerto: string): Observable<any> {
        const params = new HttpParams().set('puerto', puerto);

        return this.http.get<any>(`${this.baseUrl}/clima`, { params }).pipe(
            catchError(error => {
                console.error('Error fetching Clima:', error);
                return of({
                    success: false,
                    data: { marea: 'N/A', pleamar: 'N/A', visibilidad: 'N/A', viento: 'N/A', estadoCanal: 'Desconocido' }
                });
            })
        );
    }

    /**
     * 4. ORQUESTADOR MAESTRO: Obtiene absolutamente toda la pestaña marítima
     * (Úsalo si tu componente principal carga todo de un solo golpe)
     */
    obtenerResumenOperativo(puerto: string): Observable<any> {
        const params = new HttpParams().set('puerto', puerto);

        return this.http.get<any>(`${this.baseUrl}/resumen`, { params }).pipe(
            catchError(error => {
                console.error('Error fetching Resumen Operativo Completo:', error);
                return of({ success: false, data: {} });
            })
        );
    }

    obtenerCapaMaritimaMapa(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/mapa-posiciones`).pipe(
            map(response => {
                if (response.exito) {
                    return response.data;
                }
                // Si falla o viene vacío, retornamos un FeatureCollection vacío para que el mapa no explote
                return { type: 'FeatureCollection', features: [] };
            })
        );
    }

    obtenerCapaInfraestructuraMapa(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/mapa-infraestructura`).pipe(
            map(response => response.exito ? response.data : { type: 'FeatureCollection', features: [] })
        );
    }


}
