/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { map, tap } from 'rxjs/operators'
import { PTLFormatoGaleria } from '../_helpers/models/PTLFormatoGaleria.model'
import { environment } from 'src/environments/environment'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { SocketService } from './sockets.service'
import { LocalStorageService } from './local-storage.service'

const base_url = environment.apiUrl

@Injectable({
    providedIn: 'root'
})
export class PtlformatosGaleriaService {
    private _formatosGaleria = new BehaviorSubject<PTLFormatoGaleria[]>([])
    private _formatosGaleriaChange = new Subject<any>()
    formatosGaleriaChange$ = this._formatosGaleriaChange.asObservable()

    constructor(private http: HttpClient, private socketService: SocketService, private _localstorageService: LocalStorageService) {
        this.socketService.listen('formatos-formatosGaleria-actualizadas').subscribe({
            next: payload => {
                console.log('Evento de Socket.IO recibido:', payload.msg)
                this._formatosGaleriaChange.next(payload)
                this.cargarFormatosGaleria().subscribe()
            },
            error: err => console.error('Error en la escucha de sockets:', err)
        })
    }

    get formatosGaleria$(): Observable<PTLFormatoGaleria[]> {
        return this._formatosGaleria.asObservable()
    }

    getFormatosGaleriaActuales(): PTLFormatoGaleria[] {
        return this._formatosGaleria.getValue()
    }

    getFormatosGaleria() {
        console.log('Consultando galería')
        const url = `${base_url}/formatos-galeria`
        return this.http.get(url).pipe(
            map((resp: any) => {
                return {
                    ok: true,
                    formatosGaleria: resp.formatosGaleria || resp.formatosGaleria
                }
            })
        )
    }

    cargarFormatosGaleria() {
        console.log('Consultando y ordenando formatosGalería del servidor...')
        const url = `${base_url}/formatos-galeria`
        return this.http.get(url).pipe(
            map((resp: any) => (resp.formatosGaleria || resp.formatosGaleria) as PTLFormatoGaleria[]),
            map((formatosGaleria: PTLFormatoGaleria[]) => {
                return formatosGaleria.sort((a: any, b: any) => (a.nombreFormato || '').localeCompare(b.nombreFormato || ''))
            }),
            tap(formatosGaleriaOrdenada => {
                this._formatosGaleria.next(formatosGaleriaOrdenada)
            })
        )
    }

    getFormatosGaleriaById(id: string) {
        const url = `${base_url}/formatos-galeria/${id}`
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('data de formatoGalería', resp)
                return {
                    ok: true,
                    formatoGaleria: resp.formatoGaleria
                }
            })
        )
    }

    getFormatosGaleriaByCode(code: string) {
        const url = `${base_url}/formatos-galeria/code/${code}`
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('data de la formao', resp.formatoGaleria)
                return {
                    ok: true,
                    formatoGaleria: resp.formatoGaleria
                }
            })
        )
    }

    crearFormatoGaleria(data: PTLFormatoGaleria) {
        const url = `${base_url}/formatos-galeria`
        return this.http.post(url, data).pipe(
            map((resp: any) => {
                return {
                    ok: true,
                    formatoGaleria: resp.formatoGaleria
                }
            })
        )
    }

    actualizarFormatoGaleria(formatoGaleria: PTLFormatoGaleria) {
        const url = `${base_url}/formatos-galeria/${formatoGaleria.codigoFormato}`
        return this.http.put(url, formatoGaleria).pipe(
            map((resp: any) => {
                console.log('data de formato modificada', resp)
                return {
                    ok: true,
                    formatoGaleria: resp.formatoGaleria
                }
            })
        )
    }

    eliminarFormatoGaleria(id: string) {
        console.log('eliminar formato', id)
        const url = `${base_url}/formatos-galeria/${id}`
        return this.http.delete(url).pipe(
            map((resp: any) => {
                console.log('data de formato eliminada', resp)
                return {
                    ok: true,
                    formatoGaleria: resp.formatoGaleria
                }
            })
        )
    }
}
