export class Widget {
    constructor(
        public id?: number,
        public codigo_widget?: string,
        public nombre?: string,
        public descripcion?: string,
        public pestana?: string,
        public categoria?: string,
        public componente_angular?: string,
        public cols_defecto?: number,
        public rows_defecto?: number,
        public thumbnail_url?: string,
        public imagen?: string,
        public captura?: string,
        public nomEstado?: string,
        public activo?: boolean,
        public usuario_cargue?: string,
        public fecha_cargue?: string,
    ) { }
}
