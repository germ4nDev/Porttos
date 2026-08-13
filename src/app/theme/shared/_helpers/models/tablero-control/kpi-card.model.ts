export interface KpiCardModel {
    titulo?: string;
    subtitulo?: string;
    valor?: string | number;
    tendencia?: string; // Ej: "+2.5% vs semana anterior"
    icono?: string;     // Clase CSS del icono
    colorBorde?: string;     // Clase CSS del icono
    color?: string;     // Clase CSS del icono
    cargandoIA?: boolean;     // Clase CSS del icono
}
