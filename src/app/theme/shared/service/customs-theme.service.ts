// angular import
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomsThemeService {
  // public props
  customsTheme = new ReplaySubject<string>(5);
}
