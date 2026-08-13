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
    MapaLogisticoComponent,
    ContKpiCardComponent
} from '../../theme/shared/widgets/widget-index';

import { ReporteSemanalMaritimoComponent } from '../widgets/panel-maritimo/reporte-semanal-maritimo/reporte-semanal-maritimo.component';
import { AnalisisTraficoComponent } from '../widgets/panel-maritimo/analisis-trafico/analisis-trafico.component';
import { ParticipacionNacionalComponent } from '../widgets/panel-maritimo/participacion-nacional/participacion-nacional.component';
import { MezclaCargaComponent } from '../widgets/panel-maritimo/mezcla-carga/mezcla-carga.component';

// Importaciones del Virtual Gate
import { TableColaGateComponent } from '../widgets/panel-virtual-gate/table-cola-gate/table-cola-gate.component';
import { GateValidacionComponent } from '../widgets/panel-virtual-gate/gate-validacion/gate-validacion.component';
import { GateAlertasComponent } from '../widgets/panel-virtual-gate/gate-alertas/gate-alertas.component';
import { ChartDoughnutComponent } from '../widgets/panel-virtual-gate/chart-doughnut/chart-doughnut.component';
import { ChartStackedBarComponent } from '../widgets/panel-virtual-gate/chart-stacked-bar/chart-stacked-bar.component';
import { GateEstadoCitasComponent } from '../widgets/panel-virtual-gate/gate-estado-citas/gate-estado-citas.component';
import { GateKpiCardComponent } from '../widgets/panel-virtual-gate/gate-kpi-card/gate-kpi-card.component';

// Importaciones de Contenedores (Ajusta la ruta según tu estructura de carpetas)
import { ContenedoresPatiosComponent } from '../widgets/panel-contenedores/contenedores-patios/contenedores-patios.component';
import { TableContenedoresComponent } from '../widgets/panel-contenedores/table-contenedores/table-contenedores.component';
import { ChartBarContComponent } from '../widgets/panel-contenedores/chart-bar-cont/chart-bar-cont.component';
import { ChartStackedBarContComponent } from '../widgets/panel-contenedores/chart-stacked-bar-cont/chart-stacked-bar-cont.component';
import { ChartDoughnutContComponent } from '../widgets/panel-contenedores/chart-doughnut-cont/chart-doughnut-cont.component';

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
        componente: TerminalSummaryCardComponent,
        defaultCols: 4,
        defaultRows: 2
    },

    // FILA 3: Tabla Maestra y Gráfica ETA (Se bajan un nivel)
    'WDG_TABLE_REPORTE_MOTONAVES': { componente: VesselTableComponent, defaultCols: 8, defaultRows: 4 },
    'WDG_CHART_ETA_ATA': { componente: EtaChartComponent, defaultCols: 4, defaultRows: 4 },

    // FILA 4: Resto de gráficas analíticas
    'WDG_CHART_TONELADAS': { componente: ToneladasChartComponent, defaultCols: 6, defaultRows: 3 },
    'WDG_CONDICIONES_CANAL': { componente: CanalConditionsComponent, defaultCols: 6, defaultRows: 3 },
    'WDG_SEMANAL_MARITIMO': { componente: ReporteSemanalMaritimoComponent, defaultCols: 4, defaultRows: 3 },
    'WDG_CHART_PRODUCTIVIDAD': { componente: ProductividadChartComponent, defaultCols: 4, defaultRows: 3 },
    'WDG_REPORTES_OPERATIVOS': { componente: ReportesOperativosComponent, defaultCols: 4, defaultRows: 3 },

    'WDG_ANALISIS_TRAFICO': {
        componente: AnalisisTraficoComponent,
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
    'WDG_MAPA_LOGISTICO': { componente: MapaLogisticoComponent, defaultCols: 12, defaultRows: 12 },

    // ==========================================
    // PESTAÑA 2: VIRTUAL GATE & BODEGAS
    // ==========================================

    // KPIs Principales y Secundarios
    'KPI_GATE_OP': { componente: GateKpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_GATE_CONT': { componente: GateKpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_GATE_GRANEL': { componente: GateKpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_GATE_SUELTA': { componente: GateKpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_GATE_RORO': { componente: GateKpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_GATE_BODEGAS': { componente: GateKpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_SUB_CONT': { componente: GateKpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_SUB_GRANEL': { componente: GateKpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_SUB_SUELTA': { componente: GateKpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_SUB_NINERAS': { componente: GateKpiCardComponent, defaultCols: 2, defaultRows: 1 },

    // Paneles y Gráficas
    'WDG_PREGATE_VAL': { componente: GateValidacionComponent, defaultCols: 4, defaultRows: 4 },
    'WDG_GATE_ALERT': { componente: GateAlertasComponent, defaultCols: 4, defaultRows: 4 },
    'WDG_CHART_DIST': { componente: ChartDoughnutComponent, defaultCols: 4, defaultRows: 4 },
    'WDG_CHART_CITAS': { componente: ChartStackedBarComponent, defaultCols: 8, defaultRows: 4 },
    'WDG_GATE_ESTADO': { componente: GateEstadoCitasComponent, defaultCols: 4, defaultRows: 4 },
    'WDG_TABLE_COLA': { componente: TableColaGateComponent, defaultCols: 12, defaultRows: 6 },

    // ==========================================
    // PESTAÑA 3: CONTENEDORES
    // ==========================================

    // KPIs Principales (Cols 2, Rows 1)
    'KPI_CONT_CARGADOS': { componente: ContKpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_CONT_VACIOS': { componente: ContKpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_CONT_REEFER': { componente: ContKpiCardComponent, defaultCols: 2, defaultRows: 1 },
    'KPI_CONT_FREETIME': { componente: ContKpiCardComponent, defaultCols: 2, defaultRows: 1 },

    // Paneles y Gráficas
    'WDG_CONT_RETIROS': { componente: ChartStackedBarContComponent, defaultCols: 6, defaultRows: 4 },
    'WDG_CONT_NAVIERA': { componente: ChartBarContComponent, defaultCols: 6, defaultRows: 4 },
    'WDG_CONT_PATIOS': { componente: ContenedoresPatiosComponent, defaultCols: 6, defaultRows: 4 },
    'WDG_CONT_FREETIME_CHART': { componente: ChartDoughnutContComponent, defaultCols: 6, defaultRows: 4 },

    // Tabla de Movimientos
    'WDG_CONT_TABLA': { componente: TableContenedoresComponent, defaultCols: 12, defaultRows: 4 }
};
