/**
 * Modelo de datos estricto para el Widget de Condiciones del Canal.
 * Esto asegura que el componente visual no reciba datos indefinidos.
 */
export interface KpiSemanelModel {
    titulo: string;          // Cambiado de 'mareaActual' a 'marea'
    label: string;          // Cambiado de 'mareaActual' a 'marea'
    claseTendencia: string;          // Cambiado de 'mareaActual' a 'marea'
    marea: string;          // Cambiado de 'mareaActual' a 'marea'
    tendencia: string;
    valor: string;
}
