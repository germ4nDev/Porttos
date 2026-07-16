export class PTLLcenciaST {
    constructor(
        public licenciaId: number,
        public codigoLicencia: string,
        public codigoSuscriptor: string,
        public codigoPaquete: string,
        public nombreLicencia: string,
        public descripcionLicencia: string,
        public estadoLicencia: boolean,
        public fechaVencimiento: Date,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
