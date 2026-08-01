// export interface RegistroCrondd {
//     id: number;
//     nombre_proceso: string;
//     estado: 'EXITO' | 'ERROR' | 'EN_PROCESO';
//     fecha_ejecucion: string;
//     duracion_ms: number;
//     registros_procesados: number;
//     mensaje_error: string | null;
// }

export class RegistroCron {
    constructor(
        public id?: number,
        public nombre_proceso?: string,
        public estado?: 'EXITO' | 'ERROR' | 'EN_PROCESO',
        public fecha_ejecucion?: string,
        public duracion_ms?: number,
        public registros_procesados?: number,
        public mensaje_error?: string
    ) { }
}
