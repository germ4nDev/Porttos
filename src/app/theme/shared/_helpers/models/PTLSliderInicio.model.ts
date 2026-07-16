export class PTLSliderInicioModel {
    constructor(
        public sliderId?: number,
        public codigoSlider?: string,
        public nombreSlider?: string,
        public urlSlider?: string,
        public imageSlider?: string,
        public descripcionSlider?: string,
        public nomEstado?: string,
        public estadoSlider?: boolean,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string
    ) { }
}
