import { Injectable } from '@angular/core';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service'; // Asegúrate de que esta ruta sea la correcta

@Injectable({
    providedIn: 'root'
})
export class ProductividadGraficaAdapter {

    constructor(
        private dashboardService: DashboardService
    ) { }

    /**
     * Transforma la respuesta de la base de datos al formato estricto de Chart.js
     * @param datosCrudos Array de resultados de SQL (ej. [{ id_puerto_terminal: 1, h_06: 45, ... }])
     * @param ciudadFiltro Ciudad seleccionada actualmente en el tablero (ej. 'BUENAVENTURA')
     */
    public transformParaChartJS(datosCrudos: any[], ciudadFiltro: string): any {

        // Validación de seguridad por si la API no devuelve datos
        if (!datosCrudos || datosCrudos.length === 0) {
            return { labels: [], datasets: [] };
        }

        // Las llaves exactas que arroja la consulta SQL de la Matriz de Operaciones
        const llavesHoras = ['h_06', 'h_08', 'h_10', 'h_12', 'h_14', 'h_16', 'h_18', 'h_20'];

        // Las etiquetas que se pintarán en el eje X de la gráfica
        const etiquetasEjeX = ['06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h'];

        // Paleta de colores QPLUS con opacidad para el efecto sombreado inferior
        const paletaColores = [
            { border: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.15)' }, // Cyan
            { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' }, // Morado
            { border: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)' }, // Verde agua
            { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' }, // Amarillo
            { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' }   // Rojo
        ];

        // Construcción dinámica de los datasets (una línea por cada terminal)
        const datasets = datosCrudos.map((filaBD, index) => {

            // 1. Obtenemos el nombre real cruzando el ID con el mapa del DashboardService
            const nombreTerminal = this.obtenerNombreTerminal(filaBD.id_puerto_terminal, ciudadFiltro);

            // 2. Asignamos un color de la paleta
            const color = paletaColores[index % paletaColores.length];

            // 3. Extraemos los valores de las horas y los aseguramos como números flotantes
            const datosLinea = llavesHoras.map(llave => {
                const valor = filaBD[llave];
                return valor ? parseFloat(valor) : 0;
            });

            // 4. Retornamos el objeto de configuración individual de esta línea para Chart.js
            return {
                label: nombreTerminal,
                data: datosLinea,
                borderColor: color.border,
                backgroundColor: color.bg,
                fill: true,             // Habilita el color de fondo semitransparente
                borderWidth: 3,         // Grosor de la línea
                tension: 0.4,           // Hace que la línea sea curva (Smooth) en lugar de recta
                pointRadius: 4,         // Tamaño del punto normal
                pointHoverRadius: 6,    // Tamaño del punto al pasar el mouse
                pointBackgroundColor: color.border // Color interior del punto
            };
        });

        // Retornamos la estructura final que espera el [data]="chartData" en el HTML
        return {
            labels: etiquetasEjeX,
            datasets: datasets
        };
    }

    /**
     * Busca el nombre real de la terminal en el mapa portuario del DashboardService.
     */
    private obtenerNombreTerminal(idBD: number, ciudad: string): string {
        // Accedemos a la variable pública donde tienes cargado el mapa en el servicio
        const mapaPortuario = this.dashboardService.mapaPortuario;

        if (!mapaPortuario) return `Terminal ${idBD}`;

        // Asumiendo que el mapa portuario está indexado por ciudad (ej. mapaPortuario['BUENAVENTURA'])
        // Forzamos a mayúsculas para evitar errores tipográficos
        const ciudadKey = ciudad ? ciudad.toUpperCase() : 'BUENAVENTURA';
        const terminalesDeCiudad = mapaPortuario[ciudadKey].infraestructura || [];

        // Buscamos la coincidencia (probamos varias convenciones comunes de ID)
        const terminalEncontrada = terminalesDeCiudad.find((t: any) =>
            t.id === idBD ||
            t.idPuertoTerminal === idBD ||
            t.id_puerto_terminal === idBD
        );

        // Si existe en el mapa, devolvemos su nombre comercial. Si no, un texto genérico.
        return terminalEncontrada ? terminalEncontrada.nombre : `Terminal ${idBD}`;
    }
}
