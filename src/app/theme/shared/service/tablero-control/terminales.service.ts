import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Terminal } from '../../_helpers/models/tablero-control/terminal.model';
import { SocketService } from '../sockets.service';
import { LocalStorageService } from '../local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class TerminalesService {
    private _terminales = new BehaviorSubject<Terminal[]>([]);
    private _terminalesChange = new Subject<any>();
    terminalesChange$ = this._terminalesChange.asObservable();

    constructor(
        private http: HttpClient,
        private socketService: SocketService,
        private _localstorageService: LocalStorageService
    ) {
        // CORRECCIÓN 1: 'terminales-actualizados' (Igual que en el backend)
        this.socketService.listen('terminales-actualizados').subscribe({
            next: payload => {
                console.log('terminales-actializados', payload.msg);
                this._terminalesChange.next(payload);
                this.cargarTerminals().subscribe(); // Recarga reactiva
            },
            error: err => console.error('Error en la escucha de sockets:', err)
        });
    }

    get terminales$(): Observable<Terminal[]> {
        return this._terminales.asObservable();
    }

    getTerminalsActuales(): Terminal[] {
        return this._terminales.getValue();
    }

    cargarTerminals() {
        console.log('Consultando y ordenando terminales del servidor...');
        const url = `${base_url}/terminales`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.data as Terminal[]),
            map((terminales: Terminal[]) => {
                return terminales.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
            }),
            tap(terminalesOrdenadas => {
                console.log('&&&&&&&&&&&&&& terminales servicio', terminalesOrdenadas);
                this._terminales.next(terminalesOrdenadas);
            })
        );
    }

    getAllTerminals(): Observable<any> {
        return this.http.get(`${base_url}/terminales`);
    }

    getTerminalByCode(id: string): Observable<any> {
        return this.http.get(`${base_url}/terminales/${id}`); // Ojo al plural /terminales/
    }

    saveTerminal(terminal: Terminal): Observable<any> {
        const url = `${base_url}/terminales`
        return this.http.post(url, terminal).pipe(
            map((resp: any) => {
                return {
                    ok: true,
                    data: resp.data
                }
            })
        )
    }

    updateTerminal(terminal: Terminal): Observable<any> {
        const url = `${base_url}/terminales/${terminal.id_terminal}`
        return this.http.put(url, terminal).pipe(
            map((resp: any) => {
                console.log('data de terminal modificacda', resp)
                return {
                    ok: true,
                    data: resp.data
                }
            })
        )
    }

    deleteTerminal(id_terminal: string): Observable<any> {
        return this.http.delete(`${base_url}/terminales/${id_terminal}`);
    }
}
