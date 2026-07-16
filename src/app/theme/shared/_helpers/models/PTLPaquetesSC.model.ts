export class PTLPaquetesSCModel {
    constructor(
        public suscriptorPaqueteId?: number,
        public codigoSuscriptor?: string,
        public codigoPaquete?: string,
        public codigoLicencia?: string,
        public nombrePaquete?: string,
        public fechaInicio?: Date,
        public fechaVencimiento?: Date,
        public estadoLicencia?: boolean,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
