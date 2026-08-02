import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class AisRadarService {

    constructor(private http: HttpClient) { }

    cambiarFocoRadar(puertoId: string): Observable<any> {
        console.log('cambiar radar a', puertoId);
        const url = `${base_url}/radar/foco/${puertoId}`
        return this.http.post(url, {}).pipe(
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
