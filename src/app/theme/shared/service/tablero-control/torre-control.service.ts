/*
    Author: German Valencia
    Pattern: QPLUS Frontend Service - Conexión API KPIs
    Update: Soporte para multi-puerto y unificación de datos
*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { SocketService } from '../../service/sockets.service';

@Injectable({
    providedIn: 'root'
})
export class TorreControlService {
    private apiUrl = `${environment.apiUrl}/torre-control`;

    constructor(
        private http: HttpClient,
        private socketService: SocketService,
    ) { }

    // Método para obtener layouts dinámicos (guardados en BD)
    getLayout(codigo: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/layout/${codigo}`);
    }

    // Método para guardar cambios de posiciones del Gridster
    saveLayout(payload: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/layout/save`, payload);
    }
}
