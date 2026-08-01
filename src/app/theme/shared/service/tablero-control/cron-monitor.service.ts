// //=======================================
// //    Author: German Valiencia
// //=======================================
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
// import { environment } from 'src/environments/environment';
// import { SocketService } from '../sockets.service';
// import { RegistroCron } from '../../_helpers/models/tablero-control/registro-cron.model';

// const base_url = environment.apiUrl;

// @Injectable({
//     providedIn: 'root'
// })
// export class CronMonitorService {
//     private _crons = new BehaviorSubject<RegistroCron[]>([]);
//     public crons$ = this._crons.asObservable();
//     private _cronsChange = new Subject<any>();
//     cronsChange$ = this._cronsChange.asObservable();

//     private apiUrl = `${base_url}/torre-control/estado-tuneles`;

//     constructor(
//         private http: HttpClient,
//         private _socketService: SocketService,
//     ) {
//         this._socketService.listen('crons-actualizados').subscribe({
//             next: payload => {
//                 console.log('🔄 Sockets: Notificación de actualización recibida', payload);
//                 this.obtenerHistorial().subscribe();
//             },
//             error: err => console.error('❌ Error en la escucha de sockets:', err)
//         });
//     }

//     getCronsActuales(): RegistroCron[] {
//         return this._crons.getValue();
//     }

//     obtenerHistorial(): Observable<RegistroCron[]> {
//         const url = `${base_url}/torre-control/estado-tuneles`;

//         // return this.http.get<{ data: RegistroCron[] }>(this.apiUrl).pipe(
//         //     map((resp: any) => resp.data as RegistroCron[]),
//         //     tap(cronsOrdenadas => {
//         //         this._crons.next(cronsOrdenadas);
//         //     })
//         // );
//         return this.http.get(url).pipe(
//             map((resp: any) => resp.data as RegistroCron[]),
//             // map((faros: RegistroCron[]) => {
//             //     return faros.sort((a: any, b: any) => a.nombre_faro.localeCompare(b.nombre_faro));
//             // }),
//             tap(farosOrdenadas => {
//                 console.log('&&&&&&&&&&&&&& faros servicio', farosOrdenadas);
//                 this._crons.next(farosOrdenadas);
//             })
//         );
//     }
// }
//=======================================
//    Author: German Valiencia
//=======================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SocketService } from '../sockets.service';
import { RegistroCron } from '../../_helpers/models/tablero-control/registro-cron.model';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class CronMonitorService {
    private _crons = new BehaviorSubject<RegistroCron[]>([]);
    public crons$ = this._crons.asObservable();
    private _cronsChange = new Subject<any>();
    cronsChange$ = this._cronsChange.asObservable();

    private apiUrl = `${base_url}/torre-control/estado-tuneles`;

    constructor(
        private http: HttpClient,
        private _socketService: SocketService,
    ) {
        this._socketService.listen('crons-actualizados').subscribe({
            next: (payload: any) => {
                // Desempaquetando el payload para mejor lectura en consola
                const nombreCron = payload?.id_cron || payload?.proceso || 'Desconocido';
                const estadoCron = payload?.estado_monitoreo || payload?.estado || 'N/A';

                console.log(`🔄 Sockets: El cron [${nombreCron}] finalizó con estado: ${estadoCron}`);

                // Actualizamos el historial completo tras recibir el aviso
                this.obtenerHistorial().subscribe();
            },
            error: err => console.error('❌ Error en la escucha de sockets:', err)
        });
    }

    getCronsActuales(): RegistroCron[] {
        return this._crons.getValue();
    }

    obtenerHistorial(): Observable<RegistroCron[]> {
        const url = `${base_url}/torre-control/estado-tuneles`;

        return this.http.get(url).pipe(
            map((resp: any) => resp.data as RegistroCron[]),
            tap(farosOrdenadas => {
                // console.log('&&&&&&&&&&&&&& faros servicio', farosOrdenadas);
                this._crons.next(farosOrdenadas);
            })
        );
    }
}
