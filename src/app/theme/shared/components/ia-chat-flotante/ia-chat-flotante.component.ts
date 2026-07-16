import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IaAssistantService } from '../../service/ia-assistant.service';
import { IaAssistantResponseModel } from '../../_helpers/models/IAAssistantData.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { NgChartsModule } from 'ng2-charts';
import { ChartData } from 'chart.js';
// =======================================================================
// INTERFACES DE SOPORTE PARA LA CONSOLA Y RENDERIZADO DE GRÁFICAS (MÓDULOS)
// =======================================================================
interface SerieGrafica {
    name: string;
    data: number[];
}

// 🎯 CORRECCIÓN: Renombramos y ajustamos para que coincida con el backend
interface ToolDataIA {
    data?: any[]; // Aquí viajan los registros reales (usuarios, tickets, etc.)
    eje_x_categorias?: string[];
    series?: SerieGrafica[];
    db_source?: string; // Origen de datos expuesto para la junta directiva
    error?: string; // Para el motor de métricas
    valor?: number; // Para el motor de métricas
    descripcion?: string; // Para el motor de métricas
    [key: string]: any; // Comodín para propiedades extra
}

interface ToolExecutedIA {
    name: string;
    inputs: any;
    data: ToolDataIA | null;
    chartConfig?: any; // ✨ ESTA ES LA LÍNEA QUE TE FALTA
}

interface InteraccionChatIA {
    query: string;
    response: string;
    toolExecuted: ToolExecutedIA | null;
    executionMode: string;
    timestamp: string;
}

@Component({
    selector: 'app-ia-chat-flotante',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, MarkdownPipe, DynamicTableComponent, NgChartsModule],
    templateUrl: './ia-chat-flotante.component.html',
    styleUrl: './ia-chat-flotante.component.scss'
})
export class IaChatFlotanteComponent {

    public promptUsuario: string = '';
    public cargando: boolean = false;
    public modalAbierto: boolean = false;
    public sidebarAbierto: boolean = false;

    // Historial tipado que alimenta directamente a la directiva *ngFor del HTML
    public historialInteracciones: InteraccionChatIA[] = [];

    constructor(
        private iaService: IaAssistantService,
        private translate: TranslateService
    ) { }

    public alternarSidebar(): void {
        this.sidebarAbierto = !this.sidebarAbierto;
    }

    public abrirModal(): void {
        this.modalAbierto = true;
    }

    public cerrarModal(): void {
        this.modalAbierto = false;
    }

    public enviarConsulta(): void {
        if (!this.promptUsuario.trim() || this.cargando) return;

        const textoEnviado = this.promptUsuario;
        this.promptUsuario = '';
        this.cargando = true;

        // Cerramos la cortina del sidebar y abrimos el modal ejecutivo de respuestas
        this.sidebarAbierto = false;
        this.modalAbierto = true;

        this.iaService.preguntarIA(textoEnviado).subscribe({
            next: (resultado: any) => {
                try {
                    const coreData = resultado?.data?.respuesta;

                    if (coreData) {
                        const toolExec = coreData.meta?.toolExecuted;
                        const chartProcesado = toolExec?.data?.chartConfig || null;

                        const nuevaInteraccion: InteraccionChatIA = {
                            query: textoEnviado,
                            response: coreData.msg || '',
                            executionMode: coreData.meta?.executionMode || 'Standard Text',
                            timestamp: coreData.meta?.timestamp || new Date().toISOString(),

                            toolExecuted: toolExec ? {
                                name: toolExec.name,
                                inputs: toolExec.inputs,
                                data: toolExec.data,
                                chartConfig: chartProcesado
                            } : null
                        };

                        this.historialInteracciones.push(nuevaInteraccion);
                    }
                } catch (error) {
                    console.error("Error procesando la respuesta de la IA:", error);
                } finally {
                    // 🔥 ESTO ASEGURA QUE NUNCA SE QUEDE CARGANDO
                    this.cargando = false;
                }
            },
            error: (err: any) => {
                console.error('Error en el asistente de IA:', err);
                this.cargando = false;
            }
        });
    }
}
