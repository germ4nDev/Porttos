/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PTLScriptsModel } from '../_helpers/models/PTLScripts.model';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PTLScriptsService {
  constructor(private http: HttpClient) {}

  getRegistros() {
    const url = `${base_url}/scripts`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de scripts', resp);
        return {
          ok: true,
          scripts: resp.scripts
        };
      })
    );
  }

  getRegistroById(id: string) {
    const url = `${base_url}/scripts/${id}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de script', resp);
        return {
          ok: true,
          script: resp.script
        };
      })
    );
  }

  postCrearRegistro(script: PTLScriptsModel) {
    const url = `${base_url}/scripts`;
    return this.http.post(url, script);
  }

  putModificarRegistro(script: PTLScriptsModel) {
    const url = `${base_url}/scripts`;
    return this.http.put(url, script).pipe(
      map((resp: any) => {
        console.log('data de script modificada', resp);
        return {
          ok: true,
          script: resp.script
        };
      })
    );
  }

  deleteEliminarRegistro(_id: string) {
    const url = `${base_url}/scripts/${_id}`;
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de script eliminado', resp);
        return {
          ok: true,
          script: resp.script
        };
      })
    );
  }
}
