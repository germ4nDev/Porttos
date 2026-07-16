import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-pdf-generator',
  standalone: true,
  imports: [CommonModule],
  template: './pdf-generatpr.component.html',
  styles: './pdf-generator.component.scss'
})
export class PdfGeneratorComponent {
  @ViewChild('pdfContent') pdfContent!: ElementRef;

  @Input() headerTemplate: string = 'Mi Cabecera Personalizada';
  @Input() footerTemplate: string = 'Página {{pageNum}} de {{totalPages}}';

  public async generatePdf(): Promise<void> {
    const data = this.pdfContent.nativeElement;

    const canvas = await html2canvas(data, {
      scale: 2
    });

    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = doc.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = doc.internal.pageSize.getHeight();
    let heightLeft = imgHeight;
    let position = 0;

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const totalPages = doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      this.addHeaderAndFooter(doc, i, totalPages);
    }

    doc.save('documento.pdf');
  }

  /**
   * Agrega la cabecera y el pie de página al documento PDF.
   * @param {jsPDF} doc - La instancia del documento jsPDF.
   * @param {number} currentPage - El número de la página actual.
   * @param {number} totalPages - El número total de páginas.
   */
  private addHeaderAndFooter(doc: jsPDF, currentPage: number, totalPages: number): void {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(10);
    doc.text(this.headerTemplate, pageWidth / 2, 10, { align: 'center' });

    const footerText = this.footerTemplate.replace('{{pageNum}}', currentPage.toString()).replace('{{totalPages}}', totalPages.toString());
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }
}
