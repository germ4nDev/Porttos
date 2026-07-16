/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PTLSeguimientoTKModel } from '../_helpers/models/PTLSeguimientoTK.model';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { LocalStorageService } from './local-storage.service';
import { SocketService } from './sockets.service';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PTLSeguimientosTKService {
  user: PTLUsuarioModel = new PTLUsuarioModel();
  private _registros = new BehaviorSubject<PTLSeguimientoTKModel[]>([]);
  private _registrosChange = new Subject<any>();
  _registrosChange$ = this._registrosChange.asObservable();

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private _localStorageService: LocalStorageService
  ) {
    this.socketService.listen('Seguimientos-actualizados').subscribe({
      next: (payload) => {
        console.log('Evento de Socket.IO recibido:', payload.msg);
        this._registrosChange.next(payload);
        this.cargarRegistros().subscribe();
      },
      error: (err) => console.error('Error en la escucha de sockets:', err)
    });
  }
  get seguimiento$(): Observable<PTLSeguimientoTKModel[]> {
    return this._registros.asObservable();
  }
  cargarRegistros() {
    console.log('Consultando y los Seguimientos del servidor...');
    const url = `${base_url}/seguimientos-tk`;
    return this.http.get(url).pipe(
      map((resp: any) => resp.seguimientos as PTLSeguimientoTKModel[]),
      map((regs: PTLSeguimientoTKModel[]) => {
        console.log('respuesta Seguimiento', regs);
        return regs.sort((a: any, b: any) => a.fechaSeguimiento.localeCompare(b.fechaSeguimiento));
      }),
      tap((RegistrosOrdenadas) => {
        this._registros.next(RegistrosOrdenadas);
      })
    );
  }

  getRegistros() {
    const url = `${base_url}/seguimientos-tk`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de seguimiento', resp);
        return {
          ok: true,
          seguimientos: resp.seguimientos
        };
      })
    );
  }

  getRegistrosByTicket(id: string) {
    const url = `${base_url}/seguimientos-tk/ticket/${id}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de seguimiento by ticket', resp);
        return {
          ok: true,
          seguimientos: resp.seguimientos
        };
      })
    );
  }

  getRegistroById(id: string) {
    const url = `${base_url}/seguimientos-tk/${id}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de seguimiento', resp);
        return {
          ok: true,
          seguimiento: resp.seguimiento
        };
      })
    );
  }

  postCrearRegistro(data: PTLSeguimientoTKModel) {
    const url = `${base_url}/seguimientos-tk`;
    return this.http.post(url, data).pipe(
      map((resp: any) => {
        return {
          ok: true,
          seguimiento: resp.seguimiento
        };
      })
    );
  }

  putModificarRegistro(seguimiento: PTLSeguimientoTKModel, codigoSeguimiento: string) {
    const url = `${base_url}/seguimientos-tk/${codigoSeguimiento}`;
    return this.http.put(url, seguimiento).pipe(
      map((resp: any) => {
        console.log('data de seguimiento modificacda', resp);
        return {
          ok: true,
          seguimiento: resp.seguimiento
        };
      })
    );
  }

  deleteEliminarRegistro(_id: string) {
    const url = `${base_url}/seguimientos-tk/${_id}`;
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de seguimiento eliminado', resp);
        return {
          ok: true,
          seguimiento: resp.seguimiento
        };
      })
    );
  }
}
