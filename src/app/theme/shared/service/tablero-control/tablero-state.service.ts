import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DashboardService } from './dashboard.service';
import { WIDGET_MAP } from './../../../../tablero-control/torre-control/widget-registry';

@Injectable({
    providedIn: 'root'
})
export class TableroStateService {
    private dashboardSubject = new BehaviorSubject<any[]>([]);
    public dashboard$ = this.dashboardSubject.asObservable();

    public cargandoLayout$ = new BehaviorSubject<boolean>(false);
    public cargandoDatos$ = new BehaviorSubject<boolean>(false);
    public ciudad$ = new BehaviorSubject<boolean>(false);

    constructor(private _apiService: DashboardService) { }

    public inicializarTablero(codigoLayout: string, puerto: string) {
        this.cargandoLayout$.next(true);

        this._apiService.getLayout(codigoLayout).subscribe({
            next: (res: any) => {
                const layoutLimpio = this._sanitizarLayout(res);

                // 1. Construimos los esqueletos básicos filtrando la basura de la DB
                let esqueletos = layoutLimpio
                    .map((w: any) => {
                        const finalType = w.id || w.type;
                        const finalData = w.data || {};

                        // 🔍 LOG DE DIAGNÓSTICO
                        // console.log(`🔎 Rastreo de widget: ID=${finalType} | ¿Tiene Data?=`, !!finalData);
                        let configObj = { cols: 2, rows: 2 };
                        try { if (w.config) configObj = JSON.parse(w.config); } catch (e) { }

                        return {
                            x: w.posicion?.x ?? 0,
                            y: w.posicion?.y ?? 0,
                            cols: configObj.cols || 2,
                            rows: configObj.rows || 2,
                            type: finalType,
                            data: finalData
                        };
                    })
                    .filter((w: any) => {
                        const t = w.type || '';
                        // Eliminamos deuda técnica: widgets hardcoded específicos por terminal
                        const esResumenGenerico = t === 'RESUMEN_SEMANAL' || t === 'RESUMEN_MARITIMO';
                        return (!t.startsWith('RESUMEN_') && !t.startsWith('DETALLE_')) || esResumenGenerico;
                    });

                // 2. INYECCIÓN DINÁMICA DE TERMINALES INDEPENDIENTES
                // Nota: Si 'res.matriz?.terminales' llega vacío aquí, Gridster no pintará nada.
                // Asegúrate de que tu backend envíe esa propiedad en este endpoint.
                if (codigoLayout === 'TLC_MARITIMO_001') {
                    // Obtenemos la data y FILTRAMOS de entrada lo que no sea terminal válida
                    const datosTerminales = (res.matriz?.data?.terminales || res.matriz?.terminales || [])
                        .filter((t: any) => t.nombre && t.nombre !== 'OTRAS / POR DEFINIR'); // 🚨 FILTRO ANTI-BASURA

                    datosTerminales.forEach((terminal: any, index: number) => {
                        esqueletos.push({
                            x: (index % 3) * 4,
                            y: 2 + Math.floor(index / 3),
                            cols: 4,
                            rows: 2,
                            type: 'TERMINAL_INDIVIDUAL',
                            data: { ...terminal } // 🚨 PASAMOS EL OBJETO TERMINAL TAL CUAL
                        });
                    });
                }

                // 3. Enviamos el tablero final
                this.dashboardSubject.next(esqueletos);
                this.cargandoLayout$.next(false);

                // 4. Inyección de datos vivos para los KPIs
                if (codigoLayout !== 'TLC_MARITIMO_001') {
                    this.inyectarDatosVivos(puerto, esqueletos);
                }
            },
            error: (err) => {
                console.error('Error cargando layout:', err);
                this.cargandoLayout$.next(false);
            }
        });
    }

    public inyectarDatosVivos(puerto: string, dashboardActual: any[]) {
        this.cargandoDatos$.next(true);

        const dashboardCargando = dashboardActual.map(w => ({ ...w, data: { ...w.data, cargandoIA: true } }));
        this.dashboardSubject.next(dashboardCargando);

        this._apiService.obtenerResumenKpis(puerto).subscribe({
            next: (res: any) => {
                const dataMap = res.data || res;

                const dashboardLleno = dashboardCargando.map(widget => {
                    let newData = { ...widget.data };

                    // 🧹 ¡ADIÓS DEUDA TÉCNICA! Eliminamos los ifs quemados de RESUMEN_SPRBUN, etc.
                    // Ahora todo es un mapeo directo y limpio
                    if (dataMap[widget.type]) {
                        newData = { ...newData, ...dataMap[widget.type] };
                    }

                    newData.cargandoIA = false;
                    return { ...widget, data: newData };
                });

                this.dashboardSubject.next(dashboardLleno);
                this.cargandoDatos$.next(false);
            },
            error: (err) => this.cargandoDatos$.next(false)
        });
    }

    private _sanitizarLayout(rawData: any): any[] {
        let data = rawData;
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch (e) { return []; }
        }
        if (data && !Array.isArray(data)) {
            data = data.widgets || data.data || [];
        }
        return Array.isArray(data) ? data : [];
    }

    // 🚨 EL INTERCEPTOR DE ARQUITECTURA (CORREGIDO)
    private _construirEsqueletos(widgets: any[]): any[] {
        const layoutCorregido: any[] = [];
        let resumenDinamicoInyectado = false;



        widgets.forEach(w => {
            // Identificamos los widgets antiguos que queremos "interceptar"
            const esResumenAntiguo = w.id.startsWith('RESUMEN_') &&
                w.id !== 'RESUMEN_SEMANAL' &&
                w.id !== 'RESUMEN_MARITIMO';

            if (esResumenAntiguo) {
                if (!resumenDinamicoInyectado) {
                    layoutCorregido.push({
                        id: 'RESUMENES_POR_TERMINAL',
                        config: { cols: 3, rows: 2 },
                        // 🚨 FORZAMOS LA POSICIÓN AL INICIO O EN UN ESPACIO LIBRE
                        posicion: { x: 0, y: 0 },
                        data: {}
                    });
                    resumenDinamicoInyectado = true;
                }
            }
        });

        // 2. Construimos Gridster usando la lista corregida
        return layoutCorregido
            .filter(w => WIDGET_MAP[w.id]) // Filtramos solo lo que existe en el registro
            .map(w => {
                const def = WIDGET_MAP[w.id];
                let conf: any = {};

                // Procesamos la configuración de forma segura
                try {
                    conf = typeof w.config === 'string' ? JSON.parse(w.config) : (w.config || {});
                } catch (e) { conf = {}; }

                return {
                    type: w.id, // Este es el identificador clave para el switch
                    data: { ...(w.data || {}), cargandoIA: true },
                    cols: conf.cols || def.defaultCols || 1,
                    rows: conf.rows || def.defaultRows || 1,
                    x: w.posicion?.x ?? 0, // Usamos nullish coalescing
                    y: w.posicion?.y ?? 0
                };

                // return {
                //     type: w.id,
                //     data: { ...(w.data || {}), cargandoIA: true },
                //     // Forzamos valores mínimos por defecto
                //     cols: conf.cols || 12,
                //     rows: conf.rows || 2,
                //     x: w.posicion?.x ?? 0,
                //     y: w.posicion?.y ?? 0
                // };
            });
    }
}
