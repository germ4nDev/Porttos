import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Muelle } from '../../_helpers/models/tablero-control/muelle.model';
import { SocketService } from '../sockets.service';
import { LocalStorageService } from '../local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class MuellesService {
    private _muelles = new BehaviorSubject<Muelle[]>([]);
    private _muellesChange = new Subject<any>();
    muellesChange$ = this._muellesChange.asObservable();

    constructor(
        private http: HttpClient,
        private socketService: SocketService,
        private _localstorageService: LocalStorageService
    ) {
        // CORRECCIÓN 1: 'muelles-actualizados' (Igual que en el backend)
        this.socketService.listen('muelles-actualizados').subscribe({
            next: payload => {
                console.log('muelles-actializados', payload.msg);
                this._muellesChange.next(payload);
                this.cargarMuelles().subscribe(); // Recarga reactiva
            },
            error: err => console.error('Error en la escucha de sockets:', err)
        });
    }

    get muelles$(): Observable<Muelle[]> {
        return this._muelles.asObservable();
    }

    getMuellesActuales(): Muelle[] {
        return this._muelles.getValue();
    }

    cargarMuelles() {
        console.log('Consultando y ordenando muelles del servidor...');
        const url = `${base_url}/muelles`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.data as Muelle[]),
            map((muelles: Muelle[]) => {
                return muelles.sort((a: any, b: any) => a.codigo_muelle.localeCompare(b.codigo_muelle));
            }),
            tap(muellesOrdenadas => {
                console.log('&&&&&&&&&&&&&& muelles servicio', muellesOrdenadas);
                this._muelles.next(muellesOrdenadas);
            })
        );
    }

    getAllMuelles(): Observable<any> {
        return this.http.get(`${base_url}/muelles`);
    }

    getMuelleByCode(id: string): Observable<any> {
        return this.http.get(`${base_url}/muelles/${id}`); // Ojo al plural /muelles/
    }

    saveMuelle(muelle: Muelle): Observable<any> {
        // CORRECCIÓN 4: Arreglado el typo $${base_url} y usamos el id_muelle para el endpoint
        return muelle.id_interno
            ? this.http.put(`${base_url}/muelles/${muelle.id_interno}`, muelle)
            : this.http.post(`${base_url}/muelles`, muelle);
    }

    deleteMuelle(id_interno: string): Observable<any> {
        return this.http.delete(`${base_url}/muelles/${id_interno}`);
    }
}
