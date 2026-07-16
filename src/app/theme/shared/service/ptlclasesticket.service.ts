/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { environment } from 'src/environments/environment'
import { map, tap } from 'rxjs/operators'
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model'
import { PTLClaseTicketModel } from '../_helpers/models/PTLClaseTicket.model'
import { LocalStorageService } from './local-storage.service'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { SocketService } from './sockets.service'
import { ClasesTicketComponent } from '../../../plataforma/tickets/clases-ticket/clases-ticket.component'

const base_url = environment.apiUrl

@Injectable({
    providedIn: 'root'
})
export class PtlclasesticketService {
    user: PTLUsuarioModel = new PTLUsuarioModel()
    private _registros = new BehaviorSubject<PTLClaseTicketModel[]>([])
    private _registrosChange = new Subject<any>()
    _registrosChange$ = this._registrosChange.asObservable()

    constructor(private http: HttpClient, private socketService: SocketService, private _localStorageService: LocalStorageService) {
        this.socketService.listen('clasesTickets-actualizadas').subscribe({
            next: payload => {
                console.log('Evento de Socket.IO recibido:', payload.msg)
                this._registrosChange.next(payload)
                this.cargarRegistros().subscribe()
            },
            error: err => console.error('Error en la escucha de sockets:', err)
        })
    }
    get clasesTicket$(): Observable<PTLClaseTicketModel[]> {
        return this._registros.asObservable()
    }

    getclasesTicketActuales(): PTLClaseTicketModel[] {
        return this._registros.getValue()
    }

    cargarRegistros() {
        console.log('Consultando y las clases del servidor...')
        const url = `${base_url}/clases-ticket`
        return this.http.get(url).pipe(
            map((resp: any) => resp.clasesTicket as PTLClaseTicketModel[]),
            map((regs: PTLClaseTicketModel[]) => {
                console.log('respuesta clasesTicket', regs)
                return regs.sort((a: any, b: any) => a.claseTicket.localeCompare(b.claseTicket))
            }),
            tap(RegistrosOrdenadas => {
                this._registros.next(RegistrosOrdenadas)
            })
        )
    }

    getRegistros() {
        const url = `${base_url}/clases-ticket`
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('servicio de clases-ticket', resp)
                return {
                    ok: true,
                    clasesTicket: resp.clasesTicket
                }
            })
        )
    }

    getRegistroById(id: string) {
        const url = `${base_url}/clases-ticket/${id}`
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('data de claseTicket', resp)
                return {
                    ok: true,
                    claseTicket: resp.claseTicket
                }
            })
        )
    }

    postCrearRegistro(claseTicket: PTLClaseTicketModel) {
        const url = `${base_url}/clases-ticket`
        return this.http.post(url, claseTicket)
    }

    putModificarRegistro(claseTicket: PTLClaseTicketModel, codigoClase: string) {
        const url = `${base_url}/clases-ticket/${codigoClase}`
        return this.http.put(url, claseTicket).pipe(
            map((resp: any) => {
                console.log('data de claseTicket modificacda', resp)
                return {
                    ok: true,
                    claseTicket: resp.claseTicket
                }
            })
        )
    }

    deleteEliminarRegistro(codigoClase: string) {
        const url = `${base_url}/clases-ticket/${codigoClase}`
        return this.http.delete(url).pipe(
            map((resp: any) => {
                console.log('data de claseTicket eliminado', resp)
                return {
                    ok: true,
                    claseTicket: resp.claseTicket
                }
            })
        )
    }
}
