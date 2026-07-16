/*
  Author: German Valencia
  Service: Dashboard State Management - TCL Multi-Agent
*/
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { SocketService } from '../sockets.service';
import { environment } from '../../../../../environments/environment';
const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class DashboardStateService {
    // 1. CONTEXTO GLOBAL: El puerto que el usuario está mirando actualmente
    private puertoContextoSubject = new BehaviorSubject<string>('BVENTURA');
    public puertoContexto$ = this.puertoContextoSubject.asObservable();

    // 2. Definición de los BehaviorSubjects (Último estado conocido de los datos)
    private maritimoSubject = new BehaviorSubject<any>(null);
    private gateSubject = new BehaviorSubject<any>(null);
    private rndcSubject = new BehaviorSubject<any>(null);

    // Exposición como Observables limpios para los componentes
    maritimo$ = this.maritimoSubject.asObservable();
    gate$ = this.gateSubject.asObservable();
    rndc$ = this.rndcSubject.asObservable();

    private socketSub!: Subscription;

    constructor(
        private http: HttpClient,
        private socketService: SocketService
    ) {
        this.inicializarSuscripcionSockets();
    }

    // ==========================================
    // ESTE ES EL MÉTODO QUE FALTABA
    // ==========================================
    /**
     * Actualiza el puerto a nivel global. Todos los componentes suscritos
     * a puertoContexto$ se enterarán al instante.
     */
    actualizarPuertoContexto(nuevoPuertoId: string): void {
        console.log(`🌍 Contexto de Torre de Control cambiado a: ${nuevoPuertoId}`);
        this.puertoContextoSubject.next(nuevoPuertoId);
    }

    /**
     * Escucha en tiempo real si la IA procesó un nuevo documento
     */
    private inicializarSuscripcionSockets() {
        this.socketSub = this.socketService.listen<any>('tablero_actualizado')
            .subscribe(event => {
                console.log(`🤖 Alerta TCL: ${event.mensaje}`);

                if (event.tipo === 'BOLETIN_PORTUARIO') {
                    this.maritimoSubject.next(event.data);
                } else if (event.tipo === 'RNDC_EXCEL') {
                    this.rndcSubject.next(event.data);
                }
            });
    }

    /**
     * Carga bajo demanda (Fetch on demand) cuando el usuario entra a una pestaña
     */
    cargarDatosPestaña(puertoId: string, tipoPanel: 'operaciones' | 'rndc-analytics') {
        const url = `${environment.apiUrl}/api/tcl/puerto/${puertoId}/${tipoPanel}`;

        this.http.get<any>(url).subscribe({
            next: (res) => {
                if (res.ok) {
                    if (tipoPanel === 'operaciones') {
                        this.maritimoSubject.next(res.data);
                        this.gateSubject.next(res.data);
                    } else if (tipoPanel === 'rndc-analytics') {
                        this.rndcSubject.next(res.data);
                    }
                }
            },
            error: (err) => console.error(`Error cargando panel ${tipoPanel}:`, err)
        });
    }

    desconectarSockets() {
        if (this.socketSub) this.socketSub.unsubscribe();
    }
}
