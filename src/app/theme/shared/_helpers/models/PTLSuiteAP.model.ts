export class PTLSuiteAPModel {
    constructor(
        public suiteId?: number,
        public codigoSuite?: string,
        public codigoAplicacion?: string,
        public nombreSuite?: string,
        public descripcionSuite?: string,
        public nomEstado?: string,
        public nomAplicacion?: string,
        public rutaInicio?: string,
        public translateKey?: string,
        public imagenInicio?: string,
        public estadoSuite?: boolean,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
