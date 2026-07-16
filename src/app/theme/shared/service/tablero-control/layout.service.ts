import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Puerto } from '../../_helpers/models/tablero-control/puerto.model';
import { SocketService } from '../sockets.service';
import { LayoutModel } from '../../_helpers/models/tablero-control/layout.model';
import { LocalStorageService } from '../local-storage.service';

const base_url = environment.apiUrl;

interface LayoutResponse {
    success: boolean;
    esLayoutPorDefecto: boolean;
    data: any[];
}

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    private _layout = new BehaviorSubject<Puerto[]>([]);
    private _layoutsChange = new Subject<any>();
    layoutsChange$ = this._layoutsChange.asObservable();
    usuario: string = ''

    constructor(private http: HttpClient,
        private socketService: SocketService
    ) {
        // CORRECCIÓN 1: 'layouts-actualizados' (Igual que en el backend)
        this.socketService.listen('layouts-actualizados').subscribe({
            next: payload => {
                console.log('layouts-actializados', payload.msg);
                this._layoutsChange.next(payload);
                this.cargarLayout().subscribe(); // Recarga reactiva
            },
            error: err => console.error('Error en la escucha de sockets:', err)
        });
    }

    get layouts$(): Observable<LayoutModel[]> {
        return this._layout.asObservable();
    }

    getLayoutActuales(): LayoutModel[] {
        return this._layout.getValue();
    }

    cargarLayout(usuario?: string) {
        const user = usuario ? usuario : 'SISTEMA_DEFAULT'
        console.log('Consultando y ordenando layout del servidor...');
        const url = `${base_url}/layout/obtener/${user}`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.data as LayoutModel[]),
            tap(layout => {
                console.log('&&&&&&&&&&&&&& layouts servicio', layout);
                this._layout.next(layout);
            })
        );
    }

    /**
     * 🚀 EL MÉTODO NUEVO: Trae el layout específico de una pestaña para un usuario
     */
    obtenerLayoutPorUsuario(codigoUsuario: string, codigoDashboard: string): Observable<LayoutResponse> {
        // Opción A: Si tu backend espera el código en la URL (Ruta RESTful)
        return this.http.get<LayoutResponse>(`${base_url}/layout/tablero/${codigoUsuario}/${codigoDashboard}`);
        // Opción B: Si tu backend lo espera como parámetro de consulta (?dashboard=...)
        // return this.http.get<LayoutResponse>(`${base_url}/layout/obtener/${codigoUsuario}?dashboard=${codigoDashboard}`);
    }

    /**
     * Trae el layout del usuario (Por defecto / Histórico)
     */
    obtenerTablero(codigoUsuario: string): Observable<LayoutResponse> {
        return this.http.get<LayoutResponse>(`${base_url}/layout/obtener/${codigoUsuario}`);
    }

    /**
     * Persiste las coordenadas actuales de Gridster en la BD
     */
    guardarTablero(codigoUsuario: string, codigoDashboard: string, layout: any[]): Observable<any> {
        return this.http.post<any>(`${base_url}/layout/guardar`, {
            codigo_usuario: codigoUsuario,
            codigo_dashboard: codigoDashboard, // ¡Importante guardar también a qué pestaña pertenece!
            layout: layout
        });
    }
}
