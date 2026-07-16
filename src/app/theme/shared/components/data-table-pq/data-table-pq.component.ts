/* eslint-disable valid-typeof */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import * as XLSX from 'xlsx';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  //   ViewChildren,
  //   QueryList,
  //   ElementRef,
  AfterViewInit,
  Renderer2
} from '@angular/core';
import { ColumnMetadata } from '../../_helpers/models/ColumnMetadata.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-data-table-pq',
  standalone: true,
  templateUrl: './data-table-pq.component.html',
  styleUrls: ['./data-table-pq.component.scss'],
  imports: [CommonModule, TranslateModule, FormsModule]
})
export class DatatablePqComponent implements OnInit, OnChanges, AfterViewInit {
  //   @ViewChildren('customButton', { read: ElementRef }) customButtons!: QueryList<ElementRef>;

  @Input() data: any[] = [];
  @Input() metadataColumns: any[] = [];
  @Input() metadataDetailColumns: any[] = [];
  @Input() columnTitles: string[] = [];
  @Input() detailColumns: string[] = [];
  @Input() detailTitles: string[] = [];

  @Input() idField: string = 'id';
  @Input() tableTitle: string = '';
  @Input() exportLabel: string = 'Exportar Excel';
  @Input() newButtonLabel: string = 'Nuevo Registro';
  @Input() backButtonLabel: string = 'Regresar';
  @Input() buttonsClass: string = 'btn btn-primary';

  @Input() colorOpcion1: string = '#007bff';
  @Input() colorOpcion2: string = '#007bff';
  @Input() colorOpcion3: string = '#007bff';
  @Input() colorOpcion4: string = '#007bff';
  @Input() colorOpcion5: string = '#007bff';
  @Input() tooltipOption1: string = '';
  @Input() tooltipOption2: string = '';
  @Input() tooltipOption3: string = '';
  @Input() tooltipOption4: string = '';
  @Input() tooltipOption5: string = '';
  @Input() letraOpcion1: string = 'O';
  @Input() letraOpcion2: string = 'O';
  @Input() letraOpcion3: string = 'O';
  @Input() letraOpcion4: string = 'O';
  @Input() letraOpcion5: string = 'O';

  @Input() showDetail: boolean = false;
  @Input() showSearchBox: boolean = true;
  @Input() showAvatar: boolean = false;
  @Input() showImage: boolean = false;
  @Input() showActions: boolean = true;
  @Input() showBackButton: boolean = false;
  @Input() showExportButton: boolean = false;
  @Input() showNewButton: boolean = false;
  @Input() showViewButton: boolean = false;
  @Input() showEditButton: boolean = false;
  @Input() showDeleteButton: boolean = false;
  @Input() showOption1Button: boolean = false;
  @Input() showOption2Button: boolean = false;
  @Input() showOption3Button: boolean = false;
  @Input() showOption4Button: boolean = false;
  @Input() showOption5Button: boolean = false;
  @Input() showOption6Button: boolean = false;

  @Output() backRecord = new EventEmitter<void>();
  @Output() viewRecord = new EventEmitter<void>();
  @Output() newRecord = new EventEmitter<void>();
  @Output() editRecord = new EventEmitter<any>();
  @Output() deleteRecord = new EventEmitter<any>();
  @Output() excelExport = new EventEmitter<void>();
  @Output() option1Record = new EventEmitter<void>();
  @Output() option2Record = new EventEmitter<void>();
  @Output() option3Record = new EventEmitter<void>();
  @Output() option4Record = new EventEmitter<void>();
  @Output() option5Record = new EventEmitter<void>();
  @Output() option6Record = new EventEmitter<void>();

  public finalColumns: ColumnMetadata[] = [];
  public filteredData: any[] = [];
  public paginatedData: any[] = [];
  public currentPage: number = 1;
  public itemsPerPage: number = 10;
  public totalPages: number = 1;
  public filterValues: { [key: string]: string } = {};
  public sortByColumn: string | null = null;
  public sortDirection: 'asc' | 'desc' = 'asc';
  public registroId: number | null = null;

  public option1ButtonColor: string = '#007bff';
  public option2ButtonColor: string = '#28a745';
  public option3ButtonColor: string = '#dc3545';

  constructor(
    private sanitizer: DomSanitizer,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    // Llama a la lógica SOLO cuando los elementos están listos
  }

  safeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  ngOnInit(): void {
    this.processDataAndColumns();
    this.ngAfterViewInit();
    // this.setButtonColors();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['metadataColumns']) {
      this.currentPage = 1;
      this.processDataAndColumns();
    }
  }

  processDataAndColumns(): void {
    if (!this.data || this.data.length === 0) {
      this.finalColumns = [];
      this.filteredData = [];
      this.paginatedData = [];
      this.totalPages = 1;
      return;
    }

    if (this.metadataColumns && this.metadataColumns.length > 0) {
      this.finalColumns = this.metadataColumns.map((col) => {
        if (typeof col === 'string') {
          return this.generateMetadata(col, this.data[0][col]);
        }
        return col as ColumnMetadata;
      });
    } else {
      this.finalColumns = this.generateInferredMetadata(this.data[0]);
    }

    this.applyFiltersAndPagination();
  }

  private generateInferredMetadata(firstRow: any): ColumnMetadata[] {
    const metadata: ColumnMetadata[] = [];

    for (const key in firstRow) {
      if (firstRow.hasOwnProperty(key)) {
        metadata.push(this.generateMetadata(key, firstRow[key]));
      }
    }
    return metadata;
  }

  private generateMetadata(key: string, value: any): ColumnMetadata {
    let type: ColumnMetadata['type'] = 'text';
    if (Array.isArray(value)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('tags') || lowerKey.includes('permisos') || lowerKey.includes('roles')) {
        type = 'array_tags';
      } else {
        type = 'array_text';
      }
    } else if (key.toLowerCase().includes('color') || key.toLowerCase().includes('hex')) {
      type = 'color_chip';
    } else if (typeof value === 'number') {
      type = 'number';
    } else if (key.toLowerCase().includes('foto') || key.toLowerCase().includes('avatar')) {
      type = 'avatar';
    } else if (key.toLowerCase().includes('imagen') || key.toLowerCase().includes('img')) {
      type = 'image';
    } else if (key.toLowerCase().includes('capture')) {
      type = 'capture';
    } else if (
      value &&
      typeof value === 'string' &&
      value.length > 5 &&
      value &&
      new Date(value).toString() !== 'Invalid Date' &&
      !isNaN(new Date(value) as any)
    ) {
      type = 'date';
    }

    return {
      name: key,
      header: key,
      type: type,
      isSortable: type !== 'avatar' && type !== 'image' && type !== 'capture' && type !== 'array_text' && type !== 'array_tags'
    };
  }

  applyFiltersAndPagination(): void {
    let tempFilteredData = this.data.filter((row) => {
      for (const key of Object.keys(this.filterValues)) {
        const filterValue = this.filterValues[key].toLowerCase();
        const rowValue = String(row[key] || '').toLowerCase();
        if (filterValue && !rowValue.includes(filterValue)) {
          return false;
        }
      }
      return true;
    });
    if (this.sortByColumn) {
      tempFilteredData = this.sortData(tempFilteredData);
    }
    this.filteredData = tempFilteredData;
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages > 0 ? this.totalPages : 1;
    } else if (this.currentPage < 1) {
      this.currentPage = 1;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedData = this.filteredData.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onSort(columnName: string): void {
    const columnMeta = this.finalColumns.find((c) => c.name === columnName);
    if (columnMeta && columnMeta.isSortable === false) {
      return;
    }
    if (this.sortByColumn === columnName) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortByColumn = columnName;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndPagination();
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndPagination();
    }
  }

  sortData(data: any[]): any[] {
    const column = this.sortByColumn;
    if (!column) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
      let comparison = 0;

      const columnType = this.finalColumns.find((c) => c.name === column)?.type;
      if (columnType === 'number') {
        const numA = Number(aValue);
        const numB = Number(bValue);
        if (!isNaN(numA) && !isNaN(numB)) {
          comparison = numA - numB;
        }
      } else {
        const strA = String(aValue || '');
        const strB = String(bValue || '');
        if (strA > strB) {
          comparison = 1;
        } else if (strA < strB) {
          comparison = -1;
        }
      }
      return this.sortDirection === 'desc' ? comparison * -1 : comparison;
    });
  }

  getPages(): number[] {
    const maxPagesToShow = 5;
    const pages: number[] = [];
    let startPage: number;
    let endPage: number;

    if (this.totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = this.totalPages;
    } else {
      startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
      endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onView(row: any): void {
    this.viewRecord.emit(row[this.idField]);
  }

  onEdit(row: any): void {
    console.log('fieldId', this.idField);
    this.editRecord.emit(row[this.idField]);
  }

  onBackClick() {
    this.backRecord.emit();
  }

  OnViewRegistroClick(row: any): void {
    console.log('fieldId', this.idField);
    this.viewRecord.emit(row[this.idField]);
  }

  onDelete(row: any): void {
    this.deleteRecord.emit({ id: row[this.idField] });
  }

  onFilter(column: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filterValues[column] = target.value;
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  onNewRecord(): void {
    this.newRecord.emit();
  }

  onOption1(row: any): void {
    console.log('fieldId', this.idField);
    this.option1Record.emit(row[this.idField]);
  }

  onOption2(row: any): void {
    this.option2Record.emit(row[this.idField]);
  }

  onOption3(row: any): void {
    this.option3Record.emit(row[this.idField]);
  }

  onOption4(row: any): void {
    this.option4Record.emit(row[this.idField]);
  }

  onOption5(row: any): void {
    this.option5Record.emit(row[this.idField]);
  }

  onOption6(row: any): void {
    this.option6Record.emit(row[this.idField]);
  }

  onExcelExport(): void {
    this.excelExport.emit();
    const exportData = this.filteredData.map((row) => {
      const newRow: any = {};
      this.finalColumns.forEach((col) => {
        newRow[col.header] = row[col.name];
      });
      return newRow;
    });
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, this.tableTitle || 'Datos');
    const hoy = new Date();
    const timestamp = hoy.getTime();
    const bookName = (this.tableTitle || 'export') + '_' + timestamp + '.xlsx';
    XLSX.writeFile(wb, bookName);
  }

  toggleDetails(row: any): void {
    this.registroId = this.registroId === row[this.idField] ? null : row[this.idField];
  }

  hexToRgb(hex: any) {
    if (!hex) return '0, 0, 0';
    // Quita el '#'
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m: any, r: any, g: any, b: any) {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    // Retorna los componentes R, G, B separados por coma
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  }

  setButtonColors() {
    // this.customButtons.forEach((elRef: ElementRef) => {
    //   const button: HTMLElement = elRef.nativeElement;
    //   console.log('datos del hijueputa boton', button);
    //   const hexColor = button.getAttribute('data-hex');
    //   const hoverTextColor = button.getAttribute('data-text-hover') || '#FFFFFF';
    //   if (hexColor) {
    //     const rgbColor = this.hexToRgb(hexColor);
    //   console.log('ex hex color del boton', hexColor);
    //   console.log('ex rgb color del boton', rgbColor);
    //     this.renderer.setStyle(button, '--custom-color-main', hexColor);
    //     this.renderer.setStyle(button, '--custom-color-rgb', rgbColor);
    //     this.renderer.setStyle(button, '--custom-color-hover-text', hoverTextColor);
    //   }
    // });
  }
}
