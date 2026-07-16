/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PTLTiposScriptsModel } from '../_helpers/models/PTLTiposScript.model';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PTLTiposScriptsService {
  constructor(private http: HttpClient) {}

  getRegistros() {
    const url = `${base_url}/tipos-scripts`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de tipos de scripts', resp);
        return {
          ok: true,
          tiposScripts: resp.tiposScripts
        };
      })
    );
  }

  getRegistroById(id: string) {
    const url = `${base_url}/tipos-scripts/${id}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de tipo de script', resp);
        return {
          ok: true,
          tipoScript: resp.tipoScript
        };
      })
    );
  }

  postCrearRegistro(tipoScript: PTLTiposScriptsModel) {
    const url = `${base_url}/tipos-scripts`;
    return this.http.post(url, tipoScript);
  }

  putModificarRegistro(tipoScript: PTLTiposScriptsModel) {
    const url = `${base_url}/tipos-scripts`;
    return this.http.put(url, tipoScript).pipe(
      map((resp: any) => {
        console.log('data de tipo de script modificada', resp);
        return {
          ok: true,
          tipoScript: resp.tipoScript
        };
      })
    );
  }

  deleteEliminarRegistro(_id: string) {
    const url = `${base_url}/tipos-scripts/${_id}`;
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de tipo de script eliminado', resp);
        return {
          ok: true,
          tipoScript: resp.tipoScript
        };
      })
    );
  }
}
