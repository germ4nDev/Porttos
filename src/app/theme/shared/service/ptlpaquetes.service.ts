/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs'
import { environment } from 'src/environments/environment'
import { PTLPaqueteModel } from '../_helpers/models/PTLPaquete.model'
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model'
import { LocalStorageService } from './local-storage.service'
import { PTLModuloAP } from '../_helpers/models/PTLModuloAP.model'
import { SocketService } from './sockets.service'

const base_url = environment.apiUrl

@Injectable({
  providedIn: 'root'
})
export class PTLPaquetesService {
  user: PTLUsuarioModel = new PTLUsuarioModel()
  private _paquetes = new BehaviorSubject<PTLPaqueteModel[]>([])
  private _paquetesChange = new Subject<any>()
  paquetesChange$ = this._paquetesChange.asObservable()

  constructor (private http: HttpClient, private socketService: SocketService, private _localStorageService: LocalStorageService) {
    this.socketService.listen('aplicaciones-actualizadas').subscribe({
      next: payload => {
        console.log('Evento de Socket.IO recibido:', payload.msg)
        this._paquetesChange.next(payload)
        this.cargarRegistros().subscribe()
      },
      error: err => console.error('Error en la escucha de sockets:', err)
    })
  }

  getRegistros () {
    const url = `${base_url}/paquetes`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de paquetes', resp)
        return {
          ok: true,
          paquetes: resp.paquetes
        }
      })
    )
  }

  get paquetes$ (): Observable<PTLPaqueteModel[]> {
    return this._paquetes.asObservable()
  }

  cargarRegistros () {
    console.log('Consultando y ordenando paquetes del servidor...')
    const url = `${base_url}/paquetes`
    return this.http.get(url).pipe(
      map((resp: any) => resp.paquetes as PTLModuloAP[]),
      map((paquetes: PTLModuloAP[]) => {
        return paquetes.sort((a: any, b: any) => a.nombreModulo.localeCompare(b.nombreModulo))
      }),
      tap(paquetesOrdenadas => {
        console.log('paquetes servicio', paquetesOrdenadas)
        this._paquetes.next(paquetesOrdenadas)
      })
    )
  }

  getRegistroById (id: string) {
    const url = `${base_url}/paquetes/${id}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de paquete', resp)
        return {
          ok: true,
          paquete: resp.paquete
        }
      })
    )
  }

  postCrearRegistro (paquete: PTLPaqueteModel) {
    const url = `${base_url}/paquetes`
    console.log('data del paquete', paquete)
    // return this.http.post(url, modulo);
    return this.http.post(url, paquete).pipe(
      map((resp: any) => {
        console.log('respuesta', resp)
        return {
          ok: true,
          paquete: resp.paquete
        }
      })
    )
  }

  putModificarRegistro (paquete: PTLPaqueteModel) {
    const url = `${base_url}/paquetes/${paquete.paqueteId}`
    return this.http.put(url, paquete).pipe(
      map((resp: any) => {
        console.log('data de paquete modificacdo', resp)
        return {
          ok: true,
          paquete: resp.paquete
        }
      })
    )
  }

  deleteEliminarRegistro (_id: string) {
    const url = `${base_url}/paquetes/${_id}`
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de paquete eliminado', resp)
        return {
          ok: true,
          paquete: resp.paquete
        }
      })
    )
  }
}
