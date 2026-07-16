/*
    Author: German Valencia
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, tap } from 'rxjs/operators';
import { PTLActividadRoleModel } from '../_helpers/models/PTLActividadesRoles.model';
import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { SocketService } from './sockets.service';
import { LocalStorageService } from './local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class PtlactividadesRolesService {
    user: PTLUsuarioModel = new PTLUsuarioModel();
    private _actividadesRoles = new BehaviorSubject<PTLActividadRoleModel[]>([]);
    private _actividadesRolesChange = new Subject<any>();

    actividadesRolesChange$ = this._actividadesRolesChange.asObservable();

    constructor(
        private http: HttpClient,
        private _socketService: SocketService,
        private _localStorageService: LocalStorageService
    ) {
        console.log('******* Servicio de actividadesRoles iniciado correctamente');

        this._socketService.listen('actividades-roles-actualizadas').subscribe({
            next: (payload) => {
                console.log('Evento de Socket.IO recibido:', payload.msg);
                this._actividadesRolesChange.next(payload);
                this.cargarRegistros().subscribe();
            },
            error: (err) => console.error('Error en la escucha de sockets:', err)
        });
    }

    get actividadesRoles$(): Observable<PTLActividadRoleModel[]> {
        return this._actividadesRoles.asObservable();
    }

    getActividadesRolesActuales(): PTLActividadRoleModel[] {
        return this._actividadesRoles.getValue();
    }

    cargarRegistros() {
        console.log('Consultando y ordenando actividadesRoles del servidor...');
        const url = `${base_url}/actividades-roles`;

        return this.http.get(url).pipe(
            map((resp: any) => resp.actividadesRoles as PTLActividadRoleModel[]),
            tap((RolesOrdenadas) => {
                this._actividadesRoles.next(RolesOrdenadas);
            })
        );
    }

    getRegistroByCodeActividad(id: string) {
        const url = `${base_url}/actividades-roles/acti/${id}`;

        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('data de actividadesRoles', resp);
                return {
                    ok: true,
                    actividadesRoles: resp.actividadesRoles
                };
            })
        );
    }

    getRegistroByCodeRole(id: string) {
        const url = `${base_url}/actividades-roles/role/${id}`;

        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('data de actividadesRoles role', resp);
                return {
                    ok: true,
                    actividadesRoles: resp.actividadesRoles
                };
            })
        );
    }

    postCrearRegistro(data: PTLActividadRoleModel) {
        const url = `${base_url}/actividades-roles`;
        console.log('servicio actividadesRoles', data);

        return this.http.post(url, data).pipe(
            map((resp: any) => {
                return {
                    ok: true,
                    actividadRole: resp.actividadRole
                };
            })
        );
    }

    putModificarRegistro(actividad: PTLActividadRoleModel) {
        const url = `${base_url}/actividades-roles/${actividad.codigoActividad}`;

        return this.http.put(url, actividad).pipe(
            map((resp: any) => {
                console.log('data de actividad modificada', resp);
                return {
                    ok: true,
                    actividadRole: resp.actividadRole
                };
            })
        );
    }

    deleteEliminarRegistro(_id: string) {
        const url = `${base_url}/actividades-roles/${_id}`;

        return this.http.delete(url).pipe(
            map((resp: any) => {
                console.log('data de actividad eliminada', resp);
                return {
                    ok: true,
                    actividadRole: resp.actividadRole
                };
            })
        );
    }
}
