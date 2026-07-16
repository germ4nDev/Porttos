// productividad.adapter.ts (Angular)
import { Injectable } from '@angular/core';
import { DashboardService } from '../service/tablero-control/dashboard.service';

@Injectable({ providedIn: 'root' })
export class ProductividadGraficaAdapter {

    // Diccionario para traducir el ID numérico de tu base de datos al nombre visual
    constructor(
        private dashboardService: DashboardService
    ) { }

    /**
     * Transforma la respuesta del Backend (Mock/TOS) al formato estricto de Chart.js
     * @param datosCrudos Array de resultados (ej. [{ id_puerto_terminal: 'TCBUEN', h_06: 45, ... }])
     * @param ciudadFiltro Ciudad seleccionada en el tablero (ej. 'BUENAVENTURA', 'SANTA MARTA')
     */
    public transformParaChartJS(datosCrudos: any[], ciudadFiltro: string): any {

        if (!datosCrudos || datosCrudos.length === 0) {
            return { labels: [], datasets: [] };
        }

        // Las llaves que nos envía el backend de Node.js
        const llavesHoras = ['h_06', 'h_08', 'h_10', 'h_12', 'h_14', 'h_16', 'h_18', 'h_20'];

        // Las etiquetas visuales para el eje X de la gráfica
        const etiquetasEjeX = ['06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h'];

        // Paleta de colores QPLUS con opacidad para el sombreado inferior (fill)
        const paletaColores = [
            { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' }, // Morado (TCBUEN / CONTECAR)
            { border: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.15)' }, // Cyan (SPRBUN / SPRC)
            { border: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }, // Verde (Aguadulce / Santa Marta)
            { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' }, // Amarillo
            { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },  // Rojo
            { border: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' }  // Rosa
        ];

        // Construcción dinámica de los datasets para Chart.js
        const datasets = datosCrudos.map((filaBD, index) => {

            // 1. Buscamos el nombre comercial en el MAPA_PORTUARIO
            const nombreTerminal = this.obtenerNombreTerminal(filaBD.id_puerto_terminal, ciudadFiltro);

            // 2. Asignamos un color de la paleta cíclicamente
            const color = paletaColores[index % paletaColores.length];

            // 3. Extraemos los valores por hora
            const datosLinea = llavesHoras.map(llave => {
                const valor = filaBD[llave];
                return valor ? parseFloat(valor) : 0;
            });

            // 4. Retornamos la configuración individual de la línea
            return {
                label: nombreTerminal,
                data: datosLinea,
                borderColor: color.border,
                backgroundColor: color.bg,
                fill: true,             // Habilita el sombreado
                borderWidth: 3,         // Grosor de la curva
                tension: 0.4,           // Suavizado de la línea (Smooth)
                pointRadius: 4,         // Tamaño del punto
                pointHoverRadius: 6,    // Tamaño del punto al interactuar
                pointBackgroundColor: color.border
            };
        });

        return {
            labels: etiquetasEjeX,
            datasets: datasets
        };
    }

    /**
     * Busca el nombre real de la terminal navegando por la estructura del MAPA_PORTUARIO.
     * Soporta nombres de ciudad con espacios (ej. "SANTA MARTA" -> "SANTA_MARTA").
     */
    private obtenerNombreTerminal(idTerminalKey: string, ciudad: string): string {
        // 1. Casteamos el objeto como un diccionario indexable por strings
        const mapaPortuario = this.dashboardService.mapaPortuario as Record<string, any>;

        if (!mapaPortuario) return idTerminalKey;

        const ciudadKey = ciudad ? ciudad.toUpperCase().replace(' ', '_') : 'BUENAVENTURA';

        // TypeScript ya no se quejará aquí
        const nodoCiudad = mapaPortuario[ciudadKey];

        // Navegamos de forma segura por la infraestructura de la ciudad
        if (nodoCiudad && nodoCiudad.infraestructura && nodoCiudad.infraestructura[idTerminalKey]) {
            return nodoCiudad.infraestructura[idTerminalKey].nombre;
        }

        return idTerminalKey;
    }
}
