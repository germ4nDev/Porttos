import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../../../layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from '../../../layout/admin/navigation/nav-content/nav-content.component';
import { NavigationItem } from '../../_helpers/models/Navigation.model';

@Component({
  selector: 'app-layout-wrapper',
  standalone: true,
  imports: [CommonModule, NavBarComponent, NavContentComponent],
  templateUrl: './layout-wrapper.component.html',
  styleUrls: ['./layout-wrapper.component.scss']
})
export class LayoutWrapperComponent {
  @Input() navigationItems: NavigationItem[] = [];
}
