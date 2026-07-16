// import { HttpClient } from '@angular/common/http';
// import { Injectable, OnDestroy, OnInit } from '@angular/core';
// import { HttpParams } from '@angular/common/http';
// import { environment } from '../../../../../environments/environment';
// import { BehaviorSubject, Observable, Subscription } from 'rxjs';
// import { SocketService } from '../sockets.service';
// import Swal from 'sweetalert2'
// import { ToastrService } from 'ngx-toastr';
// import { IngestaService } from './ingesta.service';
// const base_url = environment.apiUrl;

// @Injectable({
//     providedIn: 'root'
// })
// export class DashboardService implements OnInit, OnDestroy {
//     private _widgetFocusSource = new BehaviorSubject<{ type: string, data: any } | null>(null);
//     public widgetFocus$ = this._widgetFocusSource.asObservable();
//     private socketSub: Subscription = new Subscription;

//     constructor(
//         private http: HttpClient,
//         private socketService: SocketService,
//         private _ingestaService: IngestaService,
//         private toastr: ToastrService
//     ) {
//     }

//     ngOnInit(): void {
//         this.socketSub = this.socketService.listen('alerta-interactiva').subscribe((alerta: any) => {
//             if (alerta.nivel === 'warning' && alerta.accionRequerida) {

//                 // 1. Mostramos el Toastr y guardamos su "referencia"
//                 const toastRef = this.toastr.warning(
//                     alerta.mensaje + '<br><br><b>👉 Haz clic en esta tarjeta para sincronizar ahora</b>',
//                     alerta.titulo,
//                     {
//                         enableHtml: true,
//                         timeOut: 15000,
//                         progressBar: true,
//                         tapToDismiss: true
//                     }
//                 );

//                 // 2. Escuchamos el evento 'clic' sobre esa notificación específica
//                 toastRef.onTap.subscribe(() => {
//                     this.ejecutarSincronizacion();
//                 });

//             } else {
//                 // Alertas normales sin acción
//                 this.toastr.info(alerta.mensaje, alerta.titulo);
//             }
//         });
//     }

//     mostrarAlerta(alerta: any) {
//         Swal.fire({
//             title: alerta.titulo,
//             text: alerta.mensaje,
//             icon: alerta.nivel, // 'warning'
//             showCancelButton: true,
//             confirmButtonColor: '#3b82f6', // Azul del dashboard
//             cancelButtonColor: '#64748b',  // Gris
//             confirmButtonText: 'Sí, Sincronizar',
//             cancelButtonText: 'Más tarde'
//         }).then((result) => {

//             // Si el usuario da clic en "Sí, Sincronizar"
//             if (result.isConfirmed) {

//                 // Llamamos al endpoint que armamos en tu controlador de Node
//                 this.http.post(`http://localhost:3000${alerta.endpointAccion}`, {}).subscribe({
//                     next: (res: any) => {

//                         Swal.fire(
//                             '¡Sincronizado!',
//                             'Los históricos de Supertransporte están al día.',
//                             'success'
//                         );
//                         // Aquí podrías recargar un widget de gráficas si es necesario
//                     },
//                     error: (err) => {
//                         Swal.fire('Error', 'No se pudo conectar con datos.gov.co', 'error');
//                     }
//                 });

//             }
//         });
//     }

//     ejecutarSincronizacion() {
//         this.toastr.info('Sincronizando con Supertransporte...', 'Procesando', { timeOut: 2000 });
//         this._ingestaService.actualizarHistoricoSuperTrasnporte()
//     }

//     getLayout(codigo: string): Observable<any> {
//         return this.http.get(`${base_url}/tclp-dashboard/${codigo}`);
//     }

//     saveLayout(payload: any): Observable<any> {
//         return this.http.post(`${base_url}/tclp-dashboard`, { payload });
//     }

//     // 2. Método para abrir
//     abrirModoEnfoque(type: string, data: any) {
//         this._widgetFocusSource.next({ type, data });
//     }

//     // 3. Método para cerrar
//     cerrarModoEnfoque() {
//         this._widgetFocusSource.next(null);
//     }

//     obtenerResumenKpis(puerto?: string): Observable<any> {
//         let params = new HttpParams();
//         console.log('Consultando el puerto:', puerto);
//         if (puerto) {
//             params = params.set('puerto', puerto.toUpperCase());
//         }
//         return this.http.get(`${base_url}/torre-control/kpis`, { params });
//     }

//     // Este es el método que tu 'TerminalSummaryComponent' está llamando
//     evaluarTerminalIA(terminalId: string): Observable<any> {
//         // Podrías pasar el terminalId como query param si quieres filtrar en el backend,
//         // pero por ahora el endpoint trae la visión global de las 72H.
//         return this.http.get<any>(`${base_url}/ia/dashboard/motonaves-72h`);
//     }

//     ngOnDestroy() {
//         // Muy importante: destruir la suscripción para evitar memory leaks en Angular
//         if (this.socketSub) {
//             this.socketSub.unsubscribe();
//         }
//     }
// }


/*
    Author: German Valencia
    Component: Dashboard Service (Orquestador Central QPLUS)
*/
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
const base_url = environment.apiUrl;
import { BehaviorSubject, catchError, map, Observable, of, Subscription, tap } from 'rxjs';
import { SocketService } from '../sockets.service';
import Swal from 'sweetalert2'
import { ToastrService } from 'ngx-toastr';
import { IngestaService } from './ingesta.service';
import { LocalStorageService } from '../local-storage.service';

@Injectable({
    providedIn: 'root'
})
export class DashboardService implements OnInit, OnDestroy {
    private _widgetFocusSource = new BehaviorSubject<{ type: string, data: any } | null>(null);

    private _puertoSeleccionadoSource = new BehaviorSubject<string>('TODOS');
    public puertoSeleccionado$ = this._puertoSeleccionadoSource.asObservable();

    public widgetFocus$ = this._widgetFocusSource.asObservable();
    private socketSub: Subscription = new Subscription;
    public climaPortuario: any;
    public mapaPortuario: any[] = [];

    constructor(
        private http: HttpClient,
        private socketService: SocketService,
        private _ingestaService: IngestaService,
        private _localStorageService: LocalStorageService,
        private toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.socketSub = this.socketService.listen('alerta-interactiva').subscribe((alerta: any) => {
            if (alerta.nivel === 'warning' && alerta.accionRequerida) {

                // 1. Mostramos el Toastr y guardamos su "referencia"
                const toastRef = this.toastr.warning(
                    alerta.mensaje + '<br><br><b>👉 Haz clic en esta tarjeta para sincronizar ahora</b>',
                    alerta.titulo,
                    {
                        enableHtml: true,
                        timeOut: 15000,
                        progressBar: true,
                        tapToDismiss: true
                    }
                );

                // 2. Escuchamos el evento 'clic' sobre esa notificación específica
                toastRef.onTap.subscribe(() => {
                    this.ejecutarSincronizacion();
                });

            } else {
                // Alertas normales sin acción
                this.toastr.info(alerta.mensaje, alerta.titulo);
            }
        });
    }

    setPuerto(puerto: string) {
        if (puerto !== this._puertoSeleccionadoSource.value) {
            this._puertoSeleccionadoSource.next(puerto);
            this._localStorageService.setObject('puerto_seleccionado', puerto);
        }
    }

    mostrarAlerta(alerta: any) {
        Swal.fire({
            title: alerta.titulo,
            text: alerta.mensaje,
            icon: alerta.nivel, // 'warning'
            showCancelButton: true,
            confirmButtonColor: '#3b82f6', // Azul del dashboard
            cancelButtonColor: '#64748b',  // Gris
            confirmButtonText: 'Sí, Sincronizar',
            cancelButtonText: 'Más tarde'
        }).then((result) => {

            // Si el usuario da clic en "Sí, Sincronizar"
            if (result.isConfirmed) {

                // Llamamos al endpoint que armamos en tu controlador de Node
                this.http.post(`http://localhost:3000${alerta.endpointAccion}`, {}).subscribe({
                    next: (res: any) => {

                        Swal.fire(
                            '¡Sincronizado!',
                            'Los históricos de Supertransporte están al día.',
                            'success'
                        );
                    },
                    error: (err) => {
                        Swal.fire('Error', 'No se pudo conectar con datos.gov.co', 'error');
                    }
                });

            }
        });
    }

    ejecutarSincronizacion() {
        this.toastr.info('Sincronizando con Supertransporte...', 'Procesando', { timeOut: 2000 });
        this._ingestaService.actualizarHistoricoSuperTrasnporte()
    }

    getLayout(codigo: string): Observable<any> {
        return this.http.get(`${base_url}/tclp-dashboard/${codigo}`);
    }

    saveLayout(payload: any): Observable<any> {
        return this.http.post(`${base_url}/tclp-dashboard`, { payload });
    }

    abrirModoEnfoque(type: string, data: any) {
        this._widgetFocusSource.next({ type, data });
    }

    cerrarModoEnfoque() {
        this._widgetFocusSource.next(null);
    }

    obtenerResumenKpis(puerto?: string): Observable<any> {
        let params = new HttpParams();
        console.log('Consultando el puerto:', puerto);
        if (puerto) {
            params = params.set('puerto', puerto.toUpperCase());
        }
        const kpis = this.http.get(`${base_url}/torre-control/kpis`, { params });
        return kpis
    }

    obtenerReportes(puerto: string): Observable<any> {
        // 1. Recupera tu token (ajusta el nombre si en tu localStorage se llama diferente)
        const token = this._localStorageService.getTokenLocalStorage();

        // 2. Adjunta el token en los headers exactamente como en Postman
        const headers = new HttpHeaders({
            'x-token': token
        });

        // 3. Envía la petición con params y headers
        return this.http.get(`${base_url}/tclp-dashboard/reportes-operativos`, {
            params: { puerto },
            headers: headers
        }).pipe(
            catchError(err => {
                console.error('Error Reportes:', err);
                return of([]);
            })
        );
    }

    evaluarTerminalIA(terminalId: string): Observable<any> {
        return this.http.get<any>(`${base_url}/ia/dashboard/motonaves-72h`);
    }

    cargarMapaPortuario(): Observable<any> {
        if (this.mapaPortuario.length > 0) return of(this.mapaPortuario); // Cache simple
        return this.http.get(`${base_url}/tclp-dashboard/puertos`).pipe(
            tap((data: any) => {
                console.log('mapa', data);
                this.mapaPortuario = data
            })
        );
    }

    cargarClimaPortuario(puerto: string): Observable<any> {
        // Antes: `${base_url}/tclp-dashboard/canales/${puerto}`
        // AHORA: Apunta a nuestra nueva ruta de Node.js
        return this.http.get(`${base_url}/maritimo/clima/${puerto}`).pipe(
            tap(data => this.climaPortuario = data)
        );
    }

    // obtenerLineUpMaritimo(puerto?: string): Observable<any> {
    //     let params = new HttpParams();
    //     if (puerto) {
    //         // 🚨 CAMBIAMOS 'terminal' POR 'puerto'
    //         params = params.set('puerto', puerto.toUpperCase().trim());
    //     }
    //     return this.http.get(`${base_url}/maritimo/lineup`, { params });
    // }

    obtenerOperacionesSLA(puerto: string): Observable<any> {
        // Antes: usaba HttpParams con '?terminal=X'
        // AHORA: Usa Path Param limpio
        return this.http.get(`${base_url}/maritimo/operaciones/${puerto}`);
    }

    // obtenerOperacionesSLA(terminal?: string): Observable<any> {
    //     let params = new HttpParams();
    //     if (terminal) {
    //         params = params.set('terminal', terminal.toUpperCase().trim());
    //     }
    //     const sla = this.http.get(`${base_url}/maritimo/operaciones`, { params });
    //     return sla
    // }

    obtenerMatrizEficiencias(terminal?: string): Observable<any> {
        let params = new HttpParams();
        if (terminal) {
            params = params.set('terminal', terminal.toUpperCase().trim());
        }
        const eficiencia = this.http.get(`${base_url}/maritimo/matriz`, { params });
        return eficiencia
    }

    obtenerProductividadData(puerto: string): Observable<any> {
        let params = new HttpParams();
        if (puerto) {
            params = params.set('ciudad', puerto.toUpperCase().trim());
        }
        const eficiencia = this.http.get(`${base_url}/tclp-dashboard/productividad-grafica`, { params });
        return eficiencia
    }

    obtenerLineUpMaritimo(puerto: string): Observable<any[]> {
        // Antes: `${base_url}/tclp-dashboard/naves-avisadas`
        // AHORA: Apunta al mock que acabamos de construir
        return this.http.get<any>(`${base_url}/maritimo/lineup/${puerto}`).pipe(
            map(response => {
                // Extraemos el array 'data' de la respuesta estándar del backend QPLUS
                if (response.success && response.data) {
                    return response.data;
                }
                return [];
            })
        );
    }

    // obtenerLineUpMaritimo(puerto: string): Observable<any[]> {
    //     const params = new HttpParams().set('puerto', puerto);

    //     return this.http.get<any>(`${base_url}/tclp-dashboard/naves-avisadas`, { params })
    //         .pipe(
    //             map(response => {
    //                 // Extraemos el array 'data' de la respuesta del backend
    //                 if (response.success && response.data) {
    //                     return response.data;
    //                 }
    //                 return [];
    //             })
    //         );
    // }

    ngOnDestroy() {
        if (this.socketSub) {
            this.socketSub.unsubscribe();
        }
    }
}
