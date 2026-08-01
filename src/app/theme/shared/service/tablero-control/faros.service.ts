import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SocketService } from '../sockets.service';
import { LocalStorageService } from '../local-storage.service';
import { FaroModel } from '../../_helpers/models/tablero-control/faro.model';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class FarosService {
    private _faros = new BehaviorSubject<FaroModel[]>([]);
    private _farosChange = new Subject<any>();
    farosChange$ = this._farosChange.asObservable();

    constructor(
        private http: HttpClient,
        private _socketService: SocketService,
        private _localstorageService: LocalStorageService
    ) {
        // CORRECCIÓN 1: 'faros-actualizados' (Igual que en el backend)
        this._socketService.listen('faros-actualizados').subscribe({
            next: payload => {
                console.log('faros-actializados', payload);
                this._farosChange.next(payload);
                this.getAllFaros().subscribe(); // Recarga reactiva
            },
            error: err => console.error('Error en la escucha de sockets:', err)
        });
    }

    get faros$(): Observable<FaroModel[]> {
        return this._faros.asObservable();
    }

    getFarosActuales(): FaroModel[] {
        return this._faros.getValue();
    }

    getAllFaros(): Observable<any> {
        const url = `${base_url}/faros`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.data as FaroModel[]),
            map((faros: FaroModel[]) => {
                return faros.sort((a: any, b: any) => a.nombre_faro.localeCompare(b.nombre_faro));
            }),
            tap(farosOrdenadas => {
                console.log('&&&&&&&&&&&&&& faros servicio', farosOrdenadas);
                this._faros.next(farosOrdenadas);
            })
        );
    }

    getFaroById(id: any): Observable<any> {
        if (!id) {
            throw { statusCode: 400, msg: "El id_faro es requerido" };
        }

        return this.http.get(`${base_url}/faros/${id}`);
    }

    saveFaro(faro: FaroModel): Observable<any> {
        const url = `${base_url}/faros`
        return this.http.post(url, faro).pipe(
            map((resp: any) => {
                return {
                    ok: true,
                    data: resp.data
                }
            })
        )
    }

    updateFaro(faro: FaroModel): Observable<any> {
        const url = `${base_url}/faros/${faro.id_faro}`
        return this.http.put(url, faro).pipe(
            map((resp: any) => {
                console.log('data de faro modificacda', resp)
                return {
                    ok: true,
                    data: resp.data
                }
            })
        )
    }

    deleteFaro(id_faro: string): Observable<any> {
        return this.http.delete(`${base_url}/faros/${id_faro}`);
    }
}
