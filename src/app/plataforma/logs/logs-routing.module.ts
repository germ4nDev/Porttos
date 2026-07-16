// Angular Import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
        {
            path: 'log-actividades',
            loadComponent: () => import('./log-actividades/log-actividades.component').then(m => m.LogActividadesComponent)
        },
        {
            path: 'log-actualizaciones',
            loadComponent: () => import('./log-actualizaciones/log-actualizaciones.component').then(m => m.LogActualizacionesComponent)
        },
        {
            path: 'log-transacciones',
            loadComponent: () => import('./log-transacciones/log-transacciones.component').then(m => m.LogTransaccionesComponent)
        },
        {
            path: 'estadisticas',
            loadComponent: () => import('./estadisticas/estadisticas.module').then(m => m.EstadisticasModule)
        },
        {
            path: 'tipos-logs',
            loadComponent: () => import('./tipos-logs/tipos-logs.component').then(m => m.TiposLogsComponent)
        }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogsRoutingModule {}
