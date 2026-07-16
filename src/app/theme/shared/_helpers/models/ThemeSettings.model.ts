/* eslint-disable @typescript-eslint/no-explicit-any */
export class ThemeSettingsModel {
    constructor(
        public isDarkTheme: boolean,
        public navbarColor: string,
        public iconosColor: string,
        public buttonsHoverColor: string,
        public codigoUsuarioCreacion?: string,
        public fechaCreacion?: string,
        public codigoUsuarioModificacion?: string,
        public fechaModificacion?: string,
        public textoColor?: string
    ) { }
}
