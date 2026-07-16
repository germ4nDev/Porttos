/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, tap } from 'rxjs/operators';
import { PTLFormatosGaleria } from '../_helpers/models/PTLFormatoGaleria.model'; // Asegúrate de que la ruta sea correcta
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { SocketService } from './sockets.service';
import { LocalStorageService } from './local-storage.service';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PtlFormatosGaleriaService {
  private _formatosGaleria = new BehaviorSubject<PTLFormatosGaleria[]>([]);
  private _formatosGaleriaChange = new Subject<any>();
  formatosGaleriaChange$ = this._formatosGaleriaChange.asObservable();

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private _localstorageService: LocalStorageService
  ) {
    this.socketService.listen('formatosGaleria-actualizadas').subscribe({
      next: (payload) => {
        console.log('Evento de Socket.IO recibido:', payload.msg);
        this._formatosGaleriaChange.next(payload);
        this.cargarFormatosGaleria().subscribe();
      },
      error: (err) => console.error('Error en la escucha de sockets:', err)
    });
  }

  get formatosGaleria$(): Observable<PTLFormatosGaleria[]> {
    return this._formatosGaleria.asObservable();
  }

  getFormatosGaleria() {
    console.log('Consultando formatos de galería');
    const url = `${base_url}/formatosGaleria`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        return {
          ok: true,
          formatosGaleria: resp.formatosGaleria || resp.formatoGaleria
        };
      })
    );
  }

  cargarFormatosGaleria() {
    console.log('Consultando y ordenando formatos de galería del servidor...');
    const url = `${base_url}/formatosGaleria`;
    return this.http.get(url).pipe(
      map((resp: any) => (resp.formatosGaleria || resp.formatoGaleria) as PTLFormatosGaleria[]),
      map((formatos: PTLFormatosGaleria[]) => {
        return formatos.sort((a: any, b: any) => (a.nombreFormato || '').localeCompare(b.nombreFormato || ''));
      }),
      tap((formatosOrdenados) => {
        this._formatosGaleria.next(formatosOrdenados);
      })
    );
  }

  getFormatoGaleriaById(id: number) {
    const url = `${base_url}/formatosGaleria/${id}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data de formato galería', resp);
        return {
          ok: true,
          formatoGaleria: resp.formatoGaleria
        };
      })
    );
  }

  getFormatoGaleriaByCode(code: string) {
    const url = `${base_url}/formatosGaleria/code/${code}`;
    return this.http.get(url).pipe(
      map((resp: any) => {
        console.log('data del formato galería', resp.formatoGaleria);
        return {
          ok: true,
          formatoGaleria: resp.formatoGaleria
        };
      })
    );
  }

  crearFormatoGaleria(data: PTLFormatosGaleria) {
    const url = `${base_url}/formatosGaleria`;
    return this.http.post(url, data).pipe(
      map((resp: any) => {
        return {
          ok: true,
          formatoGaleria: resp.formatoGaleria
        };
      })
    );
  }

  actualizarFormatoGaleria(formato: PTLFormatosGaleria) {
    const url = `${base_url}/formatosGaleria/${formato.codigoFormato}`;
    return this.http.put(url, formato).pipe(
      map((resp: any) => {
        console.log('data de formato galería modificado', resp);
        return {
          ok: true,
          formatoGaleria: resp.formatoGaleria
        };
      })
    );
  }

  eliminarFormatoGaleria(_id: any) {
    console.log('eliminar formato galería', _id);
    const url = `${base_url}/formatosGaleria/${_id.id}`;
    return this.http.delete(url).pipe(
      map((resp: any) => {
        console.log('data de formato galería eliminada', resp);
        return {
          ok: true,
          formatoGaleria: resp.formatoGaleria
        };
      })
    );
  }
}
