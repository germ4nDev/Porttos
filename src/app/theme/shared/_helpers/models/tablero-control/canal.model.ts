/**
 * Modelo de datos estricto para el Widget de Condiciones del Canal.
 * Esto asegura que el componente visual no reciba datos indefinidos.
 */
export interface CanalModel {
    titulo: string;          // Cambiado de 'mareaActual' a 'marea'
    subtitulo: string;          // Cambiado de 'mareaActual' a 'marea'
    marea: string;          // Cambiado de 'mareaActual' a 'marea'
    visibilidad: string;
    viento: string;
    estadoCanal: string;    // Cambiado de 'estado' a 'estadoCanal'
    claseEstado: string;    // Añadido para el [ngClass]
    pilotaje: string;       // Añadido
    pleamar: string;
}
