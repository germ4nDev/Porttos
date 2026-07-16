import { Component, Input } from '@angular/core';
import { NavigationItem } from '../../../../../shared/_helpers/models/Navigation.model';
import { animate, style, transition, trigger } from '@angular/animations';
import { GradientConfig } from 'src/app/app-config';
import { CommonModule } from '@angular/common';
import { NavItemComponent } from '../nav-item/nav-item.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { NavGroupComponent } from '../nav-group/nav-group.component';

@Component({
  selector: 'app-nav-collapse',
  standalone: true,
  imports: [CommonModule, NavItemComponent, NavGroupComponent, TranslateModule, RouterModule],
  templateUrl: './nav-collapse.component.html',
  styleUrls: ['./nav-collapse.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [style({ height: 0, overflow: 'hidden' }), animate('250ms ease-in', style({ height: '*', overflow: 'auto' }))]),
      transition(':leave', [animate('250ms ease-out', style({ height: 0, overflow: 'hidden' }))])
    ])
  ]
})
export class NavCollapseComponent {
  @Input() item!: NavigationItem;

  visible: boolean = false;
  gradientConfig = GradientConfig;
  themeLayout = GradientConfig.layout;

  navCollapse(event: MouseEvent): void {
    this.visible = !this.visible;
    const parent = (event.target as HTMLElement).closest('.pcoded-hasmenu');
    document.querySelectorAll('.pcoded-hasmenu').forEach((el) => {
      if (el !== parent) {
        el.classList.remove('pcoded-trigger');
      }
    });
    if (parent) {
      parent.classList.toggle('pcoded-trigger');
    }
  }
}
