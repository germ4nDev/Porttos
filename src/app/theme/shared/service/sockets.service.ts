// /*
//     Author: German Valencia
//     Refactored for: QPLUS Architecture & TCL Multi-Agent
// */
// import { Injectable } from '@angular/core';
// import { Observable, BehaviorSubject } from 'rxjs';
// import { Socket } from 'ngx-socket-io';

// @Injectable({
//     providedIn: 'root'
// })
// export class SocketService {
//     // Estado reactivo para que el Dashboard pueda mostrar un indicador de "Online/Offline"
//     private connectedSubject = new BehaviorSubject<boolean>(false);
//     public connected$ = this.connectedSubject.asObservable();

//     constructor(private socket: Socket) {
//         console.log('🔌 SocketService inicializado.');

//         this.socket.on('connect', () => {
//             console.log('✅ Socket.IO conectado al servidor.');
//             this.connectedSubject.next(true);
//         });

//         this.socket.on('disconnect', () => {
//             console.warn('❌ Socket.IO desconectado.');
//             this.connectedSubject.next(false);
//         });

//         // Intercepción de errores para evitar que la plataforma falle silenciosamente
//         this.socket.on('connect_error', (error: any) => {
//             console.error('⚠️ Error de conexión Socket.IO:', error);
//             this.connectedSubject.next(false);
//         });
//     }

//     /**
//          * Escucha un evento del servidor.
//          * Se usa <T = any> para no romper el código legado de la plataforma.
//          */
//     public fromEvent<T = any>(eventName: string): Observable<T> {
//         return this.socket.fromEvent<T>(eventName);
//     }

//     /**
//      * Alias por compatibilidad con tu código existente
//      */
//     public listen<T = any>(eventName: string): Observable<T> {
//         return this.fromEvent<T>(eventName);
//     }

//     /**
//      * Emite un evento hacia el servidor.
//      */
//     public emit(eventName: string, data?: any): void {
//         this.socket.emit(eventName, data);
//     }

//     /**
//      * Fuerza la desconexión manual (útil si el usuario cierra sesión o cambia de módulo)
//      */
//     public disconnect(): void {
//         this.socket.disconnect();
//     }
// }
/*
    Author: German Valencia
    Refactored for: QPLUS Architecture & TCL Multi-Agent
*/
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Socket } from 'ngx-socket-io';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    // Estado reactivo para que el Dashboard pueda mostrar un indicador de "Online/Offline"
    private connectedSubject = new BehaviorSubject<boolean>(false);
    public connected$ = this.connectedSubject.asObservable();

    constructor(private socket: Socket) {
        console.log('🔌 SocketService inicializado.');

        // 🟢 AJUSTE: Usar fromEvent().subscribe() nativo de ngx-socket-io
        this.socket.fromEvent('connect').subscribe(() => {
            console.log('✅ Socket.IO conectado al servidor.');
            this.connectedSubject.next(true);
        });

        this.socket.fromEvent('disconnect').subscribe(() => {
            console.warn('❌ Socket.IO desconectado.');
            this.connectedSubject.next(false);
        });

        // Intercepción de errores para evitar que la plataforma falle silenciosamente
        this.socket.fromEvent('connect_error').subscribe((error: any) => {
            console.error('⚠️ Error de conexión Socket.IO:', error);
            this.connectedSubject.next(false);
        });
    }

    /**
     * Escucha un evento del servidor.
     * Se usa <T = any> para no romper el código legado de la plataforma.
     */
    public fromEvent<T = any>(eventName: string): Observable<T> {
        return this.socket.fromEvent<T>(eventName);
    }

    /**
     * Alias por compatibilidad con tu código existente
     */
    public listen<T = any>(eventName: string): Observable<T> {
        return this.fromEvent<T>(eventName);
    }

    /**
     * Emite un evento hacia el servidor.
     */
    public emit(eventName: string, data?: any): void {
        this.socket.emit(eventName, data);
    }

    /**
     * Fuerza la desconexión manual (útil si el usuario cierra sesión o cambia de módulo)
     */
    public disconnect(): void {
        this.socket.disconnect();
    }
}
