import { IBaseAdapter } from './base.adapter';

export interface KpiModel {
    titulo: string;
    valor: number | string;
    tendencia: string;
    icono?: string;
    colorClase?: string;
}

export class KpiMaritimoAdapter implements IBaseAdapter<KpiModel> {

    transform(rawData: any, params: { tipoKpi: 'ESPERADOS' | 'FONDEO' | 'MUELLE', puerto: string, mapaPortuario: any[] }): KpiModel {
        const puertoFiltro = (params.puerto || 'TODOS').toUpperCase().trim();
        const mapaApi = params.mapaPortuario || [];
        const arrayNaves = rawData.listado || [];

        // 1. LA REGLA DE ORO: Filtrar primero la data respetando el puerto seleccionado
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

        // 2. CONTEO SOBRE LA DATA YA FILTRADA
        const tipo = params.tipoKpi;
        switch (tipo) {
            case 'ESPERADOS':
                return {
                    titulo: 'BUQUES ESPERADOS',
                    valor: navesFiltradas.filter((n: any) => n.posicion === 'ESPERADO').length,
                    tendencia: 'En tránsito a zona',
                    icono: 'feather icon-clock',
                    colorClase: 'text-info'
                };

            case 'FONDEO':
                return {
                    titulo: 'BUQUES EN FONDEO',
                    valor: navesFiltradas.filter((n: any) => n.posicion === 'FONDEO').length,
                    tendencia: 'Esperando muelle',
                    icono: 'feather icon-anchor',
                    colorClase: 'text-warning'
                };

            case 'MUELLE':
                return {
                    titulo: 'BUQUES EN MUELLE',
                    valor: navesFiltradas.filter((n: any) => n.posicion === 'EN PUERTO' || n.posicion === 'ATRACADO').length,
                    tendencia: 'Operaciones activas',
                    icono: 'feather icon-target',
                    colorClase: 'text-success'
                };

            default:
                return { titulo: 'KPI DESCONOCIDO', valor: 0, tendencia: '--' };
        }
    }
}
