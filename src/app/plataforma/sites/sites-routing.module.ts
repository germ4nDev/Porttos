// Angular Import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'sites',
        loadComponent: () => import('./sites/sites.component').then((m) => m.SitesComponent)
      },
      {
        path: 'gestion-site',
        loadComponent: () => import('./sites/gestion-site/gestion-site.component').then((m) => m.GestionSiteComponent)
      },
      {
        path: 'enlaces',
        loadComponent: () => import('./enlaces/enlaces.component').then((m) => m.EnlacesComponent)
      },
      {
        path: 'gestion-enlace',
        loadComponent: () => import('./enlaces/gestion-enlace/gestion-enlace.component').then((m) => m.GestionEnlaceComponent)
      },
      {
        path: 'contenidos',
        loadComponent: () => import('./contenidos/contenidos.component').then((m) => m.ContenidosComponent)
      },
      {
        path: 'gestion-contenido',
        loadComponent: () => import('./contenidos/gestion-contenido/gestion-contenido.component').then((m) => m.GestonContenidoComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SitesRoutingModule {}
