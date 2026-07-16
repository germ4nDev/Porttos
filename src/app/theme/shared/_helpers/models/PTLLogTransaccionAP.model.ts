export class PTLLogTransaccionAP {
    constructor (
        public logId? : number,
        public codigoAplicacin? : string,
        public codigoSuite? : string,
        public codigoModulo? : string,
        public fechaLog? : Date,
        public descripcionLg? : string,
        public codigoErrr? : number,
        public usuarioId?: number
   ) {}
}
