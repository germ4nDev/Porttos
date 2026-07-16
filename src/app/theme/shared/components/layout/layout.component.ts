import { CommonModule } from '@angular/common';
import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigurationComponent } from 'src/app/theme/layout/admin/configuration/configuration.component';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavigationItem } from 'src/app/theme/layout/admin/navigation/navigation';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, NavBarComponent, NavContentComponent, ConfigurationComponent, TranslateModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  @Input() menuItems: NavigationItem[] = [];
  //   @Input() hasFilters = false;
  @ContentChild('filters', { static: false, read: TemplateRef }) filtersContent?: TemplateRef<any>;

  @Input() activeTab: 'menu' | 'filters' | 'main' = 'filters';
  showConfig: boolean = false;

  constructor() {
    console.log('elementos del menu', this.menuItems);

  }

  get hasFiltersSlot(): boolean {
    return !!this.filtersContent;
  }

  toggleConfigPanel() {

  }
}
