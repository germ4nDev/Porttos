export class FaroModel {
    constructor(
        public id_faro?: string,
        public nombre_faro?: string,
        public descripcion?: string,
        public tipo_faro?: string,
        public radio_metros?: boolean,
        public color_ui?: string,
        public metadata_extra?: string,
        public genera_alerta_toast?: boolean,
        public estado?: boolean,
        public geocerca_geo?: any,
        public nomAlerta?: string,
        public nomEstado?: string,
        public nomTipo?: string,
        public activo?: boolean,
        public usuario_cargue?: string,
        public fecha_cargue?: string
    ) { }
}
