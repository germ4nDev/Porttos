import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dynamic-table',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dynamic-table.component.html',
    styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent implements OnChanges {
    // Recibimos la data usando el Input tradicional
    @Input() data: any = null;

    public columns: string[] = [];
    public tableData: any[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] && this.data) {
            this.procesarDatos(this.data);
        }
    }

    private procesarDatos(rawData: any) {
        if (!rawData) {
            this.resetTable();
            return;
        }

        // Aseguramos que trabajamos con un arreglo (por si el backend manda el JSON envuelto)
        const items = Array.isArray(rawData) ? rawData : (rawData.data || rawData.rows || []);

        if (items.length > 0) {
            this.tableData = items;
            // Extraemos los nombres de las propiedades del primer objeto para crear las columnas
            this.columns = Object.keys(items[0]);
        } else {
            this.resetTable();
        }
    }

    private resetTable() {
        this.tableData = [];
        this.columns = [];
    }
}
