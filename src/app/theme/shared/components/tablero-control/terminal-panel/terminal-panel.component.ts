import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-terminal-panel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './terminal-panel.component.html',
    styleUrls: ['./terminal-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TerminalPanelComponent {
    @Input() nombreTerminal: string = '';
    @Input() estado: 'operando' | 'congestion' | 'mantenimiento' = 'operando';
}
