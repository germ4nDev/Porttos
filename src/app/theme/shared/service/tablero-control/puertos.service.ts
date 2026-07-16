import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Puerto } from '../../_helpers/models/tablero-control/puerto.model';
import { SocketService } from '../sockets.service';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class PuertosService {
    private _puertos = new BehaviorSubject<Puerto[]>([]);
    private _puertosChange = new Subject<any>();
    puertosChange$ = this._puertosChange.asObservable();

    constructor(
        private http: HttpClient,
        private socketService: SocketService
    ) {
        // CORRECCIÓN 1: 'puertos-actualizados' (Igual que en el backend)
        this.socketService.listen('puertos-actualizados').subscribe({
            next: payload => {
                console.log('puertos-actializados', payload.msg);
                this._puertosChange.next(payload);
                this.cargarPuertos().subscribe(); // Recarga reactiva
            },
            error: err => console.error('Error en la escucha de sockets:', err)
        });
    }

    get puertos$(): Observable<Puerto[]> {
        return this._puertos.asObservable();
    }

    getPuertosActuales(): Puerto[] {
        return this._puertos.getValue();
    }

    cargarPuertos() {
        console.log('Consultando y ordenando puertos del servidor...');
        const url = `${base_url}/puertos`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.data as Puerto[]),
            map((puertos: Puerto[]) => {
                return puertos.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
            }),
            tap(puertosOrdenadas => {
                console.log('&&&&&&&&&&&&&& puertos servicio', puertosOrdenadas);
                this._puertos.next(puertosOrdenadas);
            })
        );
    }

    getAllPuertos(): Observable<any> {
        return this.http.get(`${base_url}/puertos`);
    }

    getPuertoByCode(id: string): Observable<any> {
        return this.http.get(`${base_url}/puertos/${id}`); // Ojo al plural /puertos/
    }

    savePuerto(puerto: Puerto): Observable<any> {
        // CORRECCIÓN 4: Arreglado el typo $${base_url} y usamos el id_puerto para el endpoint
        return puerto.id_puerto
            ? this.http.put(`${base_url}/puertos/${puerto.id_puerto}`, puerto)
            : this.http.post(`${base_url}/puertos`, puerto);
    }

    deletePuerto(id_puerto: string): Observable<any> {
        return this.http.delete(`${base_url}/puertos/${id_puerto}`);
    }
}
