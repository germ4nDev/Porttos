// Angular Import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'items',
                loadComponent: () => import('./items/items.component').then(m => m.ItemsComponent)
            },
            {
                path: 'gestion-item',
                loadComponent: () => import('./items/gestion-item/gestion-item.component').then(m => m.GestionItemComponent)
            },
            {
                path: 'tipos-items',
                loadComponent: () => import('./tipos-item/tipos-items.component').then(m => m.TiposItemComponent)
            },
            {
                path: 'gestion-tipo',
                loadComponent: () => import('./tipos-item/gestion-tipo/gestion-tipo.component').then(m => m.GestionTipoComponent)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ListaPreciosRoutingModule { }
