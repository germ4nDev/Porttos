export class PTLTiposEstadosModel {
    constructor(
        public tipoEstadoId?: number,
        public codigoTipoEstado?: string,
        public nombreTipo?: string,
        public descripcionEstado?: string,
        public estado?: boolean,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
