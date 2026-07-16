/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { PTLSitiosAPModel } from '../_helpers/models/PTLSitioAP.model';
import { LocalStorageService } from './local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PTLSitiosAPService {
  user: PTLUsuarioModel = new PTLUsuarioModel();

  constructor(
    private http: HttpClient,
    private _localStorageService: LocalStorageService
  ) {}

  getRegistros() {
    const url = `${base_url}/sitios-ap`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        return {
          ok: true,
          sitios: resp.sitios
        };
      })
    );
  }

  getRegistroById(id: number) {
    const url = `${base_url}/sitios-ap/${id}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de sitio', resp);
        return {
          ok: true,
          sitio: resp.sitio
        };
      })
    );
  }

  postCrearRegistro(sitio: PTLSitiosAPModel) {
    const url = `${base_url}/sitios-ap`;
    return this.http.post(url, sitio);
  }

  putModificarRegistro(sitio: PTLSitiosAPModel) {
    const url = `${base_url}/sitios-ap/${sitio.sitioId}`;
    return this.http.put(url, sitio).pipe(
      map((resp: any) => {
        console.log('data de sitio modificacda', resp);
        return {
          ok: true,
          sitio: resp.sitio
        };
      })
    );
  }

  deleteEliminarRegistro(_id: number) {
    const url = `${base_url}/sitios-ap/${_id}`;
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de sitio eliminado', resp);
        return {
          ok: true,
          sitio: resp.sitio
        };
      })
    );
  }
}
