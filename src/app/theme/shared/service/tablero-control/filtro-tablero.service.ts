import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Puerto } from '../../_helpers/models/tablero-control/puerto.model';

@Injectable({
    providedIn: 'root'
})
export class FiltroTableroService {

    // 1. Definimos el estado inicial privado.
    // Iniciamos por defecto en 'BUENAVENTURA' para que el tablero no cargue vacío.
    private ciudadSubject = new BehaviorSubject<string>('BUENAVENTURA');

    // 2. Exponemos el observable público (sin el 'Subject') para que nadie
    // pueda modificarlo desde afuera, solo suscribirse.
    public ciudad$: Observable<string> = this.ciudadSubject.asObservable();
    constructor() { }

    /**
     * Actualiza la ciudad seleccionada a nivel global.
     * Este método será invocado por el componente del Selector/Header del tablero.
     * @param nuevaCiudad Nombre del nodo portuario (ej. 'BUENAVENTURA', 'CARTAGENA', 'SANTA MARTA')
     */

    public cambiarCiudad(nuevaCiudad: string): void {
        if (nuevaCiudad && nuevaCiudad !== this.ciudadSubject.getValue()) {
            console.log('🌐 FiltroTableroService: Cambiando puerto a', nuevaCiudad);
            this.ciudadSubject.next(nuevaCiudad);
        }
    }

    /**
     * Método getter para obtener la ciudad actual en cualquier momento sin suscribirse
     */
    public getCiudadActual(): string {
        return this.ciudadSubject.getValue();
    }

    /**
     * Método de lectura síncrona instantánea.
     * Útil si algún componente o guarda de ruta necesita saber la ciudad activa
     * en un momento exacto sin abrir una suscripción formal a largo plazo.
     */
    public obtenerCiudadActual(): string {
        return this.ciudadSubject.value;
    }
}
