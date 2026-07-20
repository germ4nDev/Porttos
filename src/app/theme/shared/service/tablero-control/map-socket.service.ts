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

        const subInit = this.socketService.listen('geo-capa-maritima-init').subscribe((geoJson: any) => {
            // FILTRO DE SEGURIDAD: Eliminamos barcos en África (0,0)
            if (geoJson && geoJson.features) {
                geoJson.features = geoJson.features.filter((f: any) =>
                    f.geometry.coordinates[0] !== 0 && f.geometry.coordinates[1] !== 0
                );
            }
            console.log('🗺️ [Socket] Capa filtrada recibida:', geoJson);
            this.maritimoDataSource.next(geoJson);
        });

        // 3. Escuchamos los pequeños movimientos (y filtramos aquí también)
        const subUpdate = this.socketService.listen('geo-update-maritimo').subscribe((feature: any) => {
            const [lon, lat] = feature.geometry.coordinates;

            // Si el update viene con 0,0, lo ignoramos
            if (lat === 0 && lon === 0) return;

            const stateActual = this.maritimoDataSource.value;
            // ... (resto de tu lógica de actualización)
        });

        this.subs.add(subInit);
        this.subs.add(subUpdate);

        // 2. Escuchamos la foto completa inicial usando .listen() y nos suscribimos
        // const subInit = this.socketService.listen('geo-capa-maritima-init').subscribe((geoJsonCompleto: any) => {
        //     console.log('🗺️ [Socket] Capa inicial recibida:', geoJsonCompleto);
        //     this.maritimoDataSource.next(geoJsonCompleto);
        // });

        // // 3. Escuchamos los pequeños movimientos
        // const subUpdate = this.socketService.listen('geo-update-maritimo').subscribe((featureActualizado: any) => {
        //     const stateActual = this.maritimoDataSource.value;
        //     const index = stateActual.features.findIndex((f: any) => f.properties.mmsi === featureActualizado.properties.mmsi);

        //     if (index >= 0) {
        //         stateActual.features[index] = featureActualizado; // Actualiza
        //     } else {
        //         stateActual.features.push(featureActualizado); // Agrega si es nuevo
        //     }

        //     // Emitimos el nuevo estado al mapa
        //     this.maritimoDataSource.next({ ...stateActual });
        // });

        // // 🟢 Guardamos las suscripciones para poder "apagarlas" luego
        // this.subs.add(subInit);
        // this.subs.add(subUpdate);
    }

    public desconectarSalaMaritima(): void {
        this.socketService.emit('salir-mapa-maritimo');

        // 🟢 En RxJS, el equivalente a socket.off() es simplemente desuscribirse
        this.subs.unsubscribe();

        // Reinstanciamos por si el usuario vuelve a entrar a la sala en la misma sesión
        this.subs = new Subscription();
    }
}
