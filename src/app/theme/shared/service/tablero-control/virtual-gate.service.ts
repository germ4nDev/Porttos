import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class VirtualGateService {

    constructor(private http: HttpClient) { }

    obtenerColaGate(): Observable<any> {
        // Llama al endpoint que construimos en el backend
        return this.http.get(`${base_url}/torre-control/virtual-gate`);
    }
}
