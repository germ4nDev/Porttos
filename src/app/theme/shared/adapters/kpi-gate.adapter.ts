import { IBaseAdapter } from './base.adapter';

export interface KpiModel {
    titulo: string;
    valor: number | string;
    tendencia: string;
    colorBorde?: string;
}

export class KpiGateAdapter implements IBaseAdapter<KpiModel> {

    // 🚨 LA SOLUCIÓN: Agregamos 'puerto: string' al tipado del objeto de parámetros
    transform(rawData: any, params: { tipo: string, puerto: string }): KpiModel {
        const tipo = params.tipo;
        const puertoFiltro = (params.puerto || 'TODOS').toUpperCase().trim();

        // REGLA DE SEGURIDAD POR SI LA API MANDASE UN ARRAY DE PUERTOS EN VEZ DE UN OBJETO ÚNICO
        let data = rawData || {};
        if (Array.isArray(rawData)) {
            data = rawData.find(p => (p.puerto || p.nombre || '').toUpperCase().trim() === puertoFiltro) || {};
        }

        switch (tipo) {
            case 'CAMIONES':
                return {
                    titulo: 'CAMIONES EN OPERACIÓN',
                    valor: data.camionesTotal || '811',
                    tendencia: `hoy - pre-gate ${data.camionesPreGate || 87} - interior ${data.camionesInterior || 412} - puerto ${data.camionesPuerto || 312}`,
                    colorBorde: 'border-left-cyan'
                };

            case 'CONTENEDORES':
                return {
                    titulo: 'CONTENEDORES DÍA',
                    valor: data.contenedoresTotal || '2.847',
                    tendencia: `FCL ${data.fcl || '2.140'} - LCL ${data.lcl || 124} - Reefer ${data.reefer || 583}`,
                    colorBorde: 'border-left-blue'
                };

            case 'GRANEL':
                return {
                    titulo: 'GRANEL - TONELADAS DÍA',
                    valor: data.granelTotal || '1.3K',
                    tendencia: `Agrícola ${data.agricola || '24.2K'} - Mineral ${data.mineral || '9.8K'} - Líquido ${data.liquido || '4.4K'}`,
                    colorBorde: 'border-left-orange'
                };

            case 'CARGA_SUELTA':
                return {
                    titulo: 'CARGA SUELTA - TM',
                    valor: data.cargaSueltaTotal || '4.820',
                    tendencia: `Break-bulk ${data.breakBulk || 2500} - Project ${data.project || 1320} - Paletizada ${data.paletizada || 1000}`,
                    colorBorde: 'border-left-yellow'
                };

            case 'RO_RO':
                return {
                    titulo: 'VEHÍCULOS RO-RO',
                    valor: data.roroTotal || '1.142',
                    tendencia: `Imp ${data.roroImp || 824} - Exp ${data.roroExp || 318} - PDI ${data.roroPdi || '95% ocupado'}`,
                    colorBorde: 'border-left-teal'
                };

            case 'BODEGAS':
                return {
                    titulo: 'SATURACIÓN BODEGAS',
                    valor: data.saturacionTotal || '72%',
                    tendencia: `${data.bodegasTotal || 8} bodegas - ${data.bodegasCriticas || 2} críticas - ruteo activo`,
                    colorBorde: 'border-left-purple'
                };

            default:
                return { titulo: 'SIN DATOS', valor: '0', tendencia: '--', colorBorde: 'border-left-grey' };
        }
    }
}
