export interface NodoOperativo {
    id: string;
    nombre: string;
    categoria: 'Terminal' | 'Patio' | 'Bodega' | 'Depot';
    ocupacion: number; // 0-100
    alertas: string[];
    estado: 'success' | 'warning' | 'danger';
}

export interface BuqueMaritimo {
    id: string;
    posicion: { lat: number, lng: number };
    estado: string;
    eta: Date;
}
