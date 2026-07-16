// /*
//   Author: German Valencia
//   Component: Ingesta Panel (Standalone) - Carga de Documentos IA
// */
// import { Component, EventEmitter, OnInit, Output } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../environments/environment';
// import { NavBarComponent } from "src/app/theme/layout/admin/nav-bar/nav-bar.component";
// import { Observable } from 'rxjs';
// import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
// import { NavigationService } from 'src/app/theme/shared/service';
// import { NavContentComponent } from "src/app/theme/layout/admin/navigation/nav-content/nav-content.component";
// import { TranslateModule, TranslateService } from '@ngx-translate/core';
// import { IngestaService } from 'src/app/theme/shared/service/tablero-control/ingesta.service';

// @Component({
//     selector: 'app-ingesta-panel',
//     standalone: true,
//     imports: [CommonModule, FormsModule, NavBarComponent, NavContentComponent, TranslateModule],
//     templateUrl: './ingesta-panel.component.html',
//     styleUrl: './ingesta-panel.component.scss'
// })
// export class IngestaPanelComponent implements OnInit {
//     @Output() toggleSidebar = new EventEmitter<void>()
//     activeTab: 'menu' | 'filters' | 'main' = 'menu'
//     menuItems$!: Observable<NavigationItem[]>
//     hasFiltersSlot: boolean = false

//     public tipoDocumento: string = 'BOLETIN_PORTUARIO';
//     public selectedFile: File | null = null;
//     public isDragging: boolean = false;

//     // Estados de la interfaz
//     public isUploading: boolean = false;
//     public uploadSuccess: boolean = false;
//     public uploadError: boolean = false;
//     public statusMessage: string = '';

//     constructor(
//         private http: HttpClient,
//         private _translate: TranslateService,
//         private _navigationService: NavigationService,
//         private _ingestaService: IngestaService,
//     ) { }
//     ngOnInit(): void {
//         this._navigationService.getNavigationItems()
//         this.menuItems$ = this._navigationService.menuItems$

//     }
//     // ================= EVENTOS DRAG & DROP =================
//     onDragOver(event: DragEvent): void {
//         event.preventDefault();
//         event.stopPropagation();
//         this.isDragging = true;
//     }

//     onDragLeave(event: DragEvent): void {
//         event.preventDefault();
//         event.stopPropagation();
//         this.isDragging = false;
//     }

//     onDrop(event: DragEvent): void {
//         event.preventDefault();
//         event.stopPropagation();
//         this.isDragging = false;

//         if (event.dataTransfer && event.dataTransfer.files.length > 0) {
//             this.validarYAsignarArchivo(event.dataTransfer.files[0]);
//         }
//     }

//     onFileSelected(event: any): void {
//         if (event.target.files && event.target.files.length > 0) {
//             this.validarYAsignarArchivo(event.target.files[0]);
//         }
//     }

//     private validarYAsignarArchivo(file: File): void {
//         const isValidPDF = file.type === 'application/pdf' && this.tipoDocumento === 'BOLETIN_PORTUARIO';
//         const isValidExcel = (file.type.includes('exexcel') || file.type.includes('spreadsheetml'));
//         const isValidCsv = (file.type.includes('csv') || file.type.includes('csv')) && this.tipoDocumento === 'TRAFICO';

//         if (!isValidPDF && !isValidExcel && !isValidCsv) {
//             this.mostrarError(`El archivo no coincide con el formato esperado para ${this.tipoDocumento}.`);
//             return;
//         }

//         this.selectedFile = file;
//         this.resetStatus();
//     }

//     procesarDocumento(): void {
//         if (!this.selectedFile) return;

//         this.isUploading = true;
//         this.resetStatus();

//         let observable$: Observable<any>;

//         switch (this.tipoDocumento) {
//             case 'RNDC_EXCEL':
//                 observable$ = this._ingestaService.subirExcelRNDC(this.selectedFile);
//                 break;

//             case 'TRAFICO':
//                 observable$ = this._ingestaService.subirCsvMaritimo(this.selectedFile);
//                 break;

//             case 'MATRIZ_BODEGAS':
//                 observable$ = this._ingestaService.subirMatrizOperaciones(this.selectedFile);
//                 break;

//             default:
//                 this.isUploading = false;
//                 this.mostrarError('Tipo de documento no soportado o no seleccionado.');
//                 return;
//         }

//         observable$.subscribe({
//             next: (res) => {
//                 this.isUploading = false;
//                 if (res.ok) {
//                     this.uploadSuccess = true;
//                     this.statusMessage = '¡Procesamiento exitoso!';
//                     this.selectedFile = null;
//                 }
//             },
//             error: (err) => {
//                 this.isUploading = false;
//                 this.mostrarError(err.error?.msg || 'Error de conexión con el servidor.');
//             }
//         });
//     }

//     public mostrarError(msg: string): void {
//         this.uploadError = true;
//         this.statusMessage = msg;
//         setTimeout(() => this.resetStatus(), 5000); // Ocultar tras 5 seg
//     }

//     public resetStatus(): void {
//         this.uploadSuccess = false;
//         this.uploadError = false;
//         this.statusMessage = '';
//     }

//     toggleNav(): void {
//         this.toggleSidebar.emit()
//     }
// }

/*
  Author: German Valencia
  Component: Ingesta Panel (Standalone) - Carga de Documentos IA
*/
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavBarComponent } from "src/app/theme/layout/admin/nav-bar/nav-bar.component";
import { Observable } from 'rxjs';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { NavigationService } from 'src/app/theme/shared/service';
import { NavContentComponent } from "src/app/theme/layout/admin/navigation/nav-content/nav-content.component";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IngestaService } from 'src/app/theme/shared/service/tablero-control/ingesta.service';
import * as XLSX from 'xlsx'; // 🚨 IMPORTANTE: La librería que acabas de instalar

@Component({
    selector: 'app-ingesta-panel',
    standalone: true,
    imports: [CommonModule, FormsModule, NavBarComponent, NavContentComponent, TranslateModule],
    templateUrl: './ingesta-panel.component.html',
    styleUrl: './ingesta-panel.component.scss'
})
export class IngestaPanelComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>()
    activeTab: 'menu' | 'filters' | 'main' = 'menu'
    menuItems$!: Observable<NavigationItem[]>
    hasFiltersSlot: boolean = false

    public tipoDocumento: string = 'LINEUP_EXCEL'; // Cambiado por defecto para probar
    public selectedFile: File | null = null;
    public isDragging: boolean = false;

    // Estados de la interfaz
    public isUploading: boolean = false;
    public uploadSuccess: boolean = false;
    public uploadError: boolean = false;
    public statusMessage: string = '';

    // 🚨 Estados específicos para la Ingesta del Line Up
    public pestanasEncontradas: string[] = [];
    public registrosProcesados: any[] = [];

    constructor(
        private http: HttpClient,
        private _translate: TranslateService,
        private _navigationService: NavigationService,
        private _ingestaService: IngestaService,
    ) { }

    ngOnInit(): void {
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
    }

    // ================= EVENTOS DRAG & DROP =================
    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = true;
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;

        if (event.dataTransfer && event.dataTransfer.files.length > 0) {
            this.validarYAsignarArchivo(event.dataTransfer.files[0]);
        }
    }

    onFileSelected(event: any): void {
        if (event.target.files && event.target.files.length > 0) {
            this.validarYAsignarArchivo(event.target.files[0]);
        }
    }

    // Limpieza total vinculada al botón "Quitar" del HTML
    limpiarArchivo(): void {
        this.selectedFile = null;
        this.pestanasEncontradas = [];
        this.registrosProcesados = [];
        this.resetStatus();
    }

    private validarYAsignarArchivo(file: File): void {
        const isValidPDF = file.type === 'application/pdf' && this.tipoDocumento === 'BOLETIN_PORTUARIO';
        const isValidExcel = (file.type.includes('excel') || file.type.includes('spreadsheetml'));
        const isValidCsv = (file.type.includes('csv') || file.name.endsWith('.csv')) && this.tipoDocumento === 'TRAFICO';

        if (!isValidPDF && !isValidExcel && !isValidCsv) {
            this.mostrarError(`El archivo no coincide con el formato esperado para ${this.tipoDocumento}.`);
            return;
        }

        this.selectedFile = file;
        this.resetStatus();

        // 🚨 Si es el Line Up, activamos la lectura instantánea con SheetJS
        if (this.tipoDocumento === 'LINEUP_EXCEL') {
            this.extraerDatosLineUp(file);
        }
    }

    // ============================================================================
    // 1. EL EXTRACTOR PRINCIPAL (Reemplaza tu método actual por este)
    // ============================================================================
    // private extraerDatosLineUp(file: File): void {
    //     const reader = new FileReader();

    //     reader.onload = (e: any) => {
    //         const data = new Uint8Array(e.target.result);
    //         const workbook = XLSX.read(data, { type: 'array', cellDates: true });

    //         this.pestanasEncontradas = workbook.SheetNames;
    //         let superArrayNacional: any[] = [];

    //         workbook.SheetNames.forEach(sheetName => {
    //             const worksheet = workbook.Sheets[sheetName];
    //             const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

    //             if (rawRows.length === 0) return;

    //             // 1. ESCÁNER ESTRICTO DE CABECERAS
    //             let headerRowIndex = -1;
    //             for (let i = 0; i < rawRows.length; i++) {
    //                 const row = rawRows[i];
    //                 if (!row) continue;

    //                 const puntosDeCoincidencia = row.filter(cell => {
    //                     const str = String(cell).toUpperCase().trim();
    //                     return ['VESSEL', 'MOTONAVE', 'TERMINAL', 'STATUS', 'ESTADO', 'AGENCY'].includes(str);
    //                 }).length;

    //                 // Exigimos al menos 2 palabras clave para confirmar que es la tabla real
    //                 if (puntosDeCoincidencia >= 2) {
    //                     headerRowIndex = i;
    //                     break;
    //                 }
    //             }

    //             // 🚨 SEGURIDAD 1: Si esta pestaña no tiene la tabla de barcos, ¡LA SALTAMOS!
    //             if (headerRowIndex === -1) {
    //                 console.warn(`[Ingesta] Se ignoró la pestaña "${sheetName}" porque no es una tabla válida.`);
    //                 return; // Esto equivale a un 'continue' dentro de un forEach
    //             }

    //             const headers = rawRows[headerRowIndex].map(h =>
    //                 h ? String(h).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '') : ''
    //             );

    //             const registrosMapeados = [];
    //             for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
    //                 const row = rawRows[i];
    //                 if (!row || row.length === 0) continue;

    //                 const rowNormalizado: any = {};
    //                 headers.forEach((headerName, colIndex) => {
    //                     if (headerName) {
    //                         rowNormalizado[headerName] = row[colIndex];
    //                     }
    //                 });

    //                 // 🚨 SEGURIDAD 2: Extraemos el valor real de la celda de la nave
    //                 const naveCruda = rowNormalizado['VESSEL'] || rowNormalizado['MOTONAVE'];

    //                 // Si no hay nave, o es un espacio en blanco, saltamos la fila
    //                 if (!naveCruda || String(naveCruda).trim() === '') continue;

    //                 const nombreFinalNave = String(naveCruda).trim().toUpperCase();

    //                 // 🚨 SEGURIDAD 3: Filtro anti-basura de Excel (Elimina fechas 1899 y textos de puerto)
    //                 if (nombreFinalNave.includes('1899') || nombreFinalNave.includes('PORT OFFICE') || nombreFinalNave.length < 2) {
    //                     continue;
    //                 }

    //                 // Traductor de Estados QPLUS
    //                 let rawStatus = String(rowNormalizado['STATUS'] || rowNormalizado['POSICION'] || rowNormalizado['ESTADO'] || '').toUpperCase().trim();
    //                 if (rawStatus.includes('BERTHED')) rawStatus = 'ATRACADO';
    //                 else if (rawStatus.includes('ANCHORED')) rawStatus = 'FONDEO';
    //                 else if (rawStatus.includes('SAILED')) rawStatus = 'ZARPÓ';
    //                 else if (rawStatus.includes('ANNOUNCE')) rawStatus = 'ESPERADO';
    //                 else if (!rawStatus) rawStatus = 'ESPERADO';

    //                 // Ensamblador de Toneladas
    //                 let operacionCruda = String(rowNormalizado['OPERATION'] || rowNormalizado['OPERACION'] || '').toUpperCase().trim();
    //                 let toneladas = rowNormalizado['TOTALMT'] || rowNormalizado['MTBYPRODUCT'] || '';
    //                 let trabajoFinal = rowNormalizado['TRABAJO'] || rowNormalizado['CARGA'];

    //                 if (!trabajoFinal && (operacionCruda || toneladas)) {
    //                     let sufijo = operacionCruda.includes('DISCHARG') ? 'DES' : (operacionCruda.includes('LOAD') ? 'CAR' : '');
    //                     trabajoFinal = `${toneladas} ${sufijo} - ${operacionCruda}`;
    //                 }

    //                 const valorTerminalCrudo = rowNormalizado['TERMINAL'];

    //                 // 2. Comprobamos si existe y si no está vacío tras quitar espacios
    //                 if (valorTerminalCrudo && String(valorTerminalCrudo).trim() !== '') {

    //                     // Si llegamos aquí, la terminal SÍ vino en el Excel
    //                     const terminalLimpia = String(valorTerminalCrudo).trim().toUpperCase();

    //                     // console.log('data line up válida', rowNormalizado); // Opcional

    //                     registrosMapeados.push({
    //                         puerto: this.clasificarPuerto(terminalLimpia, sheetName),
    //                         terminal: terminalLimpia,
    //                         // Capturamos el PIER buscando variaciones comunes que arroja XLSX
    //                         muelle: rowNormalizado['PIER'] || rowNormalizado['Pier'] || rowNormalizado['pier'] ? String(rowNormalizado['PIER'] || rowNormalizado['Pier'] || rowNormalizado['pier']).trim() : null,
    //                         motonave: nombreFinalNave,
    //                         lineaAgencia: rowNormalizado['AGENCY'] || rowNormalizado['LINEA/AGENCIA'] || null,
    //                         viaje: rowNormalizado['VIAJE'] ? String(rowNormalizado['VIAJE']).trim() : null,
    //                         eslora: rowNormalizado['ESLORA'] ? parseFloat(rowNormalizado['ESLORA']) : null,
    //                         eta: this.parsearFechaMaritima(rowNormalizado['DATEOFARRIVAL'] || rowNormalizado['ETA']),
    //                         fechaAtraque: this.parsearFechaMaritima(rowNormalizado['ETB'] || rowNormalizado['FECHADEATRAQUE']),
    //                         fechaZarpe: this.parsearFechaMaritima(rowNormalizado['ETC'] || rowNormalizado['ZARPE']),
    //                         trabajoOperacion: trabajoFinal || null,
    //                         posicion: rawStatus,
    //                         novedades: rowNormalizado['PRODUCT'] ? `Producto: ${rowNormalizado['PRODUCT']} | Puerto: ${rowNormalizado['PORTLOAD/DISCH'] || 'N/A'}` : null
    //                     });
    //                 } else {
    //                     // 🚨 Opcional: Log para saber qué barcos se quedaron fuera por no tener Terminal
    //                     console.warn(`Fila ignorada: El barco ${nombreFinalNave} no tiene TERMINAL asignada en el Excel.`);
    //                 }
    //             }

    //             superArrayNacional = [...superArrayNacional, ...registrosMapeados];
    //         });

    //         this.registrosProcesados = superArrayNacional;
    //         console.log(`📦 [A ENVIAR] Barcos limpios procesados listos para la API:`, this.registrosProcesados.length);
    //     };

    //     reader.readAsArrayBuffer(file);
    // }
    private extraerDatosLineUp(file: File): void {
        const reader = new FileReader();

        reader.onload = (e: any) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });

            this.pestanasEncontradas = workbook.SheetNames;
            let superArrayNacional: any[] = [];

            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

                if (rawRows.length === 0) return;

                // 1. ESCÁNER ESTRICTO DE CABECERAS
                let headerRowIndex = -1;
                for (let i = 0; i < rawRows.length; i++) {
                    const row = rawRows[i];
                    if (!row) continue;

                    const puntosDeCoincidencia = row.filter(cell => {
                        const str = String(cell).toUpperCase().trim();
                        return ['VESSEL', 'MOTONAVE', 'TERMINAL', 'STATUS', 'ESTADO', 'AGENCY'].includes(str);
                    }).length;

                    // Exigimos al menos 2 palabras clave para confirmar que es la tabla real
                    if (puntosDeCoincidencia >= 2) {
                        headerRowIndex = i;
                        break;
                    }
                }

                // 🚨 SEGURIDAD 1: Si esta pestaña no tiene la tabla de barcos, ¡LA SALTAMOS!
                if (headerRowIndex === -1) {
                    console.warn(`[Ingesta] Se ignoró la pestaña "${sheetName}" porque no es una tabla válida.`);
                    return; // Esto equivale a un 'continue' dentro de un forEach
                }

                const headers = rawRows[headerRowIndex].map(h =>
                    h ? String(h).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '') : ''
                );

                const registrosMapeados = [];
                for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
                    const row = rawRows[i];
                    if (!row || row.length === 0) continue;

                    const rowNormalizado: any = {};
                    headers.forEach((headerName, colIndex) => {
                        if (headerName) {
                            rowNormalizado[headerName] = row[colIndex];
                        }
                    });

                    // 🚨 SEGURIDAD 2: Extraemos el valor real de la celda de la nave
                    const naveCruda = rowNormalizado['VESSEL'] || rowNormalizado['MOTONAVE'];

                    // Si no hay nave, o es un espacio en blanco, saltamos la fila
                    if (!naveCruda || String(naveCruda).trim() === '') continue;

                    const nombreFinalNave = String(naveCruda).trim().toUpperCase();

                    const palabrasProhibidas = [
                        '1899', 'PORT OFFICE', 'TIDE', 'HUMIDITY', 'TEMPERATURE',
                        'MAREA', 'CLIMA', 'HUMEDAD', 'SWELL:', 'WIND:', 'WEATHER:', 'KTS', 'OVERCAST'
                    ];

                    // Unimos las columnas clave en un solo texto gigante para escanearlo de un solo golpe
                    const textoSospechoso = [
                        nombreFinalNave,
                        String(rowNormalizado['DATEOFARRIVAL'] || rowNormalizado['ETA'] || '').toUpperCase(),
                        String(rowNormalizado['OPERATION'] || rowNormalizado['OPERACION'] || '').toUpperCase(),
                        String(rowNormalizado['PRODUCT'] || '').toUpperCase(),
                        String(rowNormalizado['PORTLOAD/DISCH'] || '').toUpperCase()
                    ].join(' ');

                    const esBasura = palabrasProhibidas.some(palabra => textoSospechoso.includes(palabra));

                    if (esBasura || nombreFinalNave.length < 2) {
                        console.warn(`[Filtro] Fila meteorológica ignorada (Camuflada en la tabla): ${nombreFinalNave}`);
                        continue;
                    }

                    // Traductor de Estados QPLUS
                    let rawStatus = String(rowNormalizado['STATUS'] || rowNormalizado['POSICION'] || rowNormalizado['ESTADO'] || '').toUpperCase().trim();
                    if (rawStatus.includes('BERTHED')) rawStatus = 'ATRACADO';
                    else if (rawStatus.includes('ANCHORED')) rawStatus = 'FONDEO';
                    else if (rawStatus.includes('SAILED')) rawStatus = 'ZARPÓ';
                    else if (rawStatus.includes('ANNOUNCE')) rawStatus = 'ESPERADO';
                    else if (!rawStatus) rawStatus = 'ESPERADO';

                    // Ensamblador de Toneladas
                    let operacionCruda = String(rowNormalizado['OPERATION'] || rowNormalizado['OPERACION'] || '').toUpperCase().trim();
                    let toneladas = rowNormalizado['TOTALMT'] || rowNormalizado['MTBYPRODUCT'] || '';
                    let trabajoFinal = rowNormalizado['TRABAJO'] || rowNormalizado['CARGA'];

                    if (!trabajoFinal && (operacionCruda || toneladas)) {
                        let sufijo = operacionCruda.includes('DISCHARG') ? 'DES' : (operacionCruda.includes('LOAD') ? 'CAR' : '');
                        trabajoFinal = `${toneladas} ${sufijo} - ${operacionCruda}`;
                    }

                    const valorTerminalCrudo = rowNormalizado['TERMINAL'];

                    // 2. Comprobamos si existe y si no está vacío tras quitar espacios
                    if (valorTerminalCrudo && String(valorTerminalCrudo).trim() !== '') {

                        // Si llegamos aquí, la terminal SÍ vino en el Excel
                        const terminalLimpia = String(valorTerminalCrudo).trim().toUpperCase();

                        registrosMapeados.push({
                            puerto: this.clasificarPuerto(terminalLimpia, sheetName),
                            terminal: terminalLimpia,
                            // Capturamos el PIER buscando variaciones comunes que arroja XLSX
                            muelle: rowNormalizado['PIER'] || rowNormalizado['Pier'] || rowNormalizado['pier'] ? String(rowNormalizado['PIER'] || rowNormalizado['Pier'] || rowNormalizado['pier']).trim() : null,
                            motonave: nombreFinalNave,
                            lineaAgencia: rowNormalizado['AGENCY'] || rowNormalizado['LINEA/AGENCIA'] || null,
                            viaje: rowNormalizado['VIAJE'] ? String(rowNormalizado['VIAJE']).trim() : null,
                            eslora: rowNormalizado['ESLORA'] ? parseFloat(rowNormalizado['ESLORA']) : null,
                            eta: this.parsearFechaMaritima(rowNormalizado['DATEOFARRIVAL'] || rowNormalizado['ETA']),
                            fechaAtraque: this.parsearFechaMaritima(rowNormalizado['ETB'] || rowNormalizado['FECHADEATRAQUE']),
                            fechaZarpe: this.parsearFechaMaritima(rowNormalizado['ETC'] || rowNormalizado['ZARPE']),
                            trabajoOperacion: trabajoFinal || null,
                            posicion: rawStatus,
                            novedades: rowNormalizado['PRODUCT'] ? `Producto: ${rowNormalizado['PRODUCT']} | Puerto: ${rowNormalizado['PORTLOAD/DISCH'] || 'N/A'}` : null
                        });
                    } else {
                        // 🚨 Opcional: Log para saber qué barcos se quedaron fuera por no tener Terminal
                        console.warn(`Fila ignorada: El barco ${nombreFinalNave} no tiene TERMINAL asignada en el Excel.`);
                    }
                }

                superArrayNacional = [...superArrayNacional, ...registrosMapeados];
            });

            this.registrosProcesados = superArrayNacional;
            console.log(`📦 [A ENVIAR] Barcos limpios procesados listos para la API:`, this.registrosProcesados.length);
        };

        reader.readAsArrayBuffer(file);
    }

    // ============================================================================
    // 2. EL NUEVO DICCIONARIO (Pega esto justo debajo del método anterior)
    // ============================================================================
    private clasificarPuerto(terminalCruda: string, nombrePestana: string): string {
        const term = String(terminalCruda || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        const pest = String(nombrePestana || '').toUpperCase();

        if (term.includes('SPRBUN') || term.includes('TCBUEN') || term.includes('SPIA') ||
            term.includes('COMPASCAS') || term.includes('COMPASAGD') || term.includes('GRUPOPORT') ||
            pest.includes('BUENAVENTURA')) {
            return 'BUENAVENTURA';
        }

        if (term.includes('SPRC') || term.includes('CONTECAR') || term.includes('COMPASBOSQUE') ||
            term.includes('BOSQUE') || pest.includes('CARTAGENA')) {
            return 'CARTAGENA';
        }

        if (term.includes('SPRB') || term.includes('PALERMO') || term.includes('COMPASBARRANQUILLA') ||
            pest.includes('BARRANQUILLA')) {
            return 'BARRANQUILLA';
        }

        if (term.includes('SPSM') || pest.includes('SANTAMARTA')) {
            return 'SANTA MARTA';
        }

        if (pest.includes('ANTIOQUIA')) return 'PTO ANTIOQUIA';
        if (pest.includes('COVEÑAS')) return 'COVEÑAS';
        if (pest.includes('BRISA')) return 'PUERTO BRISA';
        if (pest.includes('TOLU')) return 'TOLU';

        return 'DESCONOCIDO';
    }

    // ============================================================================
    // 3. EL PARSEADOR DE FECHAS (Asegúrate de tenerlo también)
    // ============================================================================
    private parsearFechaMaritima(val: any): string | null {
        if (!val) return null;
        let str = String(val).toUpperCase().trim();
        if (str === 'TBC' || str === 'UNAVAILABLE' || str === '') return null;

        if (val instanceof Date && !isNaN(val.getTime())) {
            return val.toISOString();
        }

        try {
            const match = str.match(/^(\d{1,2})-([A-Z]{3})(?:\s+(AM|PM))?/);
            if (match) {
                const dia = match[1].padStart(2, '0');
                const mesStr = match[2];
                const ampm = match[3] || 'AM';

                const meses: { [key: string]: string } = {
                    'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
                    'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
                };

                const mes = meses[mesStr];
                if (mes) {
                    let hora = ampm === 'PM' ? '12:00:00' : '00:00:00';
                    return `2026-${mes}-${dia}T${hora}.000Z`;
                }
            }
        } catch (e) {
            console.warn('Error parseando fecha marítima:', str, e);
        }

        const parsed = new Date(val);
        return !isNaN(parsed.getTime()) ? parsed.toISOString() : null;
    }

    private formatearFechaExcel(fechaDato: any): string | null {
        if (!fechaDato) return null;
        if (fechaDato instanceof Date) {
            return isNaN(fechaDato.getTime()) ? null : fechaDato.toISOString();
        }
        const date = new Date(fechaDato);
        return isNaN(date.getTime()) ? null : date.toISOString();
    }

    // ==========================================
    // ENVÍO AL BACKEND
    // ==========================================
    procesarDocumento(): void {
        if (!this.selectedFile) return;

        this.isUploading = true;
        this.resetStatus();

        let observable$: Observable<any>;

        switch (this.tipoDocumento) {
            case 'LINEUP_EXCEL':
                // Validación de seguridad por si el excel venía vacío
                if (this.registrosProcesados.length === 0) {
                    this.isUploading = false;
                    this.mostrarError('El archivo no contiene registros válidos para ingesta.');
                    return;
                }
                // 🚨 Ojo: Asegúrate de agregar este método en tu IngestaService
                // Le enviamos el JSON extraído, NO el archivo File
                observable$ = this._ingestaService.subirLineUpMasivo(this.registrosProcesados);
                break;

            case 'RNDC_EXCEL':
                observable$ = this._ingestaService.subirExcelRNDC(this.selectedFile);
                break;

            case 'TRAFICO':
                observable$ = this._ingestaService.subirCsvMaritimo(this.selectedFile);
                break;

            case 'MATRIZ_BODEGAS':
                observable$ = this._ingestaService.subirMatrizOperaciones(this.selectedFile);
                break;

            default:
                this.isUploading = false;
                this.mostrarError('Tipo de documento no soportado o no seleccionado.');
                return;
        }

        observable$.subscribe({
            next: (res) => {
                this.isUploading = false;
                // Ajustamos para que soporte res.ok o res.success (Dependiendo de tu API)
                if (res.ok || res.success) {
                    this.uploadSuccess = true;
                    this.statusMessage = res.message || '¡Procesamiento exitoso!';

                    // Limpiamos los estados tras éxito
                    setTimeout(() => this.limpiarArchivo(), 3000);
                }
            },
            error: (err) => {
                this.isUploading = false;
                this.mostrarError(err.error?.message || err.error?.msg || 'Error de conexión con el servidor.');
            }
        });
    }

    public mostrarError(msg: string): void {
        this.uploadError = true;
        this.statusMessage = msg;
        setTimeout(() => this.resetStatus(), 5000); // Ocultar tras 5 seg
    }

    public resetStatus(): void {
        this.uploadSuccess = false;
        this.uploadError = false;
        this.statusMessage = '';
    }

    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
