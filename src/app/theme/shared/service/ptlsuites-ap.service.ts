/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { PTLSuiteAPModel } from '../_helpers/models/PTLSuiteAP.model';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from './local-storage.service';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { SocketService } from './sockets.service';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class PtlSuitesAPService {
    user: PTLUsuarioModel = new PTLUsuarioModel();
    private _suites = new BehaviorSubject<PTLSuiteAPModel[]>([]);
    private _suitesChange = new Subject<any>();
    suitesChange$ = this._suitesChange.asObservable();

    constructor(
        private http: HttpClient,
        private socketService: SocketService,
        private _localStorageService: LocalStorageService
    ) {
        this.socketService.listen('aplicaciones-actualizadas').subscribe({
            next: (payload) => {
                console.log('Evento de Socket.IO recibido:', payload.msg);
                this._suitesChange.next(payload);
                this.cargarRegistros().subscribe();
            },
            error: (err) => console.error('Error en la escucha de sockets:', err)
        });
    }

    get suites$(): Observable<PTLSuiteAPModel[]> {
        return this._suites.asObservable();
    }

    getSuitesActuales(): PTLSuiteAPModel[] {
        return this._suites.getValue()
    }


    geSuitesAP() {
        return this.http.get<PTLSuiteAPModel>(`${environment.apiUrl}/suites`).pipe(
            map((resp: any) => {
                return {
                    ok: true,
                    suites: resp.suites
                };
            })
        );
    }

    cargarRegistros() {
        console.log('Consultando y ordenando suites del servidor...');
        const url = `${base_url}/suites`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.suites as PTLSuiteAPModel[]),
            // map((suites: PTLSuiteAPModel[]) => {
            //     return suites.sort((a: any, b: any) => a.nombreModulo.localeCompare(b.nombreModulo));
            // }),
            tap((suitesOrdenadas) => {
                this._suites.next(suitesOrdenadas);
            })
        );
    }

    getSuiteAPById(id: string) {
        const url = `${base_url}/suites/${id}`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('data del suite', resp);
                return {
                    ok: true,
                    suite: resp.suite
                };
            })
        );
    }

    crearSuiteAP(suite: PTLSuiteAPModel) {
        console.log('nueva suite', suite);

        const url = `${base_url}/suites`;
        return this.http.post(url, suite).pipe(
            map((resp: any) => {
                return {
                    ok: true,
                    suite: resp.suite
                }
            })
        )
    }

    actualizarSuiteAP(suite: PTLSuiteAPModel) {
        const url = `${base_url}/suites/${suite.codigoSuite}`;
        return this.http.put(url, suite).pipe(
            map((resp: any) => {
                console.log('data de SuiteAP modificacda', resp);
                return {
                    ok: true,
                    suite: resp.suite
                };
            })
        );
    }

    eliminarSuiteAP(_id: number) {
        const url = `${base_url}/suites/${_id}`;
        return this.http.delete(url).pipe(
            map((resp: any) => {
                console.log('data de SuiteAP eliminado', resp);
                return {
                    ok: true,
                    suite: resp.suite
                };
            })
        );
    }
}
