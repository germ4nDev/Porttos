/*
    Autor: Juan Valencia
*/

export class PTLScriptsModel {
    constructor(
        public scriptId?: number,
        public codigoScript?: string,
        public codigoTipoScript?: string,
        public codigoAplicacion?: string,
        public nombreScript?: string,
        public descripcionScript?: string,
        public rutaArchivo?: string,
        public estadoScript?: boolean,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
