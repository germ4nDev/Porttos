/* eslint-disable @typescript-eslint/no-explicit-any */
export class PTLActividadRoleModel {
    constructor(
        public actividadRoleId?: number,
        public codigoActividadRole?: string,
        public codigoActividad?: string,
        public codigoRole?: string,
        public permiso?: boolean,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string,
        public nomEstado?: string,
    ) { }
}
