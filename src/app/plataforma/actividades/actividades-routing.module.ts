// Angular Import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    // component: LayoutComponent,
    children: [
      {
        path: 'actividades',
        loadComponent: () => import('./actividades/actividades.component').then((m) => m.ActividadesComponent)
      },
      {
        path: 'gestion-actividad',
        loadComponent: () => import('./actividades/gestiion-actividad/gestiion-actividad.component').then((m) => m.GestiionActividadComponent)
      },
      {
        path: 'actividades-roles',
        loadComponent: () =>
          import('./actividades-roles/actividades-roles.component').then((m) => m.ActividadesRolesComponent)
      },
      {
        path: 'gestion-actividad-roles',
        loadComponent: () =>
          import('./actividades-roles/gestion-actividad-role/gestion-actividad-role.component').then((m) => m.GestionActividadRoleComponent)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActividadesRoutingModule {}
