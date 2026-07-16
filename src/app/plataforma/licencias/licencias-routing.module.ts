// Angular Import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'licencias-afiliado',
        loadComponent: () => import('./licencias-afiliado/licencias-afiliado.component').then(m => m.LicenciasAfiliadoComponent)
      },
      {
        path: 'gestion-licencia-afiliado',
        loadComponent: () => import('./licencias-afiliado/gestion-licencia-afiliado/gestion-licencia-afiliado.component').then(m => m.GestionLicenciaAfiliadoComponent)
      },
      {
        path: 'adiciones-sustracciones',
        loadComponent: () => import('./adiciones-sustracciones/adiciones-sustracciones.component').then(m => m.AdicionesSustraccionesComponent)
      },
      {
        path: 'gestion-adicion',
        loadComponent: () => import('./adiciones-sustracciones/gestion-adicion/gestion-adicion.component').then(m => m.GestionAdicionComponent)
      },
      {
        path: 'historial-pagos',
        loadComponent: () => import('./historial-pagos/historial-pagos.component').then(m => m.HistorialPagosComponent)
      },
      {
        path: 'gestion-pago',
        loadComponent: () => import('./historial-pagos/gestion-pago/gestion-pago.component').then(m => m.GestionPagoComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LicenciasRoutingModule {}
