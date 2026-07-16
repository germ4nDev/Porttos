// Angular Import
import { Component, OnInit } from '@angular/core';
import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { GradientConfig } from 'src/app/app-config';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  // public props
  gradientConfig;
  navCollapsed: boolean;
  navCollapsedMob: boolean;
  windowWidth: number;

  // constructor
  constructor(
    private location: Location,
    private locationStrategy: LocationStrategy
  ) {
    this.gradientConfig = GradientConfig;
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    this.windowWidth = window.innerWidth;
    if (
      current_url === baseHref + '/layout/collapse-menu' ||
      current_url === baseHref + '/layout/box' ||
      (this.windowWidth >= 992 && this.windowWidth <= 1024)
    ) {
      GradientConfig.isCollapse_menu = true;
    }
    this.navCollapsed = this.windowWidth >= 992 ? GradientConfig.isCollapse_menu : false;
    this.navCollapsedMob = false;
  }

  ngOnInit() {
    if (this.windowWidth < 992) {
      GradientConfig.layout = 'vertical';
      setTimeout(() => {
        document.querySelector('.pcoded-navbar')?.classList.add('menupos-static');
        (document.querySelector('#nav-ps-gradient-able') as HTMLElement).style.maxHeight = '100%'; // 100%
      }, 500);
    }
  }

  navMobClick() {
    if (this.windowWidth < 992) {
      if (this.navCollapsedMob && !document.querySelector('app-navigation.pcoded-navbar')?.classList.contains('mob-open')) {
        this.navCollapsedMob = !this.navCollapsedMob;
        setTimeout(() => {
          this.navCollapsedMob = !this.navCollapsedMob;
        }, 100);
      } else {
        this.navCollapsedMob = !this.navCollapsedMob;
      }
    }
  }
}
