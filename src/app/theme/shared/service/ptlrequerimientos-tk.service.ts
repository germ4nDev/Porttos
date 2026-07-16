/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { PTLRequerimientoTKModel } from '../_helpers/models/PTLRequerimientoTK.model';
import { LocalStorageService } from './local-storage.service';
import { SocketService } from './sockets.service';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PTLRequerimientosTkService {
  user: PTLUsuarioModel = new PTLUsuarioModel();
  private _registros = new BehaviorSubject<PTLRequerimientoTKModel[]>([]);
  private _registrosChange = new Subject<any>();
  _registrosChange$ = this._registrosChange.asObservable();

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private _localStorageService: LocalStorageService
  ) {
    this.socketService.listen('Requerimiento-actualizadas').subscribe({
      next: (payload) => {
        console.log('Evento de Socket.IO recibido:', payload.msg);
        this._registrosChange.next(payload);
        this.cargarRegistros().subscribe();
      },
      error: (err) => console.error('Error en la escucha de sockets:', err)
    });
  }
  get requerimiento$(): Observable<PTLRequerimientoTKModel[]> {
    return this._registros.asObservable();
  }

  cargarRegistros() {
    console.log('Consultando y las requerimientos del servidor...');
    const url = `${base_url}/requerimientos-tk`;
    return this.http.get(url).pipe(
      map((resp: any) => resp.requerimientos as PTLRequerimientoTKModel[]),
      map((regs: PTLRequerimientoTKModel[]) => {
        console.log('respuesta requerimientos', regs);
        return regs.sort((a: any, b: any) => a.nombreRequerimiento.localeCompare(b.nombreRequerimiento));
      }),
      tap((RegistrosOrdenadas) => {
        this._registros.next(RegistrosOrdenadas);
      })
    );
  }

  getRegistros() {
    const url = `${base_url}/requerimientos-tk`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de requerimiento', resp);
        return {
          ok: true,
          requerimientos: resp.requerimientos
        };
      })
    );
  }

  getRegistroById(id: string) {
    const url = `${base_url}/requerimientos-tk/${id}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de requerimientos', resp);
        return {
          ok: true,
          requerimiento: resp.requerimiento
        };
      })
    );
  }

  postCrearRegistro(requerimiento: PTLRequerimientoTKModel) {
    const url = `${base_url}/requerimientos-tk`;
    return this.http.post(url, requerimiento);
  }

  putModificarRegistro(requerimiento: PTLRequerimientoTKModel, codigoRequerimiento: string) {
    const url = `${base_url}/requerimientos-tk/${codigoRequerimiento}`;
    return this.http.put(url, requerimiento).pipe(
      map((resp: any) => {
        console.log('data de requerimiento modificacda', resp);
        return {
          ok: true,
          requerimiento: resp.requerimiento
        };
      })
    );
  }

  putModificarEstadoRequerimiento(requerimientoId: string, nuevoEstado: string) {
    const url = `${base_url}/requerimientos-tk/${requerimientoId}`;
    return this.http.patch(url, { estadoRequerimiento: nuevoEstado }).pipe(
      map((resp: any) => {
        console.log('Estado de requerimiento actualizado', resp);
        return { ok: true };
      })
    );
  }

  deleteEliminarRegistro(_id: number) {
    const url = `${base_url}/requerimientos-tk/${_id}`;
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de requerimiento eliminado', resp);
        return {
          ok: true,
          requerimiento: resp.requerimiento
        };
      })
    );
  }
}
