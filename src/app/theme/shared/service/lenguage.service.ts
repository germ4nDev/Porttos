/*
    Author: German Valencia
*/
import { Injectable } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs'
import { PTLIdioma } from '../_helpers/models/PTLIdioma.model'
import { HttpClient } from '@angular/common/http'
import { LocalStorageService } from './local-storage.service'
import { SocketService } from './sockets.service'
import { environment } from 'src/environments/environment'
const base_url = environment.apiUrl

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private _idiomas = new BehaviorSubject<PTLIdioma[]>([])
    private _idiomasChange = new Subject<any>()
    idiomasChange$ = this._idiomasChange.asObservable()

    private currentLangSubject = new BehaviorSubject<string>(localStorage.getItem('lang') || 'es')
    currentLang$ = this.currentLangSubject.asObservable()

    constructor(
        private http: HttpClient,
        private _socketService: SocketService,
        private _localStorageService: LocalStorageService,
        private translate: TranslateService
    ) {
        console.log('localLanguage', localStorage.getItem('lang') || 'es')
        this.setLanguage(localStorage.getItem('lang') || 'es')
        this.cargarRegistros().subscribe({
            error: err => console.error('Error al cargar idiomas en el inicio:', err)
        })
        this._socketService.listen('idiomas-actualizadas').subscribe({
            next: payload => {
                console.log('Evento de Socket.IO recibido:', payload.msg)
                this._idiomasChange.next(payload)
                this.cargarRegistros().subscribe()
            },
            error: err => console.error('Error en la escucha de sockets:', err)
        })
    }

    setLanguage(lang: string) {
        this.translate.use(lang)
        this._localStorageService.setLanguage(lang)
        localStorage.setItem('lang', lang)
        console.log('New localLanguage', lang)
        this.currentLangSubject.next(lang)
    }

    getCurrentLanguage(): string {
        return this.currentLangSubject.getValue()
    }

    get idiomas$(): Observable<PTLIdioma[]> {
        return this._idiomas.asObservable()
    }

    getRegistrosActuales(): PTLIdioma[] {
        return this._idiomas.getValue()
    }

    cargarRegistros() {
        console.log('Consultando y ordenando idiomas del servidor...')
        const url = `${base_url}/idiomas`
        return this.http.get(url).pipe(
            map((resp: any) => resp.idiomas as PTLIdioma[]),
            tap(idiomasOrder => {
                console.log('los hps idiomas', idiomasOrder)
                this._idiomas.next(idiomasOrder)
            })
        )
    }
}
