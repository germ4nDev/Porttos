import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IaAssistantResponseModel } from '../_helpers/models/IAAssistantData.model';
import { environment } from 'src/environments/environment'
const base_url = environment.apiUrl

@Injectable({
    providedIn: 'root'
})
export class IaAssistantService {

    private readonly apiUrl = `${base_url}/ia/ask`;

    constructor(private http: HttpClient) { }

    preguntarIA(prompt: string): Observable<IaAssistantResponseModel> {
        const body = { prompt };

        return this.http.post<IaAssistantResponseModel>(this.apiUrl, body).pipe(
            map(res => {
                return new IaAssistantResponseModel(res.success, res.data);
            })
        );
    }
}
