export class PTLPaqueteModel {
    constructor(
        public paqueteId?: number,
        public codigoPaquete?: string,
        public nombrePaquete?: string,
        public descripcionPaquete?: string,
        public acuerdoLicencia?: string,
        public imagenPaquete?: string,
        public iconoPaquete?: string,
        public colorPaquete?: string,
        public nomEstado?: string,
        public nomPromocion?: string,
        public costoPaquete?: number,
        public precioPaquete?: number,
        public promocion?: boolean,
        public precioPromocion?: number,
        public estadoPaquete?: boolean,
        public itemsPaquete?: any,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
