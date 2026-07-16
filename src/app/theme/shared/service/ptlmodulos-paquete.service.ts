import { Injectable } from '@angular/core'
import { PTLModuloPQModel, PTLModuloPQModelAdm } from '../_helpers/models/PTLModuloPQ.model'
import { HttpClient } from '@angular/common/http'
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
export class PTLModulosPaqueteService {
  user: PTLUsuarioModel = new PTLUsuarioModel()
  private _modulosPQ = new BehaviorSubject<PTLModuloPQModel[]>([])
  private _modulosPQChange = new Subject<any>()
  modulosPQChange$ = this._modulosPQChange.asObservable()

  constructor (private http: HttpClient, private socketService: SocketService, private _localStorageService: LocalStorageService) {
    this.socketService.listen('modulos-paquete-actualizados').subscribe({
      next: payload => {
        console.log('Evento de Socket.IO recibido:', payload.msg)
        this._modulosPQChange.next(payload)
        this.cargarRegistros().subscribe()
      },
      error: err => console.error('Error en la escucha de sockets:', err)
    })
  }

  getRegistros () {
    const url = `${base_url}/modulos-paquete`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('servicio de modulos-paquete', resp)
        return {
          ok: true,
          modulosPaquete: resp.modulosPaquete
        }
      })
    )
  }

  get modulosPQ$ (): Observable<PTLModuloPQModel[]> {
    return this._modulosPQ.asObservable()
  }

  cargarRegistros () {
    console.log('Consultando y ordenando modulos-paquete del servidor...')
    const url = `${base_url}/modulos-paquete`
    return this.http.get(url).pipe(
      map((resp: any) => resp.modulosPaquete as PTLModuloPQModel[]),
    //   map((modulosPaquete: PTLModuloAP[]) => {
    //     return modulosPaquete.sort((a: any, b: any) => a.nombreModulo.localeCompare(b.nombreModulo))
    //   }),
      tap(modulosPaqueteOrdenadas => {
        console.log('modulosPaquete servicio', modulosPaqueteOrdenadas)
        this._modulosPQ.next(modulosPaqueteOrdenadas)
      })
    )
  }

  getRegistroById (id: string) {
    const url = `${base_url}/modulos-paquete/${id}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de modulosPQ', resp)
        return {
          ok: true,
          modulosPaquete: resp.modulosPaquete
        }
      })
    )
  }

  postCrearRegistro (modulosPaquete: PTLModuloPQModelAdm) {
    const url = `${base_url}/modulos-paquete`
    console.log('data del modulosPaquete', modulosPaquete)
    // return this.http.post(url, modulo);
    return this.http.post(url, modulosPaquete).pipe(
      map((resp: any) => {
        return {
          ok: true,
          modulosPaquete: resp.modulosPaquete
        }
      })
    )
  }

  putModificarRegistro (modulosPaquete: PTLPaqueteModel) {
    const url = `${base_url}/modulos-modulosPaquete/${modulosPaquete}`
    return this.http.put(url, modulosPaquete).pipe(
      map((resp: any) => {
        console.log('data de modulosPaquete modificacdo', resp)
        return {
          ok: true,
          modulosPaquete: resp.modulosPaquete
        }
      })
    )
  }

  deleteEliminarRegistro (_id: any) {
    const url = `${base_url}/modulos-paquete/${_id.id}`
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de modulosPaquete eliminado', resp)
        return {
          ok: true,
          modulosPaquete: resp.modulosPaquete
        }
      })
    )
  }
}
