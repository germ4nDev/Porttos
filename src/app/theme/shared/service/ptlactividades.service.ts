/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment'
import { map, tap } from 'rxjs/operators'
import { PTLActividadModel } from '../_helpers/models/PTLActividades.model'
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { SocketService } from './sockets.service'
import { LocalStorageService } from './local-storage.service'
const base_url = environment.apiUrl

@Injectable({
  providedIn: 'root'
})
export class PtlActividadesService {
  user: PTLUsuarioModel = new PTLUsuarioModel()
  private _actividades = new BehaviorSubject<PTLActividadModel[]>([])
  private _actividadesChange = new Subject<any>()
  actividadesChange$ = this._actividadesChange.asObservable()

  constructor (private http: HttpClient, private _socketService: SocketService, private _localStorageService: LocalStorageService) {
    console.log('******* Servicio de actividades iniciado correctamente')
    this._socketService.listen('actividades-actualizadas').subscribe({
      next: payload => {
        console.log('Evento de Socket.IO recibido:', payload.msg)
        this._actividadesChange.next(payload)
        this.cargarRegistros().subscribe()
      },
      error: err => console.error('Error en la escucha de sockets:', err)
    })
  }

  get actividades$ (): Observable<PTLActividadModel[]> {
    return this._actividades.asObservable()
  }

  getActividadesActuales (): PTLActividadModel[] {
    return this._actividades.getValue()
  }

  cargarRegistros () {
    console.log('Consultando y ordenando actividades del servidor...')
    const url = `${base_url}/actividades`
    return this.http.get(url).pipe(
      map((resp: any) => resp.actividades as PTLActividadModel[]),
      map((actividades: PTLActividadModel[]) => {
        return actividades.sort((a: any, b: any) => a.actividad.localeCompare(b.actividad))
      }),
      tap(RolesOrdenadas => {
        this._actividades.next(RolesOrdenadas)
      })
    )
  }

  getRegistroById (id: string) {
    const url = `${base_url}/actividades/${id}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de actividad', resp)
        return {
          ok: true,
          actividad: resp.actividad
        }
      })
    )
  }

  getRegistroByCodeApp (id: string) {
    const url = `${base_url}/actividades/app/${id}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de actividades app', resp)
        return {
          ok: true,
          actividades: resp.actividades
        }
      })
    )
  }

  getRegistroByCodeSuite (id: string) {
    const url = `${base_url}/actividades/suite/${id}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de actividades suite', resp)
        return {
          ok: true,
          actividades: resp.actividades
        }
      })
    )
  }

  getRegistroByCodeModulo (id: string) {
    const url = `${base_url}/actividades/modulo/${id}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de actividades modulo', resp)
        return {
          ok: true,
          actividades: resp.actividades
        }
      })
    )
  }

  postCrearRegistro (data: PTLActividadModel) {
    const url = `${base_url}/actividades`
    console.log('servicio actividades', data)
    return this.http.post(url, data).pipe(
      map((resp: any) => {
        return {
          ok: true,
          actividad: resp.actividad
        }
      })
    )
  }

  putModificarRegistro (actividad: PTLActividadModel) {
    const url = `${base_url}/actividades/${actividad.codigoActividad}`
    return this.http.put(url, actividad).pipe(
      map((resp: any) => {
        console.log('data de actividad modificacda', resp)
        return {
          ok: true,
          actividad: resp.actividad
        }
      })
    )
  }

  deleteEliminarRegistro (_id: string) {
    const url = `${base_url}/actividades/${_id}`
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de actividad eliminado', resp)
        return {
          ok: true,
          actividad: resp.actividad
        }
      })
    )
  }
}
