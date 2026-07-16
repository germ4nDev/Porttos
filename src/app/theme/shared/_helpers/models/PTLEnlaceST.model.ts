export class PTLEnlaceSTModel {
    constructor(
        public enlaceId?: number,
        public codigoEnlace?: string,
        public codigoSitio?: string,
        public nombreEnlace?: string,
        public descripcionEnlace?: string,
        public rutaEnlace?: string,
        public estadoEnlace?: boolean,
        public nomEstado?: string,
        public nomSitio?: string,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
