// Angular Import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    // component: LayoutComponent,
    children: [
      {
        path: 'aplicaciones',
        loadComponent: () => import('./aplicaciones/aplicaciones.component').then((m) => m.AplicacionesComponent)
      },
      {
        path: 'gestion-aplicacion',
        loadComponent: () =>
          import('./aplicaciones/gestion-aplicacion/gestion-aplicacion.component').then((m) => m.GestionAplicacionComponent)
      },
      {
        path: 'suites',
        loadComponent: () => import('./suites/suites.component').then((m) => m.SuitesComponent)
      },
      {
        path: 'gestion-suite',
        loadComponent: () => import('./suites/gestion-suite/gestion-suite.component').then((m) => m.GestionSuiteComponent)
      },
      {
        path: 'modulos',
        loadComponent: () => import('./modulos/modulos.component').then((m) => m.ModulosComponent)
      },
      {
        path: 'gestion-modulo',
        loadComponent: () => import('./modulos/gestion-modulo/gestion-modulo.component').then((m) => m.GestionModuloComponent)
      },
      {
        path: 'versiones',
        loadComponent: () => import('./versiones/versiones.component').then((m) => m.VersionesComponent)
      },
      {
        path: 'gestion-version',
        loadComponent: () => import('./versiones/gestion-version/gestion-version.component').then((m) => m.GestionVersionComponent)
      },
      {
        path: 'paquetes',
        loadComponent: () => import('./paquetes/paquetes.component').then((m) => m.PaquetesComponent)
      },
      {
        path: 'gestion-paquete',
        loadComponent: () => import('./paquetes/gestion-paquete/gestion-paquete.component').then((m) => m.GestionPaqueteComponent)
      },
      {
        path: 'items-paquete',
        loadComponent: () => import('./paquetes/items-paquete/items-paquete.component').then((m) => m.ItemsPaqueteComponent)
      },
      {
        path: 'modulos-paquete',
        loadComponent: () => import('./paquetes/modulos-paquete/modulos-paquete.component').then((m) => m.ModulosPaqueteComponent)
      },
      {
        path: 'gestion-itempq',
        loadComponent: () => import('./paquetes/items-paquete/gestion-itempq/gestion-itempq.component').then((m) => m.GestionItempqComponent)
      },
      {
        path: 'gestion-modulopq',
        loadComponent: () => import('./paquetes/modulos-paquete/gestion-modulopq/gestion-modulopq.component').then((m) => m.GestionModulopqComponent)
      },
      {
        path: 'estadisticas',
        loadComponent: () => import('./estadisticas/estadisticas.component').then((m) => m.EstadisticasComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AplicacionesRoutingModule {}
