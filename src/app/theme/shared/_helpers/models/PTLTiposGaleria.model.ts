export class PTLTiposGaleria {
    constructor(
        public tipoId?: number,
        public codigoTipoGaleria?: string,
        public nombreTipo?: string,
        public descripcionTipo?: string,
        public estadoTipo?: boolean,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
