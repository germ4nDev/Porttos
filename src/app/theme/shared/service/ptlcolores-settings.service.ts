/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { PTLColorSettingModel } from '../_helpers/models/PTLColorSetting.model';
import { LocalStorageService } from './local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class PtlColoresSettingsService {
    user: PTLUsuarioModel = new PTLUsuarioModel();

    constructor(
        private http: HttpClient,
        private _localStorageService: LocalStorageService
    ) { }

    getRegistros() {
        const url = `${base_url}/colores`;
        return this.http.get(url)
            .pipe(
                map((resp: any) => {
                    // console.log('servicio de colores', resp);
                    return {
                        ok: true,
                        coloresNav: resp.coloresNav
                    };
                })
            );
    }

    getRegistroById(id: string) {
        const url = `${base_url}/colores/${id}`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                // console.log('data de colorNav', resp);
                return {
                    ok: true,
                    colorNav: resp.colorNav
                };
            })
        );
    }

    postCrearRegistro(colorNav: PTLColorSettingModel) {
        const url = `${base_url}/colores`;
        return this.http.post(url, colorNav);
    }

    putModificarRegistro(colorNav: PTLColorSettingModel, settingId: string) {
        const url = `${base_url}/colores/${settingId}`;
        return this.http.put(url, colorNav).pipe(
            map((resp: any) => {
                // console.log('data de colorNav modificacda', resp);
                return {
                    ok: true,
                    colorNav: resp.colorNav
                };
            })
        );
    }

    deleteEliminarRegistro(_id: number) {
        const url = `${base_url}/colores/${_id}`;
        return this.http.delete(url).pipe(
            map((resp: any) => {
                // console.log('data de colorNav eliminado', resp);
                return {
                    ok: true,
                    colorNav: resp.colorNav
                };
            })
        );
    }
}
