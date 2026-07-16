/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs'
import { environment } from 'src/environments/environment'
import { PTLSuscriptorModel } from '../_helpers/models/PTLSuscriptor.model'
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model'
import { SocketService } from './sockets.service'
import { LocalStorageService } from './local-storage.service'

const base_url = environment.apiUrl
@Injectable({
  providedIn: 'root'
})
export class PTLSuscriptoresService {
  socket: any
  user: PTLUsuarioModel = new PTLUsuarioModel()
  _suscriptores = new BehaviorSubject<PTLSuscriptorModel[]>([])
  _suscriptoresChange = new Subject<any>()
  suscriptoresChange$ = this._suscriptoresChange.asObservable()

  constructor (private http: HttpClient, private socketService: SocketService, private _localStorageService: LocalStorageService) {
    // TODO hacer la funcion que valida la vigencia de la liciencia del suscriptor
    this.socketService.listen('suscriptores-actualizados').subscribe({
      next: payload => {
        console.log('Evento de Socket.IO recibido:', payload.msg)
        this._suscriptoresChange.next(payload)
        this.getRegistros().subscribe()
      },
      error: err => console.error('Error en la escucha de sockets:', err)
    })
  }

  get suscriptores$ (): Observable<PTLSuscriptorModel[]> {
    return this._suscriptores.asObservable()
  }

  getSuscriptoresActuales (): PTLSuscriptorModel[] {
    return this._suscriptores.getValue()
  }

  getSuscriptores () {
    const url = `${base_url}/suscriptores`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('respuesta servicio suscriptores', resp)
        return {
          ok: true,
          suscriptores: resp.suscriptores
        }
      })
    )
  }

  getRegistros () {
    console.log('Consultando y ordenando registros del servidor...')
    const url = `${base_url}/suscriptores`
    return this.http.get(url).pipe(
      map((resp: any) => resp.suscriptores as PTLSuscriptorModel[]),
      map((suscriptores: PTLSuscriptorModel[]) => {
        return suscriptores.sort((a: any, b: any) => a.nombreSuscriptor.localeCompare(b.nombreSuscriptor))
      }),
      tap(suscriptoresOrdenados => {
        this._suscriptores.next(suscriptoresOrdenados)
      })
    )
  }

  getSuscriptorById (id: PTLSuscriptorModel) {
    const url = `${base_url}/suscriptores/${id}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de suscriptores', resp)
        return {
          ok: true,
          suscriptor: resp.suscriptor
        }
      })
    )
  }

  crearSuscriptor (data: PTLSuscriptorModel) {
    console.log('data servicio', data)
    const url = `${base_url}/suscriptores`
    return this.http.post(url, data).pipe(
      map((resp: any) => {
        return {
          ok: true,
          suscriptor: resp.suscriptor
        }
      })
    )
  }

  crearCarpetaSuscriptor (data: string) {
    console.log('data servicio', data)
    const url = `${base_url}/suscriptores/folder/${data}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        return {
          ok: true,
          mensaje: resp.msg,
          folder: resp.folder
        }
      })
    )
  }

  actualizarSuscriptor (suscriptor: PTLSuscriptorModel) {
    const url = `${base_url}/suscriptores/${suscriptor.suscriptorId}`
    return this.http.put(url, suscriptor).pipe(
      map((resp: any) => {
        console.log('data de suscriptor modificada', resp)
        return {
          ok: true,
          suscriptor: resp.suscriptor
        }
      })
    )
  }

  eliminarSuscripctor (_id: number) {
    const url = `${base_url}/suscriptores/${_id}`
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de suscriptor modificacda', resp)
        //TODO al eliminar el suscriptor se debe eliminar toda su descendencia, usuariosSC, empresas, paquetes...
        return {
          ok: true,
          suscriptor: resp.suscriptor
        }
      })
    )
  }
}
