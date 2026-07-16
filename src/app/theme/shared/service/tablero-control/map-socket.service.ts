import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { SocketService } from './../sockets.service';

@Injectable({
    providedIn: 'root'
})
export class MapSocketService {

    // Usamos BehaviorSubject para que el mapa reaccione inmediatamente
    private maritimoDataSource = new BehaviorSubject<any>({ type: 'FeatureCollection', features: [] });
    public maritimoData$ = this.maritimoDataSource.asObservable();

    // 🟢 Creamos un contenedor de suscripciones para limpiar la memoria al desconectar
    private subs: Subscription = new Subscription();

    // 🟢 1. Inyectamos tu SocketService global en lugar de usar io() directo
    constructor(private socketService: SocketService) {
        // Ya no necesitas inicializar el socket aquí, ngx-socket-io lo maneja globalmente
    }

    public conectarSalaMaritima(): void {
        // 1. Le decimos al backend que nos meta a la sala usando el método emit de tu servicio
        this.socketService.emit('unirse-mapa-maritimo');

        // 2. Escuchamos la foto completa inicial usando .listen() y nos suscribimos
        const subInit = this.socketService.listen('geo-capa-maritima-init').subscribe((geoJsonCompleto: any) => {
            console.log('🗺️ [Socket] Capa inicial recibida:', geoJsonCompleto);
            this.maritimoDataSource.next(geoJsonCompleto);
        });

        // 3. Escuchamos los pequeños movimientos
        const subUpdate = this.socketService.listen('geo-update-maritimo').subscribe((featureActualizado: any) => {
            const stateActual = this.maritimoDataSource.value;
            const index = stateActual.features.findIndex((f: any) => f.properties.mmsi === featureActualizado.properties.mmsi);

            if (index >= 0) {
                stateActual.features[index] = featureActualizado; // Actualiza
            } else {
                stateActual.features.push(featureActualizado); // Agrega si es nuevo
            }

            // Emitimos el nuevo estado al mapa
            this.maritimoDataSource.next({ ...stateActual });
        });

        // 🟢 Guardamos las suscripciones para poder "apagarlas" luego
        this.subs.add(subInit);
        this.subs.add(subUpdate);
    }

    public desconectarSalaMaritima(): void {
        this.socketService.emit('salir-mapa-maritimo');

        // 🟢 En RxJS, el equivalente a socket.off() es simplemente desuscribirse
        this.subs.unsubscribe();

        // Reinstanciamos por si el usuario vuelve a entrar a la sala en la misma sesión
        this.subs = new Subscription();
    }
}
