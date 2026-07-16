/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map, tap } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import { PTLUsuarioSCModel } from '../_helpers/models/PTLUsuarioSC.model'
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model'
import { LocalStorageService } from './local-storage.service'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { SocketService } from './sockets.service'

const base_url = environment.apiUrl

@Injectable({
    providedIn: 'root'
})
export class PtlusuariosScService {
    user: PTLUsuarioModel = new PTLUsuarioModel()
    private _usuariosSC = new BehaviorSubject<PTLUsuarioSCModel[]>([])
    private _usuariosSCChange = new Subject<any>()
    usuariosSCChange$ = this._usuariosSCChange.asObservable()

    constructor(private http: HttpClient, private _socketService: SocketService, private _localStorageService: LocalStorageService) {
        console.log('******* Servicio de usuariosSC iniciado correctamente')
        this._socketService.listen('usuarios-roles-actualizadas').subscribe({
            next: payload => {
                console.log('Evento de Socket.IO recibido:', payload.msg)
                this._usuariosSCChange.next(payload)
                this.cargarRegistros().subscribe()
            },
            error: err => console.error('Error en la escucha de sockets:', err)
        })
    }

    get usuariosSC$(): Observable<PTLUsuarioSCModel[]> {
        return this._usuariosSC.asObservable()
    }

    getUsuariosSCActuales(): PTLUsuarioSCModel[] {
        return this._usuariosSC.getValue()
    }

    cargarRegistros() {
        console.log('Consultando y ordenando usuariosSC del servidor...')
        const url = `${base_url}/usuarios-sc`
        return this.http.get(url).pipe(
            map((resp: any) => resp.usuariosSC as PTLUsuarioSCModel[]),
            tap(RolesOrdenadas => {
                console.log(`Roles cargados: ${RolesOrdenadas.length}`)
                this._usuariosSC.next(RolesOrdenadas)
            })
        )
    }

    getUsuarioById(id: string) {
        const url = `${base_url}/usuarios-sc/${id}`
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('data del usuario', resp)
                return {
                    ok: true,
                    usuarioSC: resp.usuarioSC
                }
            })
        )
    }

    getUsuariosByCode(code: string) {
        const url = `${base_url}/usuarios-sc/code/${code}`
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('data del usuario', resp)
                return {
                    ok: true,
                    usuariosSC: resp.usuariosSC
                }
            })
        )
    }

    crearUsuario(usuario: PTLUsuarioSCModel) {
        const url = `${base_url}/usuarios-sc`
        return this.http.post(url, usuario)
    }

    postCrearUsuario(data: PTLUsuarioSCModel) {
        const url = `${base_url}/usuarios-sc`;
        console.log('servicio de usuarios-sc', data);
        return this.http.post(url, data).pipe(
            map((resp: any) => {
                return {
                    ok: true,
                    usuarioSC: resp.usuarioSC
                };
            })
        );
    }

    actualizarUsuario(data: PTLUsuarioSCModel) {
        const url = `${base_url}/usuarios-sc/${data.codigoUsuarioSC}`
        return this.http.put(url, data).pipe(
            map((resp: any) => {
                console.log('data de usuario modificacda', resp)
                return {
                    ok: true,
                    usuarioSC: resp.usuarioSC
                }
            })
        )
    }

    actualizarUsuarioDatos(usuario: PTLUsuarioSCModel) {
        const url = `${base_url}/usuarios-sc/datos/${usuario.codigoUsuarioSC}`
        return this.http.put(url, usuario).pipe(
            map((resp: any) => {
                console.log('data de usuario modificacda', resp)
                return {
                    ok: true,
                    usuarioSC: resp.usuarioSC
                }
            })
        )
    }

    eliminarUsuairo(_id: string) {
        const url = `${base_url}/usuarios-sc/${_id}`
        return this.http.delete(url).pipe(
            map((resp: any) => {
                console.log('data de usuario eliminado', resp)
                return {
                    ok: true,
                    usuarioSC: resp.usuarioSC
                }
            })
        )
    }
}
