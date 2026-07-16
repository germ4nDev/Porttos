export class TipoInfraestructura {
    constructor(
        public id_tipo?: number,
        public codigo_tipo?: string,
        public nombre?: string,
        public descripcion?: string,
        public estado?: boolean,
        public nomEstado?: string,
        public usuario_cargue?: string,
        public fecha_cargue?: string,
    ) { }
}
