import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment'
import { map } from 'rxjs';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class GestorScripsService {
  constructor(
    private http: HttpClient
  ) {}

  postEjecutarScript(data: any) {
    console.log('archivo', data.archivo);
    console.log('database', data.database);
    const url = `${base_url}/admin-scripts`;
    return this.http.post(url, data).pipe(
      map((resp: any) => {
        console.log('respuesta creacion de script', resp);
        return {
          ok: true,
          msg: resp.msg
        };
      })
    );
  }

  postEjecutarScriptMultiDBs(data: any) {
    console.log('archivo', data.archivo);
    console.log('databases', data.databases);
    const url = `${base_url}/admin-scripts/multi`;
    return this.http.post(url, data).pipe(
      map((resp: any) => {
        console.log('respuesta creacion de script', resp);
        return {
          ok: true,
          msg: resp.msg,
          resultados: resp.resultados
        };
      })
    );
  }
}
