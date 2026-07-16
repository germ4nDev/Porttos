import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanLoad, Route, UrlSegment, UrlTree } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { take, map, catchError, filter } from 'rxjs/operators';
import { AuthenticationService } from '../theme/shared/service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanLoad {
  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {}

  private checkAuth(url: string): Observable<boolean | UrlTree> {
    return combineLatest([
      this.authService.isAuthInitialized$.pipe(filter((initialized) => initialized)),
      this.authService.isLoggedIn$
    ]).pipe(
      take(1),
      map(([initialized, isLoggedIn]) => {
        if (isLoggedIn) {
          console.log('********** AuthGuard: Acceso concedido. Usuario Logueado.', initialized);
          return true;
        }
        console.log('********** AuthGuard: Acceso denegado. Redirigiendo a login.');
        return this.router.createUrlTree(['autenticacion/login'], { queryParams: { returnUrl: url } });
      }),
      catchError((error) => {
        console.error('********** AuthGuard: Error inesperado en el guard. Redirigiendo.', error);
        return of(this.router.createUrlTree(['autenticacion/login']));
      })
    );
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.checkAuth(state.url);
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> {
    // Reconstruye la URL para el 'returnUrl'
    const url = segments.length > 0 ? `/${segments.join('/')}` : '/';
    return this.checkAuth(url);
  }
}

// import { Injectable } from '@angular/core';
// import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanLoad, Route, UrlSegment, UrlTree } from '@angular/router';
// import { Observable, combineLatest, of } from 'rxjs';
// import { take, map, catchError, filter } from 'rxjs/operators';
// import { AuthenticationService } from '../theme/shared/service';

// @Injectable({ providedIn: 'root' })
// export class AuthGuard implements CanActivate, CanLoad {
//   constructor(
//     private router: Router,
//     private authService: AuthenticationService
//   ) {}

//   /**
//    * Verifica la autorización del usuario o permite el acceso si la ruta es pública.
//    * @param route La instantánea de la ruta para leer los datos (ej: { public: true }).
//    * @param url La URL a la que se intenta acceder.
//    */
//   private checkAuth(route: ActivatedRouteSnapshot, url: string): Observable<boolean | UrlTree> {

//     // 1. Verificar si la ruta está marcada como pública
//     const isPublicRoute = route.data && route.data['public'] === true;

//     if (isPublicRoute) {
//       // **Acceso inmediato:** Si la bandera 'public: true' está presente en la configuración de la ruta,
//       // el guardia permite el acceso sin verificar el estado de la sesión.
//       console.log('********** AuthGuard: Acceso concedido (Ruta Pública).');
//       return of(true);
//     }

//     // 2. Si la ruta NO es pública, se requiere autenticación.
//     return combineLatest([
//       // Espera a que el servicio de autenticación termine de inicializarse.
//       this.authService.isAuthInitialized$.pipe(filter((initialized) => initialized)),
//       // Observa el estado de inicio de sesión.
//       this.authService.isLoggedIn$
//     ]).pipe(
//       take(1),
//       map(([initialized, isLoggedIn]) => {
//         if (isLoggedIn) {
//           console.log('********** AuthGuard: Acceso concedido. Usuario Logueado.', initialized);
//           return true;
//         }
//         // Redirección si la ruta es privada y el usuario no está logueado.
//         console.log('********** AuthGuard: Acceso denegado. Redirigiendo a login.');
//         return this.router.createUrlTree(['autenticacion/login'], { queryParams: { returnUrl: url } });
//       }),
//       catchError((error) => {
//         console.error('********** AuthGuard: Error inesperado en el guard. Redirigiendo.', error);
//         return of(this.router.createUrlTree(['autenticacion/login']));
//       })
//     );
//   }

//   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
//     // Pasar el 'route' (ActivatedRouteSnapshot) a checkAuth
//     return this.checkAuth(route, state.url);
//   }

//   canLoad(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> {
//     // canLoad no tiene acceso directo a ActivatedRouteSnapshot, pero podemos crear una
//     // aproximación o, más simple, tratar canLoad solo para módulos privados que requieren Auth.
//     // Por simplicidad, mantendremos la verificación de autenticación completa para canLoad.

//     const url = segments.length > 0 ? `/${segments.join('/')}` : '/';
//     // Nota: Aquí se usa un ActivatedRouteSnapshot vacío o dummy, ya que canLoad no la provee.
//     // Asumimos que si usamos canLoad, el módulo es PRVADO y debe autenticarse.
//     return this.checkAuth({ data: {} } as ActivatedRouteSnapshot, url);
//   }
// }
