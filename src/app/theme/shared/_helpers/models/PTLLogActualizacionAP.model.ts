export class PTLLogActualizacionAP {
    constructor (
        public logId : number,
        public codigoAplicacion : string,
        public codigoVersion : string,
        public descripcionLog : string,
        public fechaLog : Date,
        public usuarioAId : number
    ) {}
}
