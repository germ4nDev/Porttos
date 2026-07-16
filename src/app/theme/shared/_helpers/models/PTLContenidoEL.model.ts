export class PTLContenidoELModel {
    constructor(
        public contenidoId?: number,
        public codigoContenido?: string,
        public codigoEnlace?: string,
        public nombreContenido?: string,
        public descripcionContenido?: string,
        public contenido?: string,
        public estadoContenido?: boolean,
        public nomEstado?: string,
        public nomEnlace?: string,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
