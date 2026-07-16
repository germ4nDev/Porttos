export class PTLGaleria {
    constructor(
        public galeriaId?: number,
        public codigoGaleria?: string,
        public codigoTipoGaleria?: string,
        public codigoBiblioteca?: string,
        public codigoSuite?: string,
        public codigoModulo?: string,
        public siglaIdioma?: string,
        public codigoFormato?: string,
        public nombreGaleria?: string,
        public descripcionGaleria?: string,
        public fotoGaleria?: string,
        public mediaGaleria?: string,
        public estadoGaleria?: boolean,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
