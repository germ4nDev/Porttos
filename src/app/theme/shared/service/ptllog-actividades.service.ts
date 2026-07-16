/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
// import { PTLLogActividadAPModel } from './../_helpers/models/PTLlogActividadAP.model';
import { NavSettings } from '../_helpers/models/navSettings.model';
import { LocalStorageService } from './local-storage.service';
import { PTLTiposLogsService } from './ptltipos-logs.service';
import { map } from 'rxjs';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PtllogActividadesService {
  user: PTLUsuarioModel = new PTLUsuarioModel();
  navSettings: NavSettings = new NavSettings();
  tipos: any[] = [];

  constructor(
    private http: HttpClient,
    private _localStorageSercice: LocalStorageService,
    private _tiposLogsService: PTLTiposLogsService
  ) {}

  get getLogBody() {
    let codigoAplicacion: string = '';
    let codigoSuite: string = '';
    let codigoModulo: string = '';
    let codigoSuscriptor: string = '';
    const navs = this._localStorageSercice.getNavSettingsLocalStorage();
    if (navs) {
      codigoAplicacion = navs.aplicacion?.codigoAplicacion ?? '';
      codigoSuite = navs.suite?.codigoSuite ?? '';
      codigoModulo = navs.modulo?.codigoModulo ?? '';
      codigoSuscriptor = navs.modulo?.codigoModulo ?? '';
    }
    const dataLog = {
      codigoAplicacion: codigoAplicacion,
      codigoSuite: codigoSuite,
      codigoModulo: codigoModulo,
      codigoSuscriptor: codigoSuscriptor,
      codigoTipoLog: '',
      codigoRespuesta: '',
      descripcionLog: '',
      codigoUsuarioCreacion: '',
      fechaLog: new Date().toISOString(),
      fechaCreacion: new Date().toISOString()
    };
    console.log('body del log antes', dataLog);

    return dataLog;
  }

  getRegistros() {
    const url = `${base_url}/logs-actividades`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de log_actividads', resp);
        return {
          ok: true,
          log_actividades: resp.log_actividades
        };
      })
    );
  }

  getRegistroById(id: number) {
    const url = `${base_url}/logs-actividades/${id}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de log_actividad', resp);
        return {
          ok: true,
          log_actividad: resp.log_actividad
        };
      })
    );
  }

  postCrearRegistro(data: any) {
    // console.log('data inicio', data);
    // console.log('tipos logs', this.TiposLog);
    // const body = this.getLogBody;
    // console.log('body del log', body);
    let codigoAplicacion: string = '';
    let codigoSuite: string = '';
    let codigoModulo: string = '';
    let codigoSuscriptor: string = '';
    const navs = this._localStorageSercice.getNavSettingsLocalStorage();
    const usu = this._localStorageSercice.getUsuarioLocalStorage();
    console.log('navsettings', navs);
    if (navs) {
      codigoAplicacion = navs.aplicacion?.codigoAplicacion ?? '';
      codigoSuite = navs.suite?.codigoSuite ?? '';
      codigoModulo = navs.modulo?.codigoModulo ?? '';
      codigoSuscriptor = navs.modulo?.codigoModulo ?? '';
    }
    const dataLog = {
      codigoAplicacion: codigoAplicacion,
      codigoSuite: codigoSuite,
      codigoModulo: codigoModulo,
      codigoSuscriptor: codigoSuscriptor,
      codigoTipoLog: '',
      codigoRespuesta: data.codigoRespuesta,
      descripcionLog: data.descripcionLog,
      codigoUsuarioCreacion: usu.codigoUsuario,
      fechaLog: new Date().toISOString(),
      fechaCreacion: new Date().toISOString()
    };

    // body.codigoTipoLog = data.codigoTipoLog || '';
    // dataLog.codigoRespuesta = data.codigoRespuesta || '';
    // dataLog.codigoUsuarioCreacion = data.codigoUsuario || '';
    // dataLog.descripcionLog = data.descripcionLog || '';
    console.log('log actividad', dataLog);
    // const logactividad = dataLog as PTLLogActividadAPModel;
    const url = `${base_url}/logs-actividades`;
    // return this.http.post(url, log_actividad);
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de log_actividads', resp);
        return {
          ok: true,
          log_actividades: resp.log_actividades
        };
      })
    );
    // return this.http.post(url, dataLog).pipe(
    //   map((resp: any) => {
    //     console.log('respuesta creacion de log', resp);
    //     return {
    //       ok: true,
    //       logActividad: resp.log
    //     };
    //   })
    // );
  }
}
