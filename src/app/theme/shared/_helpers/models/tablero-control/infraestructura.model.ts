export interface GeoJSONPolygon {
    type: 'Polygon' | 'MultiPolygon';
    // Para Polygon es un array de coordenadas 3D: [[[lon, lat], [lon, lat], ...]]
    coordinates: number[][][] | number[][][][];
}

export class Infraestructura {
    constructor(
        public id_infraestructura?: string,
        public id_terminal?: string,
        public tipo?: string,
        public nombre?: string,
        public latitud?: number,
        public longitud?: number,
        public geocerca_bounding_box?: GeoJSONPolygon,
        public terminal?: string,
        public usuario_cargue?: string,
        public fecha_cargue?: string,
    ) { }
}
