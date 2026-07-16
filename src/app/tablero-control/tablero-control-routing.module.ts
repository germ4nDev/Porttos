import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        // component: DashboardPanelComponent,
        children: [
            {
                path: '',
                redirectTo: 'dahboard-panel',
                pathMatch: 'full'
            },
            {
                path: 'dahboard-panel',
                loadComponent: () => import('./dashboard-panel/dashboard-panel.component')
                    .then(c => c.DashboardPanelComponent)
            },
            {
                path: 'panel-control',
                loadComponent: () => import('./panel-control/panel-control.component')
                    .then(c => c.PanelControlComponent)
            },
            {
                path: 'ingesta-panel',
                loadComponent: () => import('./ingesta-panel/ingesta-panel.component')
                    .then(c => c.IngestaPanelComponent)
            },
            {
                path: 'torre-control',
                loadComponent: () => import('./torre-control/torre-control.component')
                    .then(c => c.TorreControlComponent)
            },
            {
                path: 'widget-panel',
                loadComponent: () => import('./widgets-panel/widgets-panel.component')
                    .then(c => c.WidgetsPanelComponent)
            },
            {
                path: 'gestion-widget',
                loadComponent: () => import('./widgets-panel/gestion-widget/gestion-widget.component')
                    .then(c => c.GestionWidgetComponent)
            },
            {
                path: 'puertos-panel',
                loadComponent: () => import('./puertos-panel/puertos-panel.component')
                    .then(c => c.PuertosPanelComponent)
            },
            {
                path: 'gestion-puerto-panel',
                loadComponent: () => import('./puertos-panel/gestion-pueerto-panel/gestion-pueerto-panel.component')
                    .then(c => c.GestionPueertoPanelComponent)
            },
            {
                path: 'terminales-panel',
                loadComponent: () => import('./terminales-panel/terminales-panel.component')
                    .then(c => c.TerminalesPanelComponent)
            },
            {
                path: 'gestion-terminal-panel',
                loadComponent: () => import('./terminales-panel/gestion-terminal-panel/gestion-terminal-panel.component')
                    .then(c => c.GestionTerminalPanelComponent)
            },
            {
                path: 'muelles-panel',
                loadComponent: () => import('./muelles-panel/muelles-panel.component')
                    .then(c => c.MuellesPanelComponent)
            },
            {
                path: 'gestion-muelle-panel',
                loadComponent: () => import('./muelles-panel/gestion-muelle-panel/gestion-muelle-panel.component')
                    .then(c => c.GestionMuellePanelComponent)
            },
            {
                path: 'infraestructuras-panel',
                loadComponent: () => import('./infraestructuras-panel/infraestructuras-panel.component')
                    .then(c => c.InfraestructurasPanelComponent)
            },
            {
                path: 'gestion-infraestructura',
                loadComponent: () => import('./infraestructuras-panel/gestion-infraestructura/gestion-infraestructura.component')
                    .then(c => c.GestionInfraestructuraComponent)
            },
            {
                path: 'tipos-infraestructura-panel',
                loadComponent: () => import('./tipos-infraestructura-panel/tipos-infraestructura-panel.component')
                    .then(c => c.TiposInfraestructuraPanelComponent)
            },
            {
                path: 'gestion-tipo-infraestructura',
                loadComponent: () => import('./tipos-infraestructura-panel/gestion-tipo-infraestructura/gestion-tipo-infraestructura.component')
                    .then(c => c.GestionTipoInfraestructuraComponent)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TableroControlRoutingModule { }
