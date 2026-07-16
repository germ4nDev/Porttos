export interface GeoJSONPolygon {
    type: 'Polygon' | 'MultiPolygon';
    // Para Polygon es un array de coordenadas 3D: [[[lon, lat], [lon, lat], ...]]
    coordinates: number[][][] | number[][][][];
}

export class Terminal {
    constructor(
        public id_terminal?: string,
        public id_puerto?: string,
        public puerto?: string,
        public nombre?: string,
        public subtitulo?: string,
        public descripcion?: string,
        public unidad_medida?: string,
        public capacidad_reefer?: string,
        public nomEstado?: string,
        public activo?: boolean,
        public usuario_cargue?: string,
        public fecha_cargue?: string,
    ) { }
}
