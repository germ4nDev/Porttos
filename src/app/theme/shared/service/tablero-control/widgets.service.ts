import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Widget } from '../../_helpers/models/tablero-control/widget.model';
import { SocketService } from '../sockets.service';
import { LocalStorageService } from '../local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class WidgetsService {
    private _widgets = new BehaviorSubject<Widget[]>([]);
    private _widgetsChange = new Subject<any>();
    widgetsChange$ = this._widgetsChange.asObservable();

    constructor(
        private http: HttpClient,
        private socketService: SocketService,
        private _localstorageService: LocalStorageService
    ) {
        // CORRECCIÓN 1: 'widgets-actualizados' (Igual que en el backend)
        this.socketService.listen('widgets-actualizados').subscribe({
            next: payload => {
                console.log('widgets-actializados', payload.msg);
                this._widgetsChange.next(payload);
                this.cargarWidgets().subscribe(); // Recarga reactiva
            },
            error: err => console.error('Error en la escucha de sockets:', err)
        });
    }

    get widgets$(): Observable<Widget[]> {
        return this._widgets.asObservable();
    }

    getWidgetsActuales(): Widget[] {
        return this._widgets.getValue();
    }

    cargarWidgets() {
        console.log('Consultando y ordenando widgets del servidor...');
        const url = `${base_url}/widgets`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.data as Widget[]),
            map((widgets: Widget[]) => {
                return widgets.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
            }),
            tap(widgetsOrdenadas => {
                console.log('&&&&&&&&&&&&&& widgets servicio', widgetsOrdenadas);
                this._widgets.next(widgetsOrdenadas);
            })
        );
    }

    getAllWidgets(): Observable<any> {
        return this.http.get(`${base_url}/widgets`);
    }

    // getWidgetByCode(codigo: string): Observable<any> {
    //     return this.http.get(`${base_url}/widgets/${codigo}`); // Ojo al plural /widgets/
    // }

    getWidgetByCode(codigo: string): Observable<any> {
        const url = `${base_url}/widgets/${codigo}`
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('========= data de widget', resp)
                return {
                    ok: true,
                    widget: resp.data
                }
            })
        )
    }

    crearWidget(widget: Widget) {
        const url = `${base_url}/widgets/`
        return this.http.post(url, widget).pipe(
            map((resp: any) => {
                return {
                    ok: true,
                    widget: resp.data
                }
            })
        )
    }

    actualizarWidget(widget: Widget) {
        const url = `${base_url}/widgets/${widget.codigo_widget}`
        return this.http.put(url, widget).pipe(
            map((resp: any) => {
                console.log('data de widget modificacda', resp)
                return {
                    ok: true,
                    widget: resp.data
                }
            })
        )
    }

    deleteWidget(codigo_widget: string): Observable<any> {
        return this.http.delete(`${base_url}/widgets/${codigo_widget}`);
    }

    guardarDisposicion(usuario: string, dashboard: any): Observable<any> {
        const payload = {
            codigo_usuario: usuario, // Temporal hasta que uses autenticación real
            layout: dashboard // Le tiras el array completo de Gridster
        };

        return this.http.post(`${base_url}/widgets/layout`, payload);
    }
}
