/*
    Autor: Juan Valencia
*/

export class PTLTiposScriptsModel {
    constructor(
        public tipoScriptId?: number,
        public codigoTipoScript?: string,
        public nombreTipo?: string,
        public descripcionTipo?: string,
        public estadoTipo?: boolean,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
