export class LayoutModel {
    constructor(
        public id?: number,
        public codigo_usuario?: string,
        public codigo_widget?: string,
        public codigoDashboard?: string,
        public pos_x?: number,
        public pos_y?: number,
        public cols?: number,
        public rows?: number,
        public instancia?: string,
        public visible?: boolean,
        public usuario_cargue?: string,
        public fecha_cargue?: string,
    ) { }
}
