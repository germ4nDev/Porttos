import { IBaseAdapter } from './base.adapter';
import { VesselTableModel, Motonave } from '../_helpers/models/tablero-control/vessel-table.model';

export class VesselTableAdapter implements IBaseAdapter<VesselTableModel> {

    // 1. Añadimos 'params' esperando el mapa real de la API
    transform(rawData: any, params?: { puerto: string, mapaPortuario?: any[] }): VesselTableModel {

        // 2. Extraemos las variables del contexto
        const puertoFiltro = params?.puerto || 'TODOS';
        const mapaApi = params?.mapaPortuario || [];
        const arrayNaves = rawData.listado || rawData.motonaves || [];

        // 3. Filtramos la data cruda usando la "Fuente de la Verdad" (El Mapa de la API)
        const navesFiltradas = arrayNaves.filter((nave: any) => {
            if (puertoFiltro === 'TODOS') return true;

            const puertoNave = (nave.puerto || '').toUpperCase().trim();
            const terminalNave = (nave.terminal || '').toUpperCase().trim();

            // REGLA 1: Si el backend envía el puerto exacto, confiamos en él
            if (puertoNave && puertoNave === puertoFiltro) {
                return true;
            }

            // REGLA 2: Si NO hay puerto explícito, consultamos el Mapa Portuario
            if (mapaApi.length > 0) {
                // Buscamos si existe alguna terminal en el mapa que coincida con la nave
                // y que pertenezca al puerto que el usuario seleccionó.
                const perteneceAlMapa = mapaApi.some(puertoConfig => {
                    const nombrePuertoMapeado = (puertoConfig.nombre || '').toUpperCase().trim();

                    if (nombrePuertoMapeado === puertoFiltro) {
                        // Verificamos si la terminal de la nave está en la lista de terminales de este puerto
                        // Usamos '.some' para soportar búsquedas parciales (ej: 'COMPAS - CASCAJAL' incluye 'CASCAJAL')
                        const terminalesAsociadas = puertoConfig.terminales || [];
                        return terminalesAsociadas.some((term: string) =>
                            terminalNave.includes(term.toUpperCase().trim())
                        );
                    }
                    return false;
                });

                if (perteneceAlMapa) return true;
            }

            // Si no hizo match con el puerto directo, ni está en el mapa, se descarta
            return false;
        });

        // 4. Retornamos el modelo final impecable
        return {
            titulo: rawData.titulo || 'REPORTE DE MOTONAVES - 72H',
            subtitulo: rawData.subtitulo || `Programación de arribos y atraques - ${puertoFiltro}`,
            icono: rawData.icono || 'fa-ship',
            cargandoIA: false,

            motonaves: navesFiltradas.map((nave: any): Motonave => {
                const textoEstado = (nave.posicion || nave.estadoTexto || '').toUpperCase();
                const claseOriginal = (nave.estadoClase || '').toLowerCase();

                let pill = 'pill-grey';
                if (claseOriginal.includes('descargando') || textoEstado.includes('DESCARGA') || textoEstado.includes('ATRACADO')) {
                    pill = 'pill-green';
                } else if (claseOriginal.includes('fondeo') || textoEstado === 'EN ESPERA') {
                    pill = 'pill-orange';
                } else if (claseOriginal.includes('atracando') || textoEstado.includes('ATRACANDO')) {
                    pill = 'pill-purple';
                } else if (claseOriginal.includes('transito') || textoEstado.includes('ESPERADO')) {
                    pill = 'pill-cyan';
                }

                return {
                    ...nave,
                    motonave: nave.motonave || nave.nombre || 'N/A',
                    puerto: nave.puerto || 'N/A',
                    naviera: nave.naviera || 'N/A',
                    lineaAgencia: nave.lineaAgencia || 'N/A',
                    terminal: nave.terminal || 'N/A',

                    // 🚨 APLICAMOS EL LIMPIADOR AQUÍ
                    eta: this._formatearFecha(nave.eta || nave.eta_date),
                    ata: this._formatearFecha(nave.ata || nave.fechaAtraque),
                    fechaAtraque: this._formatearFecha(nave.fechaAtraque || nave.ata),

                    carga: nave.carga || 'N/A',
                    trabajoOperacion: nave.trabajoOperacion || nave.carga || 'N/A',
                    posicion: nave.posicion || nave.estadoTexto || 'N/A',
                    estadoTexto: nave.estadoTexto || nave.posicion || 'N/A',
                    estadoClase: pill
                };
            })
        };
    }

    private _formatearFecha(fechaCruda: any): string {
        if (!fechaCruda || fechaCruda === '--') return '--';

        const fechaStr = String(fechaCruda);

        // Si la fecha viene en formato ISO estándar de base de datos (Ej: 2026-05-01T12:00:00.000Z)
        if (fechaStr.includes('T') && fechaStr.includes('Z')) {
            const dateObj = new Date(fechaStr);
            if (!isNaN(dateObj.getTime())) {
                // Construimos un formato limpio: DD/MM/AA HH:mm
                const dia = String(dateObj.getDate()).padStart(2, '0');
                const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
                const anio = String(dateObj.getFullYear()).slice(-2); // Solo 2 dígitos para el año
                const horas = String(dateObj.getHours()).padStart(2, '0');
                const mins = String(dateObj.getMinutes()).padStart(2, '0');

                return `${dia}/${mes}/${anio} ${horas}:${mins}`; // Ej: 01/05/26 12:00
            }
        }

        // Si no es formato ISO (ej: "11/05 08:12 - M-N3"), lo devolvemos tal cual
        return fechaStr;
    }
}
