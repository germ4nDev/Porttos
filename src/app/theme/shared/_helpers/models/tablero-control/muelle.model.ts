export interface GeoJSONPolygon {
    type: 'Polygon' | 'MultiPolygon';
    // Para Polygon es un array de coordenadas 3D: [[[lon, lat], [lon, lat], ...]]
    coordinates: number[][][] | number[][][][];
}

export class Muelle {
    constructor(
        public id_interno?: string,
        public id_terminal?: string,
        public codigo_muelle?: string,
        public db_id_origen?: string,
        public especialidad?: string,
        public calado_metros?: number,
        public capacidad_reefer?: string,
        public estado_mantenimiento?: boolean,
        public geocerca?: GeoJSONPolygon,
        public nomEstado?: string,
        public puerto?: string,
        public terminal?: string,
        public activo?: boolean,
        public usuario_cargue?: string,
        public fecha_cargue?: string,
    ) { }
}
