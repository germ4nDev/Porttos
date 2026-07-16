// Angular Import
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  {
    path: '',
    // component: LayoutComponent,
    children: [
      {
        path: 'bibliotecas',
        loadComponent: () => import('./bibliotecas/bibliotecas.component').then(m => m.BibliotecasComponent)
      },
      {
        path: 'gestion-biblioteca',
        loadComponent: () => import('./bibliotecas/gestion-biblioteca/gestion-biblioteca.component').then(m => m.GestionBibliotecaComponent)
      },
      {
        path: 'galeria',
        loadComponent: () => import('./galerias/galerias.component').then(m => m.GaleriasComponent)
      },
      {
        path: 'gestion-galeria',
        loadComponent: () => import('./galerias/gestion-galeria/gestion-galeria.component').then(m => m.GestionGaleriaComponent)
      },
      {
        path: 'tipos-galeria',
        loadComponent: () => import('./tipos-galeria/tipos-galeria.component').then(m => m.TiposGaleriaComponent)
      },
      {
        path: 'gestion-tipos-galeria',
        loadComponent: () =>
          import('./tipos-galeria/gestion-tiposGaleria/gestion-tipos-galeria.component').then(m => m.GestionTiposGaleriaComponent)
      },
      {
        path: 'formatos-galeria',
        loadComponent: () => import('./formatos-galeria/formatos-galeria.component').then(m => m.FormatosGaleriaComponent)
      },
      {
        path: 'gestion-formatos-galeria',
        loadComponent: () =>
          import('./formatos-galeria/gestion-formatos-galeria/gestion-formatos-galeria.component').then(
            m => m.GestionFormatosGaleriaComponent
          )
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BibliotecasRoutingModule {}
