export interface GeoJSONPolygon {
    type: 'Polygon' | 'MultiPolygon';
    // Para Polygon es un array de coordenadas 3D: [[[lon, lat], [lon, lat], ...]]
    coordinates: number[][][] | number[][][][];
}

export class Infraestructura {
    constructor(
        public id_infraestructura?: string,
        public id_terminal?: string,
        public id_tipo?: number,
        public tipo?: string,
        public nombre?: string,
        public ubicacion_geo?: any,
        public geocerca_geo?: any,
        public puerto_geocerca_wkt?: string,
        public color_ui?: string,
        public descripcion?: string,
        public estado?: boolean,
        public nomEstado?: string,
        public terminal?: string,
        public usuario_cargue?: string,
        public fecha_cargue?: string,
    ) { }
}
