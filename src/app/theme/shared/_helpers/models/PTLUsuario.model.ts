/* eslint-disable @typescript-eslint/no-explicit-any */
export class PTLUsuarioModel {
    constructor(
        public usuarioId?: number,
        public codigoUsuario?: string,
        public identificacionUsuario?: string,
        public nombreUsuario?: string,
        public correoUsuario?: string,
        public userNameUsuario?: string,
        public claveUsuario?: string,
        public descripcionUsuario?: string,
        public fotoUsuario?: string,
        public usuarioAdministrador?: boolean,
        public estadoUsuario?: boolean,
        public checked?: boolean,
        public nomEstado?: string,
        public claveActual?: string,
        public claveNew?: string,
        public claveConfirm?: string,
        public codigoSuscriptor?: string,
        public codigoEmpresaSC?: string,
        public rolesUsuario?: any,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
