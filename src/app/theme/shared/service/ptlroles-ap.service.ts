/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment'
import { map, tap } from 'rxjs/operators'
import { PTLRoleAPModel } from '../_helpers/models/PTLRoleAP.model'
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { SocketService } from './sockets.service'
import { LocalStorageService } from './local-storage.service'

const base_url = environment.apiUrl

@Injectable({
  providedIn: 'root'
})
export class PTLRolesAPService {
  user: PTLUsuarioModel = new PTLUsuarioModel()
  private _roles = new BehaviorSubject<PTLRoleAPModel[]>([])
  private _rolesChange = new Subject<any>()
  rolesChange$ = this._rolesChange.asObservable()

  constructor (private http: HttpClient, private _socketService: SocketService, private _localStorageService: LocalStorageService) {
    console.log('******* Servicio de roles iniciado correctamente')
    this._socketService.listen('roles-actualizadas').subscribe({
      next: payload => {
        console.log('Evento de Socket.IO recibido:', payload.msg)
        this._rolesChange.next(payload)
        this.cargarRegistros().subscribe()
      },
      error: err => console.error('Error en la escucha de sockets:', err)
    })
  }

  get roles$ (): Observable<PTLRoleAPModel[]> {
    return this._roles.asObservable()
  }

  getRolesActuales (): PTLRoleAPModel[] {
    return this._roles.getValue()
  }

  cargarRegistros () {
    console.log('Consultando y ordenando roles del servidor...')
    const url = `${base_url}/roles`
    return this.http.get(url).pipe(
      map((resp: any) => resp.roles as PTLRoleAPModel[]),
      map((roles: PTLRoleAPModel[]) => {
        return roles.sort((a: any, b: any) => a.nombreRole.localeCompare(b.nombreRole))
      }),
      tap(RolesOrdenadas => {
        this._roles.next(RolesOrdenadas)
      })
    )
  }

  getRoles () {
    const url = `${base_url}/roles/`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('respuesta servicio', resp)
        return {
          ok: true,
          roles: resp.roles
        }
      })
    )
  }

  getRegistroById (id: string) {
    const url = `${base_url}/roles/${id}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de roles', resp)
        return {
          ok: true,
          role: resp.role
        }
      })
    )
  }

  getRegistroByCodeApp (id: string) {
    const url = `${base_url}/roles/app/${id}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de roles app', resp)
        return {
          ok: true,
          roles: resp.roles
        }
      })
    )
  }

  postCrearRegistro (data: PTLRoleAPModel) {
    const url = `${base_url}/roles`
    console.log('servicio de roles', data)
    return this.http.post(url, data).pipe(
      map((resp: any) => {
        return {
          ok: true,
          role: resp.role
        }
      })
    )
  }

  putModificarRegistro (role: PTLRoleAPModel) {
    const url = `${base_url}/roles/${role.roleId}`
    return this.http.put(url, role).pipe(
      map((resp: any) => {
        console.log('data de role modificacda', resp)
        return {
          ok: true,
          role: resp.role
        }
      })
    )
  }

  deleteEliminarRegistro (_id: string) {
    const url = `${base_url}/roles/${_id}`
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de role eliminado', resp)
        return {
          ok: true,
          role: resp.role
        }
      })
    )
  }
}
