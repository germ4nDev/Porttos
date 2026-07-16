import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'scripts',
        loadComponent: () => import('./scripts/scripts.component').then((m) => m.ScriptsComponent)
      },
      {
        path: 'gestion-script',
        loadComponent: () => import('./scripts/gestion-script/gestion-script.component').then((m) => m.GestionScriptComponent)
      },
      {
        path: 'servidores',
        loadComponent: () => import('./servidores/servidores.component').then((m) => m.ServidoresComponent)
      },
      {
        path: 'gestion-servidor',
        loadComponent: () => import('./servidores/gestion-servidor/gestion-servidor.component').then((m) => m.GestionServidorComponent)
      },
      {
        path: 'estadisticas',
        loadComponent: () => import('./estadisticas/estadisticas.component').then((m) => m.EstadisticasComponent)
      },
      {
        path: 'tipos-scripts',
        loadComponent: () => import('./tipos-scripts/tipos-scripts.component').then((m) => m.TiposScriptsComponent)
      },
      {
        path: 'gestion-tipo',
        loadComponent: () => import('./tipos-scripts/gestion-tipo/gestion-tipo.component').then((m) => m.GestionTipoComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministracionBDRoutingModule {}
