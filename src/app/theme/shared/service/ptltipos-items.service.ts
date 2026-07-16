/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { PTLTipoItemModel } from '../_helpers/models/PTLTipoItem.model';
import { LocalStorageService } from './local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class PtltiposItemsService {
    user: PTLUsuarioModel = new PTLUsuarioModel();

    constructor(
        private http: HttpClient,
        private _localStorageService: LocalStorageService
    ) { }

    getRegistros() {
        const url = `${base_url}/tipos-items`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('servicio de tipoItem', resp);
                return {
                    ok: true,
                    tiposItems: resp.tiposItems
                };
            })
        );
    }

    getRegistroById(id: string) {
        const url = `${base_url}/tipos-items/${id}`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('data de tipoItem', resp);
                return {
                    ok: true,
                    tipoItem: resp.tipoItem
                };
            })
        );
    }

    postCrearRegistro(tipoItem: PTLTipoItemModel) {
        const url = `${base_url}/tipos-items`;
        return this.http.post(url, tipoItem);
    }

    putModificarRegistro(tipoItem: PTLTipoItemModel) {
        const url = `${base_url}/tipos-items/${tipoItem.tipoItemId}`;
        return this.http.put(url, tipoItem).pipe(
            map((resp: any) => {
                console.log('data de tipoItem modificacda', resp);
                return {
                    ok: true,
                    tipoItem: resp.tipoItem
                };
            })
        );
    }

    deleteEliminarRegistro(_id: number) {
        const url = `${base_url}/tipos-items/${_id}`;
        return this.http.delete(url).pipe(
            map((resp: any) => {
                console.log('data de tipoItem eliminado', resp);
                return {
                    ok: true,
                    tipoItem: resp.tipoItem
                };
            })
        );
    }
}
