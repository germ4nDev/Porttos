/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { PTLEnlaceSTModel } from '../_helpers/models/PTLEnlaceST.model';
import { LocalStorageService } from './local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PTLEnlacesSTService {
  user: PTLUsuarioModel = new PTLUsuarioModel();

  constructor(
    private http: HttpClient,
    private _localStorageService: LocalStorageService
  ) {}

  getRegistros() {
    const url = `${base_url}/enlaces-st`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de enlaces', resp);
        return {
          ok: true,
          enlaces: resp.enlaces
        };
      })
    );
  }

  getRegistroById(id: number) {
    const url = `${base_url}/enlaces-st/${id}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de enlace', resp);
        return {
          ok: true,
          enlace: resp.enlace
        };
      })
    );
  }

  postCrearRegistro(enlace: PTLEnlaceSTModel) {
    const url = `${base_url}/enlaces-st`;
    return this.http.post(url, enlace);
  }

  putModificarRegistro(enlace: PTLEnlaceSTModel) {
    const url = `${base_url}/enlaces-st/${enlace.enlaceId}`;
    return this.http.put(url, enlace).pipe(
      map((resp: any) => {
        console.log('data de enlace modificacda', resp);
        return {
          ok: true,
          enlace: resp.enlace
        };
      })
    );
  }

  deleteEliminarRegistro(_id: number) {
    const url = `${base_url}/enlaces-st/${_id}`;
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de enlace eliminado', resp);
        return {
          ok: true,
          enlace: resp.enlace
        };
      })
    );
  }
}
