/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { PTLVersionAP } from '../_helpers/models/PTLVersionAP.model';
import { LocalStorageService } from './local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PtlversionesApService {
  user: PTLUsuarioModel = new PTLUsuarioModel();

  constructor(
    private http: HttpClient,
    private _localStorageService: LocalStorageService
  ) {}

  getRegistros() {
    const url = `${base_url}/versiones`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de versiones', resp);
        return {
          ok: true,
          versiones: resp.versiones
        };
      })
    );
  }

  getRegistroById(id: string) {
    const url = `${base_url}/versiones/${id}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de la version', resp);
        return {
          ok: true,
          version: resp.version
        };
      })
    );
  }

  postCrearRegistro(verison: any) {
    const url = `${base_url}/versiones`;
    return this.http.post(url, verison);
  }

  putModificarRegistro(version: PTLVersionAP) {
    console.log('data', version);
    const url = `${base_url}/versiones/${version.codigoVersion}`;
    return this.http.put(url, version).pipe(
      map((resp: any) => {
        console.log('data de version modificacda', resp);
        return {
          ok: true,
          version: resp.version
        };
      })
    );
  }

  deleteEliminarRegistro(_id: number) {
    const url = `${base_url}/versiones/${_id}`;
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de version eliminado', resp);
        return {
          ok: true,
          version: resp.version
        };
      })
    );
  }
}
