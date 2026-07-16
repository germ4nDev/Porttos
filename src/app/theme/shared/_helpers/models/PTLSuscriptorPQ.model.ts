export class PTLSuscriptorPQ {
    constructor(
        public suscriptoPaqueteId?: number,
        public codigoSuscriptorPaquete?: string,
        public codigoSuscriptor?: string,
        public codigoPaquete?: string,
        public fechaInicio?: string,
        public fechaVencimiento?: string,
        public cdigoLicencia?: string,
        public conexionId?: number,
        public estadoLicencia?: boolean,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
