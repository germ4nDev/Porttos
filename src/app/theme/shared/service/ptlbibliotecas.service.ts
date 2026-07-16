/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'

import { map, tap, catchError } from 'rxjs/operators'
import { throwError } from 'rxjs'
import { PTLBiblioteca } from '../_helpers/models/PTLBiblioteca.model' // Asegúrate de que la ruta sea correcta
import { environment } from 'src/environments/environment'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { SocketService } from './sockets.service'
import { LocalStorageService } from './local-storage.service'
const base_url = environment.apiUrl

@Injectable({
  providedIn: 'root'
})
export class PtlBibliotecasService {
  private _bibliotecas = new BehaviorSubject<PTLBiblioteca[]>([])
  private _bibliotecasChange = new Subject<any>()
  bibliotecasChange$ = this._bibliotecasChange.asObservable()

  constructor (private http: HttpClient, private socketService: SocketService, private _localstorageService: LocalStorageService) {
    this.socketService.listen('bibliotecas-actualizadas').subscribe({
      next: payload => {
        console.log('Evento de Socket.IO recibido:', payload.msg)
        this._bibliotecasChange.next(payload)
        this.cargarBibliotecas().subscribe()
      },
      error: err => console.error('Error en la escucha de sockets:', err)
    })
  }

  get biblioteca$ (): Observable<PTLBiblioteca[]> {
    return this._bibliotecas.asObservable()
  }

  getBibliotecasActuales (): PTLBiblioteca[] {
    return this._bibliotecas.getValue()
  }

  getBibliotecas () {
    const url = `${base_url}/bibliotecas`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('Consultando TODAS biblioteca', resp.bibliotecas)
        return {
          ok: true,
          // Se asume que el backend ahora devuelve el array en la propiedad 'biblioteca'
          bibliotecas: resp.bibliotecas
        }
      })
    )
  }

  cargarBibliotecas () {
    console.log('Consultando y ordenando biblioteca del servidor...')
    const url = `${base_url}/bibliotecas`
    return this.http.get(url).pipe(
      map((resp: any) => resp.bibliotecas as PTLBiblioteca[]),
      map((bibliotecas: PTLBiblioteca[]) => {
        console.log('Todas las bibliotecas', bibliotecas)
        return bibliotecas.sort((a: any, b: any) => (a.nombreBiblioteca || '').localeCompare(b.nombreBiblioteca || ''))
      }),
      tap(bibliotecasOrdenada => {
        this._bibliotecas.next(bibliotecasOrdenada)
      })
    )
  }

  getBibliotecaById (id: string) {
    const url = `${base_url}/bibliotecas/${id}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de biblioteca', resp)
        return {
          ok: true,
          biblioteca: resp.biblioteca
        }
      })
    )
  }

  getBibliotecaByCode (code: string) {
    const url = `${base_url}/bibliotecas/code/${code}`
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de la biblioteca', resp.biblioteca)
        return {
          ok: true,
          biblioteca: resp.biblioteca
        }
      })
    )
  }

  crearBiblioteca (data: PTLBiblioteca) {
    console.log(data)
    const url = `${base_url}/bibliotecas`
    return this.http.post(url, data).pipe(
      map((resp: any) => {
        console.log('resp', resp)
        return {
          ok: true,
          biblioteca: resp.biblioteca
        }
      }),
      catchError((err: HttpErrorResponse) => {
        console.log('Error completo:', err)
        const mensaje = err.error?.message || 'Error al crear la biblioteca'
        return throwError(() => new Error(mensaje))
      })
    )
  }

  actualizarBiblioteca (biblioteca: PTLBiblioteca) {
    const url = `${base_url}/bibliotecas/${biblioteca.codigoBiblioteca}`
    return this.http.put(url, biblioteca).pipe(
      map((resp: any) => {
        console.log('data de biblioteca modificada', resp)
        return {
          ok: true,
          biblioteca: resp.biblioteca
        }
      })
    )
  }

  eliminarBiblioteca (_id: any) {
    console.log('eliminar biblioteca', _id)
    const url = `${base_url}/bibliotecas/${_id.id}`
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de biblioteca eliminada', resp)
        return {
          ok: true,
          biblioteca: resp.biblioteca
        }
      })
    )
  }
}
