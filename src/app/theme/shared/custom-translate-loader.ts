// project import
import en from '../../../assets/i18n/en.json';
import es from '../../../assets/i18n/es.json';

// third party
import { TranslateLoader } from '@ngx-translate/core';

// angular import
import { of } from 'rxjs';

export class CustomTranslateLoader implements TranslateLoader {
  // public method
  public getTranslation(lang: string) {
    if (lang === 'en') {
      return of(en);
    }
    if (lang === 'es') {
      return of(es);
    }
    return of(es);
  }
}
