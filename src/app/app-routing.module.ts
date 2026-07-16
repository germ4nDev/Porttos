// Angular Import
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// project import
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
// import { AuthGuard } from './theme/shared/_helpers/auth.guard';

const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        // canActivateChild: [AuthGuard],
        // canLoad: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: '/autenticacion/login',
                pathMatch: 'full'
            },
            {
                path: 'administracion-bd',
                loadChildren: () =>
                    import('./plataforma/administracion-bd/administracion-bd.module').then((module) => module.AdministracionBDModule)
            },
            {
                path: 'layout',
                loadChildren: () => import('./plataforma/layout/layout.module').then((module) => module.LayoutModule)
            },
            {
                path: 'suscriptor',
                loadChildren: () => import('./plataforma/suscriptor/suscriptor.module').then((module) => module.SuscriptorModule)
            },
            {
                path: 'aplicaciones',
                loadChildren: () => import('./plataforma/aplicaciones/aplicaciones.module').then((module) => module.AplicacionesModule)
            },
            {
                path: 'actividades',
                loadChildren: () => import('./plataforma/actividades/actividades.module').then((module) => module.ActividadesModule)
            },
            {
                path: 'licencias',
                loadChildren: () => import('./plataforma/licencias/licencias.module').then((module) => module.LicenciasModule)
            },
            {
                path: 'sites',
                loadChildren: () => import('./plataforma/sites/sites.module').then((module) => module.SitesModule)
            },
            {
                path: 'tickets',
                loadChildren: () => import('./plataforma/tickets/tickets.module').then((module) => module.TicketsModule)
            },
            {
                path: 'usuarios',
                loadChildren: () => import('./plataforma/usuarios/usuarios.module').then((module) => module.UsuariosModule)
            },
            {
                path: 'utilidades',
                loadChildren: () => import('./plataforma/utilidades/utilidades.module').then((module) => module.UtilidadesModule)
            },
            {
                path: 'lista-precios',
                loadChildren: () => import('./plataforma/lista-precios/lista-precios.module').then((module) => module.ListaPreciosModule)
            },
            {
                path: 'biblioteca',
                loadChildren: () => import('./plataforma/biblioteca/bibliotecas.module').then((module) => module.BibliotecasModule)
            },
            {
                path: 'tablero-control',
                loadChildren: () => import('./tablero-control/tablero-control.module').then((module) => module.TableroControlModule)
            }
        ]
    },
    {
        path: '',
        component: GuestComponent,
        children: [
            {
                path: 'autenticacion',
                loadChildren: () => import('./plataforma/autenticacion/autenticacion.module').then((module) => module.AutenticacionModule)
            },
            {
                path: 'starter',
                loadChildren: () => import('./plataforma//starter/starter.module').then((module) => module.StarterModule)
            },
            {
                path: 'logs',
                loadChildren: () => import('./plataforma/logs/logs.module').then((module) => module.LogsModule)
            },
            {
                path: 'websites',
                loadChildren: () => import('./plataforma/websites/websites.module').then((module) => module.WebsitesModule)
            },
            {
                path: 'maintenance',
                loadChildren: () => import('./plataforma/maintenance/maintenance.module').then((module) => module.MaintenanceModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
