import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Infraestructura } from '../../_helpers/models/tablero-control/infraestructura.model';
import { SocketService } from '../sockets.service';
import { LocalStorageService } from '../local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class InfraestructuraPortuariaService {
    private _infraestructuras = new BehaviorSubject<Infraestructura[]>([]);
    private _infraestructurasChange = new Subject<any>();
    infraestructurasChange$ = this._infraestructurasChange.asObservable();

    constructor(
        private http: HttpClient,
        private socketService: SocketService,
        private _localstorageService: LocalStorageService
    ) {
        // CORRECCIÓN 1: 'infraestructuras-actualizados' (Igual que en el backend)
        this.socketService.listen('infraestructuras-actualizados').subscribe({
            next: payload => {
                console.log('infraestructuras-actializados', payload.msg);
                this._infraestructurasChange.next(payload);
                this.cargarInfraestructuras().subscribe(); // Recarga reactiva
            },
            error: err => console.error('Error en la escucha de sockets:', err)
        });
    }

    get infraestructuras$(): Observable<Infraestructura[]> {
        return this._infraestructuras.asObservable();
    }

    getInfraestructurasActuales(): Infraestructura[] {
        return this._infraestructuras.getValue();
    }

    cargarInfraestructuras() {
        console.log('Consultando y ordenando infraestructuras del servidor...');
        const url = `${base_url}/infraestructura`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.data as Infraestructura[]),
            map((infraestructuras: Infraestructura[]) => {
                return infraestructuras.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
            }),
            tap(infraestructurasOrdenadas => {
                console.log('&&&&&&&&&&&&&& infraestructuras servicio', infraestructurasOrdenadas);
                this._infraestructuras.next(infraestructurasOrdenadas);
            })
        );
    }

    getAllInfraestructuras(): Observable<any> {
        return this.http.get(`${base_url}/infraestructura`);
    }

    getInfraestructuraByCode(id: string): Observable<any> {
        return this.http.get(`${base_url}/infraestructura/${id}`); // Ojo al plural /infraestructuras/
    }

    saveInfraestructura(infra: Infraestructura): Observable<any> {
        // CORRECCIÓN 4: Arreglado el typo $${base_url} y usamos el id_infra para el endpoint
        return infra.id_infraestructura
            ? this.http.put(`${base_url}/infraestructura/${infra.id_infraestructura}`, infra)
            : this.http.post(`${base_url}/infraestructuras`, infra);
    }

    deleteInfraestructura(id_infraestructura: string): Observable<any> {
        return this.http.delete(`${base_url}/infraestructura/${id_infraestructura}`);
    }
}
