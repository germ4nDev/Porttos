// Angular import
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTodoCardComplete]'
})
export class TodoCardCompleteDirective {
  // constructor
  constructor(private elements: ElementRef) {}

  // public method
  @HostListener('click', ['$event'])
  // eslint-disable-next-line
  onToggle($event: any) {
    $event.preventDefault();
    this.elements.nativeElement.classList.toggle('complete');
  }
}
