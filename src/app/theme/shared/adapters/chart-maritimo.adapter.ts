import { IBaseAdapter } from './base.adapter';

export class ChartMaritimoAdapter implements IBaseAdapter<any> {

    transform(rawData: any, params: { tipo: string, puerto: string, mapa: any[] }): any {
        const puertoFiltro = params.puerto || 'TODOS';
        const mapaApi = params.mapa || [];
        const arrayNaves = rawData.listado || rawData.motonaves || [];

        // 1. FILTRADO INTELIGENTE (La misma regla de oro de la tabla)
        const navesFiltradas = arrayNaves.filter((nave: any) => {
            if (puertoFiltro === 'TODOS') return true;

            const puertoNave = (nave.puerto || '').toUpperCase().trim();
            const terminalNave = (nave.terminal || '').toUpperCase().trim();

            if (puertoNave && puertoNave === puertoFiltro) return true;

            if (mapaApi.length > 0) {
                return mapaApi.some((p: any) =>
                    (p.nombre || '').toUpperCase().trim() === puertoFiltro &&
                    (p.terminales || []).some((term: string) => terminalNave.includes(term.toUpperCase().trim()))
                );
            }
            return false;
        });

        // 2. TRANSFORMACIÓN SEGÚN EL TIPO DE GRÁFICA
        switch (params.tipo) {

            case 'ETA_ATA':
                // PASAMOS navesFiltradas para que respete el puerto seleccionado
                return this._procesarEtaAta(navesFiltradas);

            case 'TONELADAS':
                const barcosValidos = navesFiltradas.filter((b: any) =>
                    !!b.trabajoOperacion && typeof b.trabajoOperacion === 'string'
                );

                const estructuraApilada = barcosValidos.reduce((acc: any, n: any) => {
                    const terminal = n.terminal || 'DESCONOCIDO';
                    const partes = n.trabajoOperacion.split('-');
                    const tipoCarga = partes.length > 1 ? partes.pop()!.trim() : 'OTRO';

                    // Extraemos el número usando Regex
                    const match = n.trabajoOperacion.match(/(\d+(?:\.\d+)?)/);
                    const valor = match ? parseFloat(match[1]) : 0;

                    if (!acc[terminal]) acc[terminal] = {};
                    acc[terminal][tipoCarga] = (acc[terminal][tipoCarga] || 0) + valor;
                    return acc;
                }, {});

                const labels = Object.keys(estructuraApilada);
                const tiposUnicos = Array.from(new Set(barcosValidos.map((b: any) =>
                    b.trabajoOperacion.split('-').pop()!.trim()
                )));

                const datasets = tiposUnicos.map((tipo: any) => ({
                    label: tipo,
                    data: labels.map((term: string) => estructuraApilada[term]?.[tipo as string] || 0)
                }));

                return { labels, datasets };

            default:
                return { labels: [], datasets: [] };
        }
    }

    private _procesarEtaAta(lineUp: any[]): any {
        // 1. Agrupar datos por terminal
        const terminalesData: { [key: string]: { retrasoTotal: number, conteo: number } } = {};

        lineUp.forEach(buque => {
            const terminal = (buque.terminal || buque.muelle || 'SIN ASIGNAR').trim().toUpperCase();

            // Verificamos que tengamos fechas válidas
            if (buque.eta && buque.ata) {
                const eta = new Date(buque.eta).getTime();
                const ata = new Date(buque.ata).getTime();

                // Si ETA o ATA son inválidos, saltamos este registro
                if (isNaN(eta) || isNaN(ata)) return;

                // Calculamos la diferencia en horas
                const diferenciaHoras = (ata - eta) / (1000 * 60 * 60);

                // FILTRO DE CORDURA: Ignorar datos basura (ej: retrasos > 30 días o negativos absurdos)
                if (diferenciaHoras > 720 || diferenciaHoras < -720) return;

                if (!terminalesData[terminal]) {
                    terminalesData[terminal] = { retrasoTotal: 0, conteo: 0 };
                }

                terminalesData[terminal].conteo++;

                // Solo sumamos el retraso si realmente llegó tarde (ATA > ETA)
                terminalesData[terminal].retrasoTotal += (diferenciaHoras > 0 ? diferenciaHoras : 0);
            }
        });

        // 2. Construir los arrays para la gráfica, SOLO con terminales que tienen datos
        const labels: string[] = [];
        const dataEta: number[] = [];
        const dataRetraso: number[] = [];

        Object.keys(terminalesData).forEach(terminal => {
            const info = terminalesData[terminal];

            // Si el conteo es mayor a 0, la terminal entra a la gráfica
            if (info.conteo > 0) {
                labels.push(terminal);

                // Promedio de retraso
                const promedioRetraso = info.retrasoTotal / info.conteo;
                dataRetraso.push(Math.round(promedioRetraso));

                // ETA planeada sirve como línea base (0)
                dataEta.push(0);
            }
        });

        // 3. Devolver la estructura para ng2-charts
        return {
            labels: labels, // <-- Esto reemplaza a chartLabels para alinear la salida
            datasets: [
                {
                    label: 'ETA planeada (h)',
                    data: dataEta,
                    backgroundColor: '#3b82f6'
                },
                {
                    label: 'Retraso real (h)',
                    data: dataRetraso,
                    backgroundColor: '#ef4444'
                }
            ]
        };
    }
}
