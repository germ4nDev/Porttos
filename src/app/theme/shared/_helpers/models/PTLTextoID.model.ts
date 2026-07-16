export class PTLTextoID {
    constructor(
        public textoId: number,
        public codigoTexto: string,
        public codigoIdioma: string,
        public anclaTexto: string,
        public textoValor: string,
        public estadoTexto: boolean,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
