// Angular Import
import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-ui-modal',
  templateUrl: './ui-modal.component.html',
  styleUrls: ['./ui-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UiModalComponent {
  // public props
  @Input() dialogClass!: string;
  @Input() hideHeader = false;
  @Input() hideFooter = false;
  @Input() containerClick = true;
  visible = false;
  visibleAnimate = false;

  // public method
  show(): void {
    this.visible = true;
    setTimeout(() => (this.visibleAnimate = true), 100);
    (document.querySelector('body') as HTMLBodyElement).classList.add('modal-open');
  }

  hide(): void {
    this.visibleAnimate = false;
    setTimeout(() => (this.visible = false), 300);
    (document.querySelector('body') as HTMLBodyElement).classList.remove('modal-open');
  }

  onContainerClicked(event: MouseEvent): void {
    if ((<HTMLElement>event.target).classList.contains('modal') && this.containerClick === true) {
      this.hide();
    }
  }
}
