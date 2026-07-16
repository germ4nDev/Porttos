import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'markdown',
    standalone: true // 👈 Al ser standalone, lo puedes importar directo en tu chat
})
export class MarkdownPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(value: string | undefined): SafeHtml {
        if (!value) return '';

        // Convertimos el Markdown a HTML usando marked
        const htmlRaw = marked.parse(value) as string;

        // Le decimos a Angular que confíe en este HTML generado internamente por la app
        return this.sanitizer.bypassSecurityTrustHtml(htmlRaw);
    }
}
