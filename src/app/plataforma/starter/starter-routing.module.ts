// Angular Import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'inicio-aplicaciones',
        loadComponent: () => import('./inicio-aplicaciones/inicio-aplicaciones.component').then((m) => m.InicioAplicacionesComponent)
      },
      {
        path: 'inicio-suites',
        loadComponent: () => import('./inicio-suites/inicio-suites.component').then((m) => m.InicioSuitesComponent)
      },
            {
        path: 'inicio-empresas',
        loadComponent: () => import('./inicio-empresas/inicio-empresas.component').then((m) => m.InicioEmpresasComponent)
      },
      {
        path: 'inicio-suscriptores',
        loadComponent: () => import('./inicio-suscriptores/inicio-suscriptores.component').then((m) => m.InicioSuscriptoresComponent)
      },
      {
        path: 'home',
        loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./perfil/perfil.component').then((m) => m.PerfilComponent)
      },
      {
        path: 'lock-screen',
        loadComponent: () => import('./lock-screen/lock-screen.component').then((m) => m.LockScreenComponent)
      },
      {
        path: 'unlock-screen',
        loadComponent: () => import('./lock-screen/unlock-screen/unlock-screen.component').then((m) => m.UnlockScreenComponent)
      },
      {
        path: 'help-modulos',
        loadComponent: () => import('./help-modulos/help-modulos.component').then((m) => m.HelpModulosComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StarterRoutingModule {}
