import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TipoInfraestructura } from '../../_helpers/models/tablero-control/tipo-infraestructura.model';
import { SocketService } from '../sockets.service';
import { LocalStorageService } from '../local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class TiposTipoInfraestructuraService {
    private _tiposInfra = new BehaviorSubject<TipoInfraestructura[]>([]);
    private _tiposInfraChange = new Subject<any>();
    tiposInfraChange$ = this._tiposInfraChange.asObservable();

    constructor(
        private http: HttpClient,
        private socketService: SocketService,
        private _localstorageService: LocalStorageService
    ) {
        // CORRECCIÓN 1: 'tiposInfra-actualizados' (Igual que en el backend)
        this.socketService.listen('tiposInfra-actualizados').subscribe({
            next: payload => {
                console.log('tiposInfra-actializados', payload.msg);
                this._tiposInfraChange.next(payload);
                this.cargarTipoInfraestructuras().subscribe(); // Recarga reactiva
            },
            error: err => console.error('Error en la escucha de sockets:', err)
        });
    }

    get tiposInfra$(): Observable<TipoInfraestructura[]> {
        return this._tiposInfra.asObservable();
    }

    getTipoInfraestructurasActuales(): TipoInfraestructura[] {
        return this._tiposInfra.getValue();
    }

    cargarTipoInfraestructuras() {
        console.log('Consultando y ordenando tiposInfra del servidor...');
        const url = `${base_url}/tipos-infraestructura`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.data as TipoInfraestructura[]),
            map((tiposInfra: TipoInfraestructura[]) => {
                return tiposInfra.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
            }),
            tap(tiposInfraOrdenadas => {
                console.log('&&&&&&&&&&&&&& tiposInfra servicio', tiposInfraOrdenadas);
                this._tiposInfra.next(tiposInfraOrdenadas);
            })
        );
    }

    getAllTipoInfraestructuras(): Observable<any> {
        return this.http.get(`${base_url}/tipos-infraestructura`);
    }

    getTipoInfraestructuraByCode(id: string): Observable<any> {
        return this.http.get(`${base_url}/tipos-infraestructura/${id}`); // Ojo al plural /tiposInfra/
    }

    saveTipoInfraestructura(tipo: TipoInfraestructura): Observable<any> {
        // CORRECCIÓN 4: Arreglado el typo $${base_url} y usamos el id_tipo para el endpoint
        return tipo.id_tipo
            ? this.http.put(`${base_url}/tipos-infraestructura/${tipo.id_tipo}`, tipo)
            : this.http.post(`${base_url}/tipos-infraestructura`, tipo);
    }

    deleteTipoInfraestructura(id_tipo: string): Observable<any> {
        return this.http.delete(`${base_url}/tipos-infraestructura/${id_tipo}`);
    }
}
