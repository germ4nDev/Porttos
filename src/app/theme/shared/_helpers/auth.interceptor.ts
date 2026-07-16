import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  // HttpContext,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { SKIP_TOKEN_INTERCEPTOR } from './http-context-keys'; // Importamos la clave
import { LocalStorageService } from '../service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private _localStorageService: LocalStorageService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.context.get(SKIP_TOKEN_INTERCEPTOR)) {
      return next.handle(request);
    }
    const token = this._localStorageService.getTokenLocalStorage();
    if (token) {
      const clonedRequest = request.clone({
        headers: request.headers.set('x-token', token),
      });
      return next.handle(clonedRequest);
    }
    return next.handle(request);
  }
}
