/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { PTLEstadoModel } from '../_helpers/models/PTLEstado.model';
import { LocalStorageService } from './local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PTLEstadosService {
  user: PTLUsuarioModel = new PTLUsuarioModel();

  constructor(
    private http: HttpClient,
    private _localStorageService: LocalStorageService
  ) {}

  getRegistros() {
    const url = `${base_url}/estados`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de estado', resp);
        return {
          ok: true,
          estados: resp.estados
        };
      })
    );
  }

  getRegistroById(id: number) {
    const url = `${base_url}/estados/${id}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de estado', resp);
        return {
          ok: true,
          estado: resp.estado
        };
      })
    );
  }

  postCrearRegistro(estado: PTLEstadoModel) {
    const url = `${base_url}/estados`;
    return this.http.post(url, estado);
  }

  putModificarRegistro(estado: PTLEstadoModel) {
    const url = `${base_url}/estados/${estado.estadoId}`;
    return this.http.put(url, estado).pipe(
      map((resp: any) => {
        console.log('data de estado modificacda', resp);
        return {
          ok: true,
          estado: resp.estado
        };
      })
    );
  }

  deleteEliminarRegistro(_id: number) {
    const url = `${base_url}/estados/${_id}`;
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de estado eliminado', resp);
        return {
          ok: true,
          estado: resp.estado
        };
      })
    );
  }
}
