/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs'
import { environment } from 'src/environments/environment'
import { PTLItemPaquete } from '../_helpers/models/PTLItemPaquete.model'
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model'
import { LocalStorageService } from './local-storage.service'
import { SocketService } from './sockets.service'

const base_url = environment.apiUrl

@Injectable({
  providedIn: 'root'
})
export class PtlItemsPaqueteService {
  user: PTLUsuarioModel = new PTLUsuarioModel()
  private _itemsPaquetes = new BehaviorSubject<PTLItemPaquete[]>([])
  private _itemsPaquetesChange = new Subject<any>()
  itemsPaquetesChange$ = this._itemsPaquetesChange.asObservable()

  constructor (private http: HttpClient, private socketService: SocketService, private _localStorageService: LocalStorageService) {
    this.socketService.listen('items-paquete-actualizadas').subscribe({
      next: payload => {
        console.log('Evento de Socket.IO recibido:', payload.msg)
        this._itemsPaquetesChange.next(payload)
        this.cargarRegistros().subscribe()
      },
      error: err => console.error('Error en la escucha de sockets:', err)
    })
  }

  getRegistros () {
    const url = `${base_url}/items-paquete`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de itemsPaquete', resp)
        return {
          ok: true,
          itemsPaquete: resp.itemsPaquete
        }
      })
    )
  }

  get itemsPaquetes$ (): Observable<PTLItemPaquete[]> {
    return this._itemsPaquetes.asObservable()
  }

  cargarRegistros () {
    console.log('Consultando y ordenando items paquetes del servidor...')
    const url = `${base_url}/items-paquete`
    return this.http.get(url).pipe(
      map((resp: any) => resp.itemsPaquete as PTLItemPaquete[]),
      map((paquetes: PTLItemPaquete[]) => {
        return paquetes.sort((a: any, b: any) => a.nombreItem.localeCompare(b.nombreItem))
      }),
      tap(paquetesOrdenadas => {
        console.log('paquetes servicio', paquetesOrdenadas)
        this._itemsPaquetes.next(paquetesOrdenadas)
      })
    )
  }

  getRegistroById (id: number) {
    const url = `${base_url}/items-paquete/${id}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de itemPaquete', resp)
        return {
          ok: true,
          itemPaquete: resp.itemPaquete
        }
      })
    )
  }

  getRegistroByCodigoPaquete (codigo: string) {
    const url = `${base_url}/items-paquete/code${codigo}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de los itemPaquete', resp)
        return {
          ok: true,
          itemsPaquete: resp.itemsPaquete
        }
      })
    )
  }

  postCrearRegistro (itemPaquete: PTLItemPaquete) {
    const url = `${base_url}/items-paquete`
    return this.http.post(url, itemPaquete)
  }

  putModificarRegistro (itemPaquete: PTLItemPaquete) {
    const url = `${base_url}/items-paquete/${itemPaquete.itemId}`
    return this.http.put(url, itemPaquete).pipe(
      map((resp: any) => {
        console.log('data de itemPaquete modificacdo', resp)
        return {
          ok: true,
          itemPaquete: resp.itemPaquete
        }
      })
    )
  }

  deleteEliminarRegistro (_id: string) {
    const url = `${base_url}/items-paquete/${_id}`
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de itemPaquete eliminado', resp)
        return {
          ok: true,
          itemPaquete: resp.itemPaquete
        }
      })
    )
  }
}
