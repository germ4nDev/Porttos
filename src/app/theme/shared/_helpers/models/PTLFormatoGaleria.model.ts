export class PTLFormatoGaleria {
    constructor(
        public formatosGaleriaId?: number,
        public codigoFormato?: string,
        public codigoTipoGaleria?: string,
        public nombreFormato?: string,
        public descripcionFormato?: string,
        public estadoFormato?: boolean,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
