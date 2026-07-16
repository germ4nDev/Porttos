/**
 * Contrato base para todos los adaptadores de widgets.
 * T: El tipo de modelo que el widget espera recibir.
 */
export interface IBaseAdapter<T> {
    // Añadimos 'params' opcional para pasar filtros desde el orquestador
    transform(data: any, params?: any): T;
}
