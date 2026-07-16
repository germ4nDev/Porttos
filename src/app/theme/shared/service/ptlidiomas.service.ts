/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs'
import { environment } from 'src/environments/environment'
import { PTLIdioma } from '../_helpers/models/PTLIdioma.model'
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model'
import { LocalStorageService } from './local-storage.service'
import { SocketService } from './sockets.service'

const base_url = environment.apiUrl

@Injectable({
  providedIn: 'root'
})
export class PtlidiomasService {
  user: PTLUsuarioModel = new PTLUsuarioModel()
  private _idiomas = new BehaviorSubject<PTLIdioma[]>([])
  private _idiomasChange = new Subject<any>()
  idiomasChange$ = this._idiomasChange.asObservable()

  constructor (private http: HttpClient, private socketService: SocketService, private _localstorageService: LocalStorageService) {
    this.socketService.listen('idiomas-actualizados').subscribe({
      next: payload => {
        console.log('Evento de Socket.IO recibido:', payload.msg)
        this._idiomasChange.next(payload)
        this.cargarRegistros().subscribe()
      },
      error: err => console.error('Error en la escucha de sockets:', err)
    })
  }

  get idiomas$ (): Observable<PTLIdioma[]> {
    return this._idiomas.asObservable()
  }

  getRegistrosActuales (): PTLIdioma[] {
    return this._idiomas.getValue()
  }

  getRegistros () {
    // console.log('4');
    const url = `${base_url}/idiomas`
    return this.http.get(url).pipe(
      map((resp: any) => {
        return {
          ok: true,
          idiomas: resp.idiomas
        }
      })
    )
  }

  cargarRegistros () {
    console.log('Consultando y ordenando idiomas del servidor...')
    const url = `${base_url}/idiomas`
    return this.http.get(url).pipe(
      map((resp: any) => resp.idiomas as PTLIdioma[]),
      map((idiomas: PTLIdioma[]) => {
        return idiomas.sort((a: any, b: any) => a.nombreIdioma.localeCompare(b.nombreIdioma))
      }),
      tap(idiomasOrdenadas => {
        console.log('idiomas servicio', idiomasOrdenadas)
        this._idiomas.next(idiomasOrdenadas)
      })
    )
  }

  getRegistroById (id: string) {
    console.log('buscar el idioma', id)
    const url = `${base_url}/idiomas/${id}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        return {
          ok: true,
          idioma: resp.idioma
        }
      })
    )
  }

  postCrearRegistro (data: any) {
    console.log('data del idioma', data)
    const url = `${base_url}/idiomas`
    return this.http.post(url, data).pipe(
      map((resp: any) => {
        console.log('data del idioma', resp.idioma)
        return {
          ok: true,
          idioma: resp.idioma
        }
      })
    )
  }

  putModificarRegistro (idioma: PTLIdioma) {
    const url = `${base_url}/idiomas/${idioma.codigoIdioma}`
    console.log('servicio de idiomas', idioma)
    return this.http.put(url, idioma).pipe(
      map((resp: any) => {
        return {
          ok: true,
          idioma: resp.idioma
        }
      })
    )
  }

  deleteEliminarRegistro (codigoIdioma: string) {
    const url = `${base_url}/idiomas/${codigoIdioma}`
    return this.http.delete(url).pipe(
      map((resp: any) => {
        return {
          ok: true,
          idioma: resp.idioma
        }
      })
    )
  }
}
