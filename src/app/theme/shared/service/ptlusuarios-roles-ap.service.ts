/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment'
import { map, tap } from 'rxjs/operators'
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model'
import { LocalStorageService } from './local-storage.service'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { SocketService } from './sockets.service'
import { PTLUsuarioRoleAPModel } from '../_helpers/models/PTLUsuarioRole.model'
const base_url = environment.apiUrl

@Injectable({
  providedIn: 'root'
})
export class PtlusuariosRolesApService {
  user: PTLUsuarioModel = new PTLUsuarioModel()
  private _usuariosRoles = new BehaviorSubject<PTLUsuarioRoleAPModel[]>([])
  private _usuariosRolesChange = new Subject<any>()
  _usuariosRolesChange$ = this._usuariosRolesChange.asObservable()

  constructor (private http: HttpClient, private _socketService: SocketService, private _localStorageService: LocalStorageService) {
    console.log('******* Servicio de usuariosRoles iniciado correctamente')
    this._socketService.listen('usuarios-roles-actualizadas').subscribe({
      next: payload => {
        console.log('Evento de Socket.IO recibido:', payload.msg)
        this._usuariosRolesChange.next(payload)
        this.cargarRegistros().subscribe()
      },
      error: err => console.error('Error en la escucha de sockets:', err)
    })
  }

  get _usuariosRoles$ (): Observable<PTLUsuarioRoleAPModel[]> {
    return this._usuariosRoles.asObservable()
  }

  getUsuairosRolesActuales (): PTLUsuarioRoleAPModel[] {
    return this._usuariosRoles.getValue()
  }

  cargarRegistros () {
    console.log('Consultando y ordenando usuariosRoles del servidor...')
    const url = `${base_url}/usuarios-roles`
    return this.http.get(url).pipe(
      map((resp: any) => resp.usuariosRoles as PTLUsuarioRoleAPModel[]),
      tap(RolesOrdenadas => {
        console.log(`usuariosRoles cargados: ${RolesOrdenadas.length}`)
        this._usuariosRoles.next(RolesOrdenadas)
      })
    )
  }

  getRegistros () {
    const url = `${base_url}/usuarios-roles`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de usuariosRoles', resp)
        return {
          ok: true,
          usuariosRoles: resp.usuariosRoles
        }
      })
    )
  }

  getRegistroById (id: number) {
    const url = `${base_url}/usuarios-roles/${id}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de usuarios-roles', resp)
        return {
          ok: true,
          usuarioRole: resp.usuarioRole
        }
      })
    )
  }

  getRegistroByCodigoRol (codigoRole: string) {
    const url = `${base_url}/usuarios-roles/role/${codigoRole}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('Ahora sí llega la data correcta:', resp)
        return {
          ok: true,
          usuarioRole: resp.usuarioRole
        }
      })
    )
  }

  getRegistroByCodigoUsuario (codigoUsuarioSC: string) {
    const url = `${base_url}/usuarios-roles/usuario/${codigoUsuarioSC}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('Roles del usuario cargados:', resp)
        return {
          ok: true,
          usuarioRole: resp.usuarioRole
        }
      })
    )
  }

  postUsuarioRole (data: PTLUsuarioRoleAPModel) {
    console.log('********** crear el usuarioRole', data)

    const url = `${base_url}/usuarios-roles`
    return this.http.post(url, data).pipe(
      map((resp: any) => {
        console.log('respuesta servicio usuarioRoles', resp)
        return {
          ok: true,
          usuarioRole: resp.usuarioRole
        }
      })
    )
  }

  putModificarRegistro (role: PTLUsuarioRoleAPModel) {
    console.log('data usuRole', role)
    const url = `${base_url}/usuarios-roles/${role.usuarioRoleId}`
    return this.http.put(url, role).pipe(
      map((resp: any) => {
        console.log('data de role modificacda', resp)
        return {
          ok: true,
          usuarioRole: resp.usuarioRole
        }
      })
    )
  }

  deleteEliminarRegistro (_id: number) {
    console.log('eliminar el registro id', _id)
    const url = `${base_url}/usuarios-roles/${_id}`
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de role eliminado', resp)
        return {
          ok: true,
          usuarioRole: resp.usuarioRole
        }
      })
    )
  }

  deleteTodosUsuarioRole (codigoRole: string) {
    const url = `${base_url}/usuarios-roles/clean/${codigoRole}`
    return this.http.delete(url).pipe(
      map((resp: any) => {
        return resp
      })
    )
  }

  deleteRolesPorUsuario (codigoUsuarioSC: string) {
    const url = `${base_url}/usuarios-roles/clean-user/${codigoUsuarioSC}`
    return this.http.delete(url).pipe(
      map((resp: any) => {
        return resp
      })
    )
  }
}
