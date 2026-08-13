/*
    Author: German Valencia
    Pattern: PORTTOS Angular Service Pattern - Contenedores
*/
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class ContenedoresService {

    constructor(private http: HttpClient) { }

    obtenerDashboardContenedores(): Observable<any> {
        const url = `${base_url}/contenedores`
        return this.http.get<any>(url).pipe(
            map((resp: any) => {
                console.log('resp', resp);
                return {
                    ok: true,
                    data: resp.data
                }
            })
        )
    }
}
