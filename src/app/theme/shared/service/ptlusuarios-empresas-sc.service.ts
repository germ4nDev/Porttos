/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { PTLUsuaioEmpresasSCModel } from '../_helpers/models/PTLUsuarioEmpresaSC.model';
import { LocalStorageService } from './local-storage.service';
import { SocketService } from './sockets.service';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class PtlusuariosEmpresasScService {
    curentUser: PTLUsuarioModel = new PTLUsuarioModel();
    private _usuariosEmpresas = new BehaviorSubject<PTLUsuaioEmpresasSCModel[]>([]);
    private _usuariosEmpresasChange = new Subject<any>();
    _usuariosEmpresasChange$ = this._usuariosEmpresasChange.asObservable();

    constructor(
        private http: HttpClient,
        private _socketService: SocketService,
        private _localStorageService: LocalStorageService
    ) {
        console.log('******* Servicio de usuariosEmpresas iniciado correctamente');
        this._socketService.listen('usuarios-empresas-actualizadas').subscribe({
            next: (payload) => {
                console.log('Evento de Socket.IO recibido:', payload.msg);
                this._usuariosEmpresasChange.next(payload);
                this.cargarRegistros().subscribe();
            },
            error: (err) => console.error('Error en la escucha de sockets:', err)
        });
    }

    get _usuariosEmpresas$(): Observable<PTLUsuaioEmpresasSCModel[]> {
        return this._usuariosEmpresas.asObservable();
    }

    getUsuariosEmpresasSCActuales(): PTLUsuaioEmpresasSCModel[] {
        return this._usuariosEmpresas.getValue()
    }

    cargarRegistros() {
        console.log('Consultando y ordenando usuariosEmpresas del servidor...');
        const url = `${base_url}/usuarios-empresas-sc`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.usuariosEmpresas as PTLUsuaioEmpresasSCModel[]),
            tap((UsuariosEmpresasOrdenadas) => {
                console.log(`UsuariosEmpresas cargados: ${UsuariosEmpresasOrdenadas.length}`);
                this._usuariosEmpresas.next(UsuariosEmpresasOrdenadas);
            })
        );
    }

    getRegistroById(id: string) {
        const url = `${base_url}/usuarios-empresas-sc/${id}`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('data de usuarioEmpresa', resp);
                return {
                    ok: true,
                    usuarioEmpresa: resp.usuarioEmpresa
                };
            })
        );
    }

    postCrearRegistro(data: any) {
        console.log('servicio usuarioEmpresa', data);
        const url = `${base_url}/usuarios-empresas-sc`;
        return this.http.post(url, data).pipe(
            map((resp: any) => {
                return {
                    ok: true,
                    usuarioEmpresa: resp.usuarioEmpresa
                };
            })
        );
    }

    putModificarRegistro(usuarioEmpresa: PTLUsuaioEmpresasSCModel) {
        const url = `${base_url}/usuarios-empresas-sc/${usuarioEmpresa.codigoUsuarioEmpresaSC}`;
        return this.http.put(url, usuarioEmpresa).pipe(
            map((resp: any) => {
                console.log('data de usuarioEmpresa modificacda', resp);
                return {
                    ok: true,
                    usuarioEmpresa: resp.usuarioEmpresaAP
                };
            })
        );
    }

    deleteEliminarRegistro(_id: string) {
        const url = `${base_url}/usuarios-empresas-sc/${_id}`;
        return this.http.delete(url).pipe(
            map((resp: any) => {
                console.log('data de usuarioEmpresa eliminado', resp);
                return {
                    ok: true,
                    usuarioEmpresa: resp.usuarioEmpresa
                };
            })
        );
    }
}
