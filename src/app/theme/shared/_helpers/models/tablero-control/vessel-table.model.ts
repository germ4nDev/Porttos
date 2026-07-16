export interface Motonave {
    motonave: string;
    naviera: string;
    lineaAgencia: string;
    terminal: string;
    eta: string;
    ata: string;
    fechaAtraque: string;     // Añadido para el HTML
    carga: string;
    trabajoOperacion: string; // Añadido para el HTML
    posicion: string;         // Añadido para el HTML
    estadoTexto: string;      // Añadido para el HTML
    estadoClase: string;
    puerto: string;
}

export interface VesselTableModel {
    titulo: string;
    subtitulo: string;
    icono: string;
    cargandoIA: boolean;
    motonaves: Motonave[];
}
