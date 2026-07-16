export class PTLItems {
    constructor(
        public itemId?: number,
        public codigoItem?: string,
        public codigoTipoItem?: string,
        public nombreItem?: string,
        public valorUnitario?: number,
        public costoItem?: number,
        public descripcionItem?: string,
        public estadoItem?: boolean,
        public checked?: boolean,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
