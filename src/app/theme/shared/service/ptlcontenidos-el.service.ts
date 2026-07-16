/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { PTLContenidoELModel } from '../_helpers/models/PTLContenidoEL.model';
import { LocalStorageService } from './local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PTLContenidosELService {
  user: PTLUsuarioModel = new PTLUsuarioModel();

  constructor(
    private http: HttpClient,
    private _localStorageService: LocalStorageService
  ) {}

  getRegistros() {
    const url = `${base_url}/contenidos-el`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de contenidos', resp);
        return {
          ok: true,
          contenidos: resp.contenidos
        };
      })
    );
  }

  getRegistroById(id: number) {
    const url = `${base_url}/contenidos-el/${id}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de contenido', resp);
        return {
          ok: true,
          contenido: resp.contenido
        };
      })
    );
  }

  postCrearRegistro(contenido: PTLContenidoELModel) {
    const url = `${base_url}/contenidos-el`;
    return this.http.post(url, contenido);
  }

  putModificarRegistro(contenido: PTLContenidoELModel) {
    const url = `${base_url}/contenidos-el/${contenido.contenidoId}`;
    return this.http.put(url, contenido).pipe(
      map((resp: any) => {
        console.log('data de contenido modificacda', resp);
        return {
          ok: true,
          contenido: resp.contenido
        };
      })
    );
  }

  deleteEliminarRegistro(_id: number) {
    const url = `${base_url}/contenidos-el/${_id}`;
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de contenido eliminado', resp);
        return {
          ok: true,
          contenido: resp.contenido
        };
      })
    );
  }
}
