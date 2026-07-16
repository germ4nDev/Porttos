/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PTLPaquetesSCModel } from '../_helpers/models/PTLPaquetesSC.model';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { LocalStorageService } from './local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PTLPaquetesSCService {
  user: PTLUsuarioModel = new PTLUsuarioModel();

  constructor(
    private http: HttpClient,
    private _localStorageService: LocalStorageService
  ) {}

  getRegistros() {
    const url = `${base_url}/paquetes-sc`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de paquete', resp);
        return {
          ok: true,
          paquetes: resp.paquetes
        };
      })
    );
  }

  getRegistroById(id: number) {
    const url = `${base_url}/paquetes-sc/${id}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de paquete', resp);
        return {
          ok: true,
          paquete: resp.paquete
        };
      })
    );
  }

  postCrearRegistro(paquete: PTLPaquetesSCModel) {
    const url = `${base_url}/paquetes-sc`;
    return this.http.post(url, paquete);
  }

  putModificarRegistro(paquete: PTLPaquetesSCModel) {
    const url = `${base_url}/paquetes-sc/${paquete.suscriptorPaqueteId}`;
    return this.http.put(url, paquete).pipe(
      map((resp: any) => {
        console.log('data de paquete modificacda', resp);
        return {
          ok: true,
          paquete: resp.paquete
        };
      })
    );
  }

  deleteEliminarRegistro(_id: number) {
    const url = `${base_url}/paquetes-sc/${_id}`;
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de paquete eliminado', resp);
        return {
          ok: true,
          paquete: resp.paquete
        };
      })
    );
  }
}
