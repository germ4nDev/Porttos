/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { PTLTicketAPModel } from '../_helpers/models/PTLTicketAP.model';
import { PTLSeguimientosTKService } from './ptlseguimientos-tk.service';
import { LocalStorageService } from './local-storage.service';
import { SocketService } from './sockets.service';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PTLTicketsService {
  user: PTLUsuarioModel = new PTLUsuarioModel();
  private _registros = new BehaviorSubject<PTLTicketAPModel[]>([]);
  private _registrosChange = new Subject<any>();
  _registrosChange$ = this._registrosChange.asObservable();

  constructor(
    private http: HttpClient,
    private _seguimientosService: PTLSeguimientosTKService,
    private socketService: SocketService,
    private _localStorageService: LocalStorageService
  ) {
    this.socketService.listen('tickets-actualizados').subscribe({
      next: (payload) => {
        console.log('Evento de Socket.IO recibido:', payload.msg);
        this._registrosChange.next(payload);
        this.cargarRegistros().subscribe();
      },
      error: (err) => console.error('Error en la escucha de sockets:', err)
    });
  }
  get ticket$(): Observable<PTLTicketAPModel[]> {
    return this._registros.asObservable();
  }
  cargarRegistros() {
    console.log('Consultando y los tickets del servidor...');
    const url = `${base_url}/tickets-ap`;
    return this.http.get(url).pipe(
      map((resp: any) => resp.tickets as PTLTicketAPModel[]),
      map((regs: PTLTicketAPModel[]) => {
        console.log('respuesta Ticket', regs);
        return regs.sort((a: any, b: any) => a.nombreTicket.localeCompare(b.nombreTicket));
      }),
      tap((RegistrosOrdenadas) => {
        this._registros.next(RegistrosOrdenadas);
      })
    );
  }

  getRegistros() {
    const url = `${base_url}/tickets-ap`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de ticket', resp.tickets);
        return {
          ok: true,
          tickets: resp.tickets
        };
      })
    );
  }

  getRegistroById(id: string) {
    const url = `${base_url}/tickets-ap/${id}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de ticket', resp);
        return {
          ok: true,
          ticket: resp.ticketAP
        };
      })
    );
  }

  postCrearRegistro(data: any) {
    console.log('servicio tickets', data);
    const url = `${base_url}/tickets-ap`;
    return this.http.post(url, data).pipe(
      map((resp: any) => {
        return {
          ok: true,
          ticket: resp.ticketAP
        };
      })
    );
  }

  putModificarRegistro(ticket: PTLTicketAPModel) {
    const url = `${base_url}/tickets-ap/${ticket.codigoTicket}`;
    return this.http.put(url, ticket).pipe(
      map((resp: any) => {
        console.log('data de ticket modificacda', resp);
        return {
          ok: true,
          ticket: resp.ticketAP
        };
      })
    );
  }

  deleteEliminarRegistro(_id: string) {
    const segs = this._seguimientosService.getRegistros();
    console.log('codigo ticket', _id);
    console.log('seguimeitnos ticket', segs);
    const url = `${base_url}/tickets-ap/${_id}`;
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de ticket eliminado', resp);
        return {
          ok: true,
          ticket: resp.ticket
        };
      })
    );
  }
}
