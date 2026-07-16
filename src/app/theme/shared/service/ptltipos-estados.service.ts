/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { PTLTiposEstadosModel } from '../_helpers/models/PTLTiposEstados.model';
import { LocalStorageService } from './local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PTLTiposEstadosService {
  user: PTLUsuarioModel = new PTLUsuarioModel();

  constructor(
    private http: HttpClient,
    private _localStorageService: LocalStorageService
  ) {}

  getRegistros() {
    const url = `${base_url}/tipos-estados`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de tipoEstado', resp);
        return {
          ok: true,
          tiposEstados: resp.tiposEstados
        };
      })
    );
  }

  getRegistroById(id: number) {
    const url = `${base_url}/tipos-estados/${id}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de tipoEstado', resp);
        return {
          ok: true,
          tipoEstado: resp.tipoEstado
        };
      })
    );
  }

  postCrearRegistro(tipoEstado: PTLTiposEstadosModel) {
    const url = `${base_url}/tipos-estados`;
    return this.http.post(url, tipoEstado);
  }

  putModificarRegistro(tipoEstado: PTLTiposEstadosModel) {
    const url = `${base_url}/tipos-estados/${tipoEstado.tipoEstadoId}`;
    return this.http.put(url, tipoEstado).pipe(
      map((resp: any) => {
        console.log('data de tipoEstado modificacda', resp);
        return {
          ok: true,
          tipoEstado: resp.tipoEstado
        };
      })
    );
  }

  deleteEliminarRegistro(_id: number) {
    const url = `${base_url}/tipos-estados/${_id}`;
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de tipoEstado eliminado', resp);
        return {
          ok: true,
          tipoEstado: resp.tipoEstado
        };
      })
    );
  }
}
