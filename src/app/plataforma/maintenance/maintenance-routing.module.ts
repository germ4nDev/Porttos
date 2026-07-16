// Angular Import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'offline-ui',
        loadComponent: () => import('./mainten-offline-ui/mainten-offline-ui.component')
      },
      {
        path: 'coming-soon',
        loadComponent: () => import('./mainten-coming-soon/mainten-coming-soon.component')
      },
      {
        path: 'error',
        loadComponent: () => import('./mainten-error/mainten-error.component')
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaintenanceRoutingModule {}
