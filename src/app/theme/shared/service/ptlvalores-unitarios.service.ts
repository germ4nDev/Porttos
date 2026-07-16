/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { LocalStorageService } from './local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class PtlvaloresUnitariosService {
    user: PTLUsuarioModel = new PTLUsuarioModel();

    constructor(
        private http: HttpClient,
        private _localStorageService: LocalStorageService
    ) { }

    getRegistros() {
        const url = `${base_url}/items`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('servicio de valoresUnitarios', resp);
                return {
                    ok: true,
                    valoresUnitarios: resp.valoresUnitarios
                };
            })
        );
    }

    getRegistroById(id: string) {
        const url = `${base_url}/items/${id}`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('data de la valorUnitario', resp);
                return {
                    ok: true,
                    valorUnitario: resp.valorUnitario
                };
            })
        );
    }

    postCrearRegistro(valorUnitario: any) {
        const url = `${base_url}/items`;
        return this.http.post(url, valorUnitario);
    }

    putModificarRegistro(valorUnitario: any, valorUnitarioId: string) {
        const url = `${base_url}/items/${valorUnitarioId}`;
        return this.http.put(url, valorUnitario).pipe(
            map((resp: any) => {
                console.log('data de valorUnitario modificacda', resp);
                return {
                    ok: true,
                    valorUnitario: resp.valorUnitario
                };
            })
        );
    }

    deleteEliminarRegistro(_id: number) {
        const url = `${base_url}/items/${_id}`;
        return this.http.delete(url).pipe(
            map((resp: any) => {
                console.log('data de valorUnitario eliminado', resp);
                return {
                    ok: true,
                    valorUnitario: resp.valorUnitario
                };
            })
        );
    }
}
