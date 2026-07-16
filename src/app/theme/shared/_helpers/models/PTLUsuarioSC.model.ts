export class PTLUsuarioSCModel {
    constructor(
        public usuarioId?: number,
        public codigoUsuarioSC?: string,
        public codigoUsuario?: string,
        public codigoSuscriptor?: string,
        public nombreUsuario?: string,
        public nombreSuscriptor?: string,
        public estadoUsuarioSC?: boolean,
        public nomEstado?: string,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
