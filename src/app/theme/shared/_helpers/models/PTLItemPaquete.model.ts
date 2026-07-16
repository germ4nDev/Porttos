export class PTLItemPaquete {
    constructor(
        public itemId?: number,
        public codigoItemPaquete?: string,
        public codigoItem?: string,
        public codigoPaquete?: string,
        public codigoValor?: string,
        public nombreItem?: string,
        public descripcionItem?: string,
        public cantidad?: number,
        public valorUnitario?: number,
        public valorTotal?: number,
        public valoresAdicionales?: number,
        public estadoItem?: boolean,
        public tipoValorId?: number,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
