/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { PTLTiposLogsModel } from '../_helpers/models/PTLTiposLogs.model';
import { LocalStorageService } from './local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class PTLTiposLogsService {
    user: PTLUsuarioModel = new PTLUsuarioModel();

    constructor(
        private http: HttpClient,
        private _localStorageService: LocalStorageService
    ) { }

    getRegistros() {
        const url = `${base_url}/tipos-log`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('servicio de tiposlogs', resp);
                return {
                    ok: true,
                    tiposLog: resp.tiposLog
                };
            })
        );
    }

    getRegistroById(id: number) {
        const url = `${base_url}/tipos-logs/${id}`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('data de tiposlogs', resp);
                return {
                    ok: true,
                    tipolog: resp.tipolog
                };
            })
        );
    }

    postCrearRegistro(tipolog: PTLTiposLogsModel) {
        const url = `${base_url}/tipos-logs`;
        return this.http.post(url, tipolog);
    }

    putModificarRegistro(tipoLog: PTLTiposLogsModel) {
        const url = `${base_url}/tipos-logs/${tipoLog.codigoTipoLog}`;
        return this.http.put(url, tipoLog).pipe(
            map((resp: any) => {
                console.log('data de tiposlogs modificacda', resp);
                return {
                    ok: true,
                    tipolog: resp.tipolog
                };
            })
        );
    }

    deleteEliminarRegistro(_id: string) {
        const url = `${base_url}/tipos-logs/${_id}`;
        return this.http.delete(url).pipe(
            map((resp: any) => {
                console.log('data de tiposlogs eliminado', resp);
                return {
                    ok: true,
                    tipolog: resp.tipolog
                };
            })
        );
    }
}
