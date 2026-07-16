import { IBaseAdapter } from './base.adapter';
import { KpiCardModel } from '../_helpers/models/tablero-control/kpi-card.model';

export class KpiCardAdapter implements IBaseAdapter<KpiCardModel> {
    transform(data: any): KpiCardModel {
        return {
            titulo: data.titulo,
            valor: data.value,
            tendencia: data.trend || undefined,
            icono: data.icon || 'fa-chart-line',
            colorBorde: data.colorBorde || 'borde-gris',
            cargandoIA: false
        };
    }
}
