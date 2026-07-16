// Angular Import
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'static',
        loadComponent: () => import('./theme-static/theme-static.component')
      },
      {
        path: 'fixed',
        loadComponent: () => import('./theme-fixed/theme-fixed.component')
      },
      {
        path: 'nav-fixed',
        loadComponent: () => import('./theme-nav-fixed/theme-nav-fixed.component')
      },
      {
        path: 'collapse-menu',
        loadComponent: () => import('./theme-collapse-menu/theme-collapse-menu.component')
      },
      {
        path: 'vertical-rtl',
        loadComponent: () => import('./theme-rtl-v/theme-rtl-v.component')
      },
      {
        path: 'horizontal',
        loadComponent: () => import('./theme-horizontal/theme-horizontal.component')
      },
      {
        path: 'horizontal-l2',
        loadComponent: () => import('./theme-horizontal-l2/theme-horizontal-l2.component')
      },
      {
        path: 'box',
        loadComponent: () => import('./theme-box/theme-box.component')
      },
      {
        path: 'light',
        loadComponent: () => import('./theme-light/theme-light.component')
      },
      {
        path: 'dark',
        loadComponent: () => import('./theme-dark/theme-dark.component')
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {}
