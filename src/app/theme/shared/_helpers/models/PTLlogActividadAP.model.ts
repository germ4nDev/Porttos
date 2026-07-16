export class PTLLogActividadAPModel {
    constructor(
        public logId?: number,
        public codigoAplicacion?: string,
        public codigoSuite?: string,
        public codigoModulo?: string,
        public codigoSuscriptor?: string,
        public codigoTipoLog?: string,
        public fechaLog?: string,
        public descripcionLog?: string,
        public codigoRespuesta?: string,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
    ) { }
}
