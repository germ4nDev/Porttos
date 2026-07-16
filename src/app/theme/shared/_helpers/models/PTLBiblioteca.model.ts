export class PTLBiblioteca {
    constructor(
        public bibliotecaId?: number,
        public codigoBiblioteca?: string,
        public codigoAplicacion?: string,
        public codigoSuite?: string,
        public codigoModulo?: string,
        public nombreBiblioteca?: string,
        public descripcionBiblioteca?: string,
        public imagenBiblioteca?: string,
        public estadoBiblioteca?: boolean,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
