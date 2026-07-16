
export class Puerto {
    constructor(
        public id_puerto?: string,
        public nombre?: string,
        public region?: string,
        public descripcion?: string,
        public estado?: boolean,
        public url_fuente_scraping?: string,

        // Nuevas propiedades espaciales
        public ubicacion_geo?: any,
        public geocerca_geo?: any,
        public puerto_geocerca_wkt?: string,
        public nomEstado?: string,
        public activo?: boolean,

        public usuario_cargue?: string,
        public fecha_cargue?: string
    ) { }
}
