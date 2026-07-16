import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { SwalAlertService } from '../../service/swal-alert.service';

@Component({
    selector: 'app-excel-uploader',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './excel-loader.component.html',
    styleUrls: ['./excel-loader.component.scss'],
})
export class ExcelUploaderComponent {
    @Input() apiUrl!: string; // URL donde se hará el POST
    @Input() columnsMap!: { [key: string]: string };
    @Input() extraData: any = {};

    archivoSeleccionado: File | null = null;

    constructor(
        private http: HttpClient,
        private swal: SwalAlertService
    ) { }

    onFileChange(event: any): void {
        const target: DataTransfer = <DataTransfer>(event.target);
        if (target.files.length !== 1) {
            this.swal.getAlertError('Solo puedes seleccionar un archivo a la vez.');
            return;
        }
        this.archivoSeleccionado = target.files[0];
    }

    procesarYEnviar(fileInput: HTMLInputElement): void {
        if (!this.archivoSeleccionado || !this.apiUrl || !this.columnsMap) {
            this.swal.getAlertError('Faltan parámetros de configuración (URL o Mapa de columnas).');
            return;
        }

        this.swal.showLoading('Leyendo archivo Excel...');

        const reader: FileReader = new FileReader();

        // Cuando el archivo termine de leerse...
        reader.onload = (e: any) => {
            try {
                const bstr: string = e.target.result;
                const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

                // Tomamos la primera hoja del Excel
                const wsname: string = wb.SheetNames[0];
                const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                // Convertimos la hoja a un Array de JSONs
                const dataOriginal = XLSX.utils.sheet_to_json(ws);

                // Transformamos los datos según el columnsMap
                const dataFormateada = this.transformarDatos(dataOriginal);

                // Enviamos a la API
                this.enviarApi(dataFormateada, fileInput);

            } catch (error) {
                this.swal.getAlertError('Error al leer el archivo Excel. Verifica el formato.');
                console.error(error);
            }
        };

        // Iniciar la lectura del archivo
        reader.readAsBinaryString(this.archivoSeleccionado);
    }

    // Organiza los datos del Excel para que coincidan con tu Base de Datos
    private transformarDatos(dataOriginal: any[]): any[] {
        return dataOriginal.map(filaOriginal => {
            const filaNueva: any = { ...this.extraData }; // Agregamos data extra (ej. idEmpresa)

            // Iteramos sobre las llaves del mapa (las columnas que esperamos del Excel)
            Object.keys(this.columnsMap).forEach(columnaExcel => {
                const columnaBD = this.columnsMap[columnaExcel];

                // Si la fila del Excel tiene esa columna, la asignamos al nuevo nombre de BD
                if (filaOriginal[columnaExcel] !== undefined) {
                    filaNueva[columnaBD] = filaOriginal[columnaExcel];
                }
            });

            return filaNueva;
        });
    }

    private enviarApi(payload: any[], fileInput: HTMLInputElement): void {
        this.swal.showLoading('Guardando registros en la base de datos...');

        // Asumimos que tu backend recibe un array de objetos (ej. bulkCreate en Sequelize)
        this.http.post(this.apiUrl, { registros: payload }).subscribe({
            next: (resp: any) => {
                this.swal.getAlertConfirmSuccess(`Se guardaron ${payload.length} registros correctamente.`);
                this.resetearInput(fileInput);
            },
            error: (err) => {
                this.swal.getAlertError('Hubo un error al guardar los datos en el servidor.');
                console.error('Error API:', err);
            }
        });
    }

    private resetearInput(fileInput: HTMLInputElement) {
        fileInput.value = ''; // Limpia el input HTML
        this.archivoSeleccionado = null; // Limpia la variable
    }
}
