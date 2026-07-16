import { Component, OnDestroy, OnInit } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { LanguageService } from '../../service/lenguage.service'
import { NgSelectModule } from '@ng-select/ng-select'
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { Observable, of, Subscription } from 'rxjs'
import { PTLIdioma } from '../../_helpers/models/PTLIdioma.model'
import { LocalStorageService, PtlidiomasService, UploadFilesService } from '../../service'

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss'
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
  selectedLang: string = ''
  languagesTransformadas$: Observable<PTLIdioma[]> = of([])
  languagesFiltradas$: Observable<PTLIdioma[]> = of([])
  languages: PTLIdioma[] = []
  suscPlataforma = ''
  defaultLang: PTLIdioma = new PTLIdioma()
  registrosSub = new Subscription()

  constructor (
    private translate: TranslateService,
    private _localStorageService: LocalStorageService,
    private _uploadService: UploadFilesService,
    private _languageService: LanguageService,
    private _ptlIdiomasService: PtlidiomasService
  ) {
    this.suscPlataforma = this._localStorageService.getSuscriptorPlataformaLocalStorage()
  }

  ngOnInit (): void {
    this.selectedLang = localStorage.getItem('lang') || 'es'
    this._languageService.setLanguage(this.selectedLang)
    this.setupLanguagesStream()
  }

  ngOnDestroy (): void {
    this.registrosSub.unsubscribe()
  }

  setupLanguagesStream (): void {
    const sub = this._languageService.idiomas$.subscribe({
      next: (apps: PTLIdioma[]) => {
        if (apps && apps.length > 0) {
          const plataforma = this._localStorageService.getSuscriptorPlataformaLocalStorage()
          this.languages = apps.map(lang => {
            return {
              ...lang,
              flagIdioma: this._uploadService.getFilePath(plataforma, 'idiomas', lang.flagIdioma || '')
            }
          })
          console.log('Idiomas cargados reactivamente en el Navbar:', this.languages)
        } else {
          this.cargarIdiomasDesdeBackend()
        }
      },
      error: err => console.error('Error en el stream del Navbar:', err)
    })

    this.registrosSub.add(sub)
  }

  cargarIdiomasDesdeBackend (): void {
    const subHttp = this._ptlIdiomasService.cargarRegistros().subscribe({
      next: (idiomasDesdeApi: PTLIdioma[]) => {
        console.log('idiomas', idiomasDesdeApi)
      },
      error: err => console.error('Error al traer idiomas desde la API:', err)
    })
    this.registrosSub.add(subHttp)
  }

  changeLanguage (langCode: string) {
    this.translate.use(langCode)
    this._languageService.setLanguage(langCode)
    this.selectedLang = langCode
    localStorage.setItem('lang', langCode)
    console.log('Nuevo idioma seleccionado:', langCode)
  }

  get oppositeLanguage (): PTLIdioma | null {
    if (!this.languages || this.languages.length === 0) {
      return null
    }
    const currentLangCode = this.selectedLang || localStorage.getItem('lang') || 'es'
    const opposite = this.languages.find(lang => lang.siglaIdioma !== currentLangCode)
    return opposite || null
  }

  toggleLanguage (): void {
    const nextLang = this.oppositeLanguage
    if (nextLang && nextLang.siglaIdioma) {
      this.changeLanguage(nextLang.siglaIdioma)
    }
  }
}
