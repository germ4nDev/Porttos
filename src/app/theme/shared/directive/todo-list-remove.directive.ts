// Angular import
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTodoListRemove]'
})
export class TodoListRemoveDirective {
  // constructor
  constructor(private elements: ElementRef) {}

  // public method
  @HostListener('click', ['$event'])
  // eslint-disable-next-line
  onToggle($event: any) {
    $event.preventDefault();
    const parent = this.elements.nativeElement.parentElement.parentElement;
    parent.remove();
  }
}
