// Angular Import
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  // public props
  @Input() type!: string;
  @Input() dismiss!: string;

  // public method
  dismissAlert(element: { remove: () => void }) {
    element.remove();
  }
}
