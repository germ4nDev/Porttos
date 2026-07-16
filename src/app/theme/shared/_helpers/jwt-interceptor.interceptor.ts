/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private publicUrls = [
    '/api/public/websites',
    '/api/public/data',
    '/assets/'
  ];

  constructor(private _localStorageService: LocalStorageService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const isPublic = this.publicUrls.some(url => request.url.includes(url));

    if (isPublic) {
      return next.handle(request);
    }
    const token = this._localStorageService.getTokenLocalStorage();
    if (token) {
      const cloned = request.clone({
        headers: request.headers.set('x-token', token)
      });

      return next.handle(cloned);
    }
    return next.handle(request);
  }
}
