export class PTLSuscriptorModel {
    constructor(
        public suscriptorId?: number,
        public codigoSuscriptor?: string,
        public identificacionSuscriptor?: string,
        public nombreSuscriptor?: string,
        public correoSuscriptor?: string,
        public direccionSuscriptor?: string,
        public telefonoContacto?: string,
        public numeroEmpresas?: number,
        public numeroUsuarios?: number,
        public codigoAdministrador?: string,
        public usuarioAdministrador?: string,
        public claveActual?: string,
        public claveNew?: string,
        public claveConfirm?: string,
        public logoSuscriptor?: string,
        public descripcionSuscriptor?: string,
        public envioCorreosSuscriptor?: boolean,
        public envioMensajesSuscriptor?: boolean,
        public envioPublicidadSuscriptor?: boolean,
        public estadoSuscriptor?: boolean,
        public nomEstado?: string,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
