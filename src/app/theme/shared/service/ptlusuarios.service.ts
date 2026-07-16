/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { catchError, map, tap } from 'rxjs/operators'
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model'
import { environment } from 'src/environments/environment'
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs'
import { SocketService } from './sockets.service'
import { LocalStorageService } from './local-storage.service'
import { PtlusuariosRolesApService } from './ptlusuarios-roles-ap.service'
import { UploadFilesService } from './upload-files.service'
import { PTLUsuarioSCModel } from '../_helpers/models/PTLUsuarioSC.model'
import { v4 as uuidv4 } from 'uuid'
import { PtlusuariosScService } from './ptlusuarios-sc.service'
import { PTLUsuarioRoleAPModel } from '../_helpers/models/PTLUsuarioRole.model'
const base_url = environment.apiUrl

@Injectable({
    providedIn: 'root'
})
export class PTLUsuariosService {
    usuario: PTLUsuarioModel = new PTLUsuarioModel()
    private _registros = new BehaviorSubject<PTLUsuarioModel[]>([])
    private _registrosChange = new Subject<any>()
    _registrosChange$ = this._registrosChange.asObservable()

    constructor(
        private http: HttpClient,
        private socketService: SocketService,
        private _localStorageService: LocalStorageService,
        private _usuairosRolesService: PtlusuariosRolesApService,
        private _usuairosSCService: PtlusuariosScService,
        private _uploadService: UploadFilesService
    ) {
        console.log('******* Servicio de usuarios iniciado correctamente')
        this.usuario = this._localStorageService.getUsuarioLocalStorage()
        this.socketService.listen('usuarios-actualizada=os').subscribe({
            next: payload => {
                console.log('Evento de Socket.IO recibido:', payload.msg)
                this._registrosChange.next(payload)
                this.cargarRegistros().subscribe()
            },
            error: err => console.error('Error en la escucha de sockets:', err)
        })
    }

    get usuarios$(): Observable<PTLUsuarioModel[]> {
        return this._registros.asObservable()
    }

    cargarRegistros() {
        console.log('Consultando y ordenando usuarios del servidor...')
        const url = `${base_url}/usuarios`
        return this.http.get(url).pipe(
            map((resp: any) => resp.usuarios as PTLUsuarioModel[]),
            map((regs: PTLUsuarioModel[]) => {
                console.log('respuesta usuarios', regs)
                return regs.sort((a: any, b: any) => a.nombreUsuario.localeCompare(b.nombreUsuario))
            }),
            tap(RegistrosOrdenadas => {
                this._registros.next(RegistrosOrdenadas)
            })
        )
    }

    getUsuarios() {
        const url = `${base_url}/usuarios/`
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('respuesta servicio', resp)
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                return {
                    ok: true,
                    usuarios: resp.usuarios
                }
            })
        )
    }

    getUsuarioById(id: string) {
        const url = `${base_url}/usuarios/${id}`
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('data del usuario', resp)
                return {
                    ok: true,
                    usuario: resp.usuario
                }
            })
        )
    }

    verificarClaveActual(codigo: string, clave: string) {
        const validacion = { codigoAdministrador: codigo, claveActual: clave }
        return this.http.post(`${environment.apiUrl}/usuarios/validar`, { validacion }).pipe(
            tap(susc => {
                if (!susc) {
                    throw new Error('Usuairo no válido')
                }
                return {
                    ok: true,
                    suscriptor: susc
                }
            }),
            catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.msg || 'Error en la validación'
                return throwError(() => errorMessage)
            })
        )
    }

    obtenerUsuariosPorSuscriptor(suscriptorId: string): Observable<PTLUsuarioModel[]> {
        const url = `${base_url}/usuarios/suscriptor/${suscriptorId}`
        // IMPORTANTE: Debe llevar el 'return'
        return this.http.get<any>(url).pipe(map(resp => resp.usuarios as PTLUsuarioModel[]))
    }

    crearUsuario(data: PTLUsuarioModel) {
        const url = `${base_url}/usuarios`
        console.log('servicio usuarios', data)
        return this.http.post(url, data).pipe(
            map((resp: any) => {
                this.crearUsuarioSCPlataforma(resp.usuario)
                // this._usuairosRolesService.postUsuarioRole(usuarioRole).subscribe(() => console.log('Usuairo Role creado'));
                return {
                    ok: true,
                    usuario: resp.usuario
                }
            })
        )
    }

    postCrearUsuario(data: PTLUsuarioModel) {
        const url = `${base_url}/usuarios`;
        console.log('servicio usuarios', data);
        return this.http.post(url, data).pipe(
            map((resp: any) => {
                return {
                    ok: true,
                    usuarios: resp.usuario
                };
            })
        );
    }

    crearUsuarioSCPlataforma(data: PTLUsuarioModel) {
        const usuarioSC: PTLUsuarioSCModel = {
            codigoUsuarioSC: uuidv4(),
            codigoUsuario: data.codigoUsuario,
            codigoSuscriptor: 'e1a8fa99-15db-479b-a0a4-9c2be72273c9',
            estadoUsuarioSC: true,
            codigoUsuarioCreacion: this._localStorageService.getUsuarioLocalStorage().codigoUsuario,
            fechaCreacion: new Date().toISOString()
        }
        const url = `${base_url}/usuarios-sc`
        console.log('servicio usuarios roles', data)
        return this.http.post(url, usuarioSC).pipe(
            map((resp: any) => {
                const usuarioRole: PTLUsuarioRoleAPModel = {
                    codigoUsuarioSC: resp.usurioSC.codigoUsuarioSC,
                    codigoEmpresaSC: 'e1a8fa99-15db-479b-a0a4-9c2be72273e9',
                    codigoRole: 'aa5901bc-9c7d-45e8-bf68-4a0a286e9b99',
                    estadoUsuarioRole: true,
                    codigoUsuarioCreacion: this._localStorageService.getUsuarioLocalStorage().codigoUsuario,
                    fechaCreacion: new Date().toISOString()
                }
                this._usuairosRolesService.postUsuarioRole(usuarioRole).subscribe(() => console.log('Usuairo Role creado'))
            })
        )
    }

    actualizarUsuario(usuario: PTLUsuarioModel) {
        const codigoUser = usuario.codigoUsuario || ''
        this.getUsuarioById(codigoUser).subscribe((usu: any) => {
            let imagenUsuario = ''
            if (usu.fotoUsuario !== '') {
                imagenUsuario = usu.fotoUsuario
                if (imagenUsuario !== usuario.fotoUsuario) {
                    const fotoUsuario = this.usuario.fotoUsuario || ''
                    const tipo = 'usuarios'
                    const objUpload = {
                        susc: this._localStorageService.getSuscriptorLocalStorage()?.codigoSuscriptor || '',
                        tipo: 'usuarios',
                        file: fotoUsuario
                    }
                    this._uploadService.deleteFilePath(objUpload).subscribe(() => console.log('Foto eliminada'))
                }
            }
        })
        const url = `${base_url}/usuarios/${usuario.codigoUsuario}`
        return this.http.put(url, usuario).pipe(
            map((resp: any) => {
                console.log('data de usuario modificacda', resp)
                this._localStorageService.setUsuarioLocalStorage(usuario)
                return {
                    ok: true,
                    usuario: resp.usuario
                }
            })
        )
    }

    actualizarUsuarioDatos(usuario: PTLUsuarioModel) {
        const codigoUser = usuario.codigoUsuario || ''
        this.getUsuarioById(codigoUser).subscribe((usu: any) => {
            let imagenUsuario = ''
            if (usu.usuario.fotoUsuario !== '') {
                imagenUsuario = usu.usuario.fotoUsuario
                if (imagenUsuario !== usuario.fotoUsuario) {
                    const objUpload = {
                        susc: this._localStorageService.getSuscriptorLocalStorage()?.codigoSuscriptor || '',
                        tipo: 'usuarios',
                        file: imagenUsuario
                    }
                    this._uploadService.deleteFilePath(objUpload).subscribe(() => console.log('Foto eliminada'))
                }
            }
        })
        // const url = `${base_url}/usuarios`;
        const url = `${base_url}/usuarios/datos/${usuario.codigoUsuario}`
        return this.http.put(url, usuario).pipe(
            map((resp: any) => {
                console.log('data de usuario modificacda', resp)
                return {
                    ok: true,
                    usuario: resp.usuario
                }
            })
        )
    }

    actualizarUsuarioClave(usuario: PTLUsuarioModel) {
        const url = `${base_url}/usuarios/clave/${usuario.usuarioId}`
        return this.http.put(url, usuario).pipe(
            map((resp: any) => {
                console.log('data de usuario modificacda', resp)
                return {
                    ok: true,
                    usuario: resp.usuario
                }
            })
        )
    }

    eliminarUsuairo(_id: number) {
        const url = `${base_url}/usuarios/${_id}`
        return this.http.delete(url).pipe(
            map((resp: any) => {
                console.log('data de usuario eliminado', resp)
                return {
                    ok: true,
                    usuario: resp.usuario
                }
            })
        )
    }
}
