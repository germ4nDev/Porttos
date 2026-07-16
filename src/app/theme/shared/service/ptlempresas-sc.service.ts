/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map, tap } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import { PTLEmpresaSCModel } from '../_helpers/models/PTLEmpresaSC.model'
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model'
import { LocalStorageService } from './local-storage.service'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { SocketService } from './sockets.service'

const base_url = environment.apiUrl

@Injectable({
    providedIn: 'root'
})
export class PtlEmpresasScService {
    user: PTLUsuarioModel = new PTLUsuarioModel()
    private _registros = new BehaviorSubject<PTLEmpresaSCModel[]>([])
    private _registrosChange = new Subject<any>()
    registrosChange$ = this._registrosChange.asObservable()

    constructor(private http: HttpClient, private _socketService: SocketService, private _localStorageService: LocalStorageService) {
        console.log('******* Servicio de empresasSC iniciado correctamente')
        this._socketService.listen('empresas-sc-actualizadas').subscribe({
            next: payload => {
                console.log('Evento de Socket.IO recibido:', payload.msg)
                this._registrosChange.next(payload)
                this.cargarRegistros().subscribe()
            },
            error: err => console.error('Error en la escucha de sockets:', err)
        })
    }

    get empresasSC$(): Observable<PTLEmpresaSCModel[]> {
        return this._registros.asObservable()
    }

    getEmpresasSCActuales(): PTLEmpresaSCModel[] {
        return this._registros.getValue()
    }

    cargarRegistros() {
        console.log('Consultando y ordenando empresasSC del servidor...')
        const url = `${base_url}/empresas-sc`
        return this.http.get(url).pipe(
            map((resp: any) => resp.empresasSC as PTLEmpresaSCModel[]),
            map((empresasSC: PTLEmpresaSCModel[]) => {
                return empresasSC.sort((a: any, b: any) => a.nombreEmpresa.localeCompare(b.nombreEmpresa))
            }),
            tap(EmpresasOrdenadas => {
                this._registros.next(EmpresasOrdenadas)
            })
        )
    }

    getTodasEmpresaById() {
        const url = `${base_url}/empresas-sc`
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('todas las empresas', resp)
                return {
                    ok: true,
                    empresasSC: resp.empresasSC
                }
            })
        )
    }

    getEmpresaById(id: string) {
        const url = `${base_url}/empresas-sc/${id}`
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('data del empresa', resp)
                return {
                    ok: true,
                    empresaSC: resp.empresaSC
                }
            })
        )
    }

    crearEmpresa(empresa: PTLEmpresaSCModel) {
        const url = `${base_url}/empresas-sc`
        return this.http.post(url, empresa)
    }

    actualizarEmpresa(data: PTLEmpresaSCModel) {
        const url = `${base_url}/empresas-sc/${data.codigoEmpresaSC}`
        return this.http.put(url, data).pipe(
            map((resp: any) => {
                console.log('data de empresa modificacda', resp)
                return {
                    ok: true,
                    empresaSC: resp.empresaSC
                }
            })
        )
    }

    eliminarEmpresa(_id: string) {
        const url = `${base_url}/empresas-sc/${_id}`
        return this.http.delete(url).pipe(
            map((resp: any) => {
                console.log('data de empresa eliminado', resp)
                return {
                    ok: true,
                    empresaSC: resp.empresaSC
                }
            })
        )
    }
}
