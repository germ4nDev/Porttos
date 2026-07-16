// Angular Import
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavSearchComponent } from './nav-search/nav-search.component';

@Component({
  selector: 'app-nav-left',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-left.component.html',
  styleUrls: ['./nav-left.component.scss']
})
export class NavLeftComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor() {
    console.log('abriendo navbar-left');
  }

  onToggleClick() {
    this.toggleSidebar.emit();
  }
}
