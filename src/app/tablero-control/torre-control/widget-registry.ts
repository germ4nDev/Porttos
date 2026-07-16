import { Type } from '@angular/core';

import {
    KpiCardComponent,
    VesselTableComponent,
    EtaChartComponent,
    ToneladasChartComponent,
    CanalConditionsComponent,
    ReportesOperativosComponent,
    TerminalSummaryCardComponent,
    ProductividadChartComponent,
    TipoOperacionComponent,
    MatrizCargaComponent,
    HistoricoAnualComponent,
    ImplicacionesOperativasComponent,
    MapaLogisticoComponent
} from '../../theme/shared/widgets/widget-index';
import { ReporteSemanalMaritimoComponent } from '../widgets/panel-maritimo/reporte-semanal-maritimo/reporte-semanal-maritimo.component';
import { AnalisisTraficoComponent } from '../widgets/panel-maritimo/analisis-trafico/analisis-trafico.component';
import { ParticipacionNacionalComponent } from '../widgets/panel-maritimo/participacion-nacional/participacion-nacional.component';
import { MezclaCargaComponent } from '../widgets/panel-maritimo/mezcla-carga/mezcla-carga.component';

export interface IWidgetRegistryDef {
    componente: Type<unknown>;
    defaultCols: number;
    defaultRows: number;
}

export const WIDGET_MAP: { [key: string]: IWidgetRegistryDef } = {
    // FILA 0: KPIs del MVP (Operación Marítima)
    'KPI_CAMIONES_PUERTO': { componente: KpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_CONTENEDORES': { componente: KpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_GRANEL': { componente: KpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_CARGA_SUELTA': { componente: KpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_RORO': { componente: KpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_BODEGAS': { componente: KpiCardComponent, defaultCols: 2, defaultRows: 1 },

    'KPI_ESPERADOS': { componente: KpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_FONDEO': { componente: KpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_MUELLE': { componente: KpiCardComponent, defaultCols: 2, defaultRows: 1 },

    // FILA 5: RResumenes Terminales
    'WDG_TERMINAL_INDIVIDUAL': {
        componente: TerminalSummaryCardComponent, // El componente individual que ya tenías
        defaultCols: 4,
        defaultRows: 2
    },

    // FILA 3: Tabla Maestra y Gráfica ETA (Se bajan un nivel)
    'WDG_TABLE_REPORTE_MOTONAVES': { componente: VesselTableComponent, defaultCols: 8, defaultRows: 4 },
    'WDG_CHART_ETA_ATA': { componente: EtaChartComponent, defaultCols: 4, defaultRows: 4 },

    // FILA 4: Resto de gráficas analíticas
    'WDG_CHART_TONELADAS': { componente: ToneladasChartComponent, defaultCols: 6, defaultRows: 3 },
    'WDG_CONDICIONES_CANAL': { componente: CanalConditionsComponent, defaultCols: 6, defaultRows: 3 },

    // 'RESUMEN_MARITIMO': { componente: ResumenMaritimoComponent, defaultCols: 4, defaultRows: 3 },
    'WDG_SEMANAL_MARITIMO': { componente: ReporteSemanalMaritimoComponent, defaultCols: 4, defaultRows: 3 },
    // 'ARRIBOS_7_DIAS': { componente: ResumenSemanalComponent, defaultCols: 4, defaultRows: 3 },

    'WDG_CHART_PRODUCTIVIDAD': { componente: ProductividadChartComponent, defaultCols: 4, defaultRows: 3 },
    'WDG_REPORTES_OPERATIVOS': { componente: ReportesOperativosComponent, defaultCols: 4, defaultRows: 3 },

    'WDG_ANALISIS_TRAFICO': {
        componente: AnalisisTraficoComponent, // Componente encargado de la gráfica apilada y KPIs
        defaultCols: 12,
        defaultRows: 4
    },
    'WDG_PARTICIPACION_NAC': {
        componente: ParticipacionNacionalComponent,
        defaultCols: 4,
        defaultRows: 3
    },
    'WDG_MEZCLA_CARGA': { componente: MezclaCargaComponent, defaultCols: 4, defaultRows: 3 },
    'WDG_TIPO_OPERACION': { componente: TipoOperacionComponent, defaultCols: 4, defaultRows: 3 },
    'WDG_MATRIZ_TERMINAL_CARGA': { componente: MatrizCargaComponent, defaultCols: 8, defaultRows: 3 },
    'WDG_HISTORICO_ANUAL': { componente: HistoricoAnualComponent, defaultCols: 4, defaultRows: 3 },
    'WDG_IMPLICACIONES_OPERATIVAS': { componente: ImplicacionesOperativasComponent, defaultCols: 12, defaultRows: 2 },

    'WDG_MAPA_LOGISTICO': { componente: MapaLogisticoComponent, defaultCols: 12, defaultRows: 12 }
};
