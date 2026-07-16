export class PTLUsuarioRoleAPModel {
    constructor(
        public usuarioRoleId?: number,
        public codigoUsuarioRole?: string,
        public codigoUsuarioSC?: string,
        public codigoEmpresaSC?: string,
        public codigoRole?: string,
        public codigoAplicacion?: string,
        public codigoSuite?: string,
        public tipoRol?: string,
        public estadoUsuarioRole?: boolean,
        public checked?: boolean,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
