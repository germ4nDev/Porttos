/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeStorageService {
  private storageKey = 'gradient-config';

  save(config: any): void {
    localStorage.setItem(this.storageKey, JSON.stringify(config));
  }

  load(): any {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}
