export interface WidgetInstance {
    id: string;          // Identificador único (ej: 'resumen-maritimo-01')
    type: string;        // El tipo de widget (ej: 'RESUMEN_MARITIMO')
    active: boolean;     // ¿El usuario lo quiere ver?
    position: { x: number, y: number, cols: number, rows: number }; // Para Gridster
    config: any;         // Configuración extra si el widget lo requiere
}
