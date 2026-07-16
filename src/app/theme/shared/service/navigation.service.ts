/*
    Author: German Valencia
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { PtlmodulosApService } from './ptlmodulos-ap.service';
import { Subscription, Observable, BehaviorSubject, Subject } from 'rxjs';
import { PTLAplicacionModel } from '../_helpers/models/PTLAplicacion.model';
import { PTLModuloAP } from '../_helpers/models/PTLModuloAP.model';
import { PTLSuiteAPModel } from '../_helpers/models/PTLSuiteAP.model';
import { LocalStorageService } from './local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './lenguage.service';
import { Router } from '@angular/router';
import { NavigationItem } from '../_helpers/models/Navigation.model';
import { PtlAplicacionesService } from './ptlaplicaciones.service';

@Injectable({
    providedIn: 'root'
})
export class NavigationService implements OnInit, OnDestroy {
    aplicacion: PTLAplicacionModel = new PTLAplicacionModel();
    suite: PTLSuiteAPModel = new PTLSuiteAPModel();

    menuSubject = new BehaviorSubject<NavigationItem[]>([]);
    menuItems$: Observable<NavigationItem[]> = this.menuSubject.asObservable();

    lockScreenSubject = new Subject<string>();
    lockScreenEvent$: Observable<string> = this.lockScreenSubject.asObservable();

    // === Gestor centralizado de suscripciones ===
    private subscriptions: Subscription = new Subscription();

    constructor(
        private router: Router,
        private _modulosService: PtlmodulosApService,
        private _localStorageService: LocalStorageService,
        private _languageService: LanguageService,
        private _aplicacionesService: PtlAplicacionesService,
        private translate: TranslateService
    ) {
        this.subscriptions.add(
            this._languageService.currentLang$.subscribe(lang => {
                console.log(`[NavigationService] Detectado cambio de idioma a: ${lang}. Actualizando menú.`);
                this.getNavigationItems();
            })
        );
    }

    ngOnInit() { }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    emitLockScreen(message: string): void {
        this.lockScreenSubject.next(message);
    }

    private getAbsoluteUrl(url: string | undefined): string | undefined {
        if (!url) {
            return undefined;
        }
        return url.startsWith('/') ? url : `/${url}`;
    }

    private sortMenuItems(items: NavigationItem[]): NavigationItem[] {
        if (!items || items.length === 0) {
            return [];
        }

        items.sort((a, b) => {
            const titleA = a.title || '';
            const titleB = b.title || '';
            return titleA.localeCompare(titleB, 'es', { sensitivity: 'base' });
        });

        items.forEach(item => {
            if (item.children && item.children.length > 0) {
                item.children = this.sortMenuItems(item.children);
            }
        });

        return items;
    }

    private consultarNodosHijos(codModulo: string, modulos: PTLModuloAP[]) {
        return modulos.filter(x => x.codigoPadre == codModulo);
    }

    private buildMenuItems(modulosPadre: PTLModuloAP[], todosLosModulos: PTLModuloAP[]): NavigationItem[] {
        const menuItems: NavigationItem[] = [];
        modulosPadre.forEach((modulo: any) => {
            const childrenNodes = this.consultarNodosHijos(modulo.codigoModulo, todosLosModulos);
            const hasChildren = modulo.hijos == true;
            const type: 'collapse' | 'item' = hasChildren ? 'collapse' : 'item';
            const titleKey = this.translate.instant('PLATAFORMA.MODULOS.' + modulo.translateKey);

            const item: NavigationItem = {
                id: modulo.codigoModulo,
                title: titleKey,
                type: type,
                icon: modulo.icon
            };

            if (hasChildren) {
                item.children = this.buildMenuItems(childrenNodes, todosLosModulos);
            } else {
                item.url = this.getAbsoluteUrl(modulo.rutaModulo);
            }
            menuItems.push(item);
        });
        return menuItems;
    }

    private getAplicacionSuiteItems(todosLosModulos: PTLModuloAP[]): NavigationItem[] {
        const codigoSuiteActual = this.suite.codigoSuite;
        const modulosDeLaSuite = todosLosModulos.filter(x => x.codigoSuite === codigoSuiteActual);

        if (modulosDeLaSuite.length === 0) {
            return [];
        }

        const modulosPadreRaiz = modulosDeLaSuite.filter(x => x.codigoPadre === '0');
        let hijosDelNodoSuite = this.buildMenuItems(modulosPadreRaiz, modulosDeLaSuite);
        hijosDelNodoSuite = this.sortMenuItems(hijosDelNodoSuite);

        const suiteTitleKey = this.translate.instant('PLATAFORMA.SUITES.' + this.suite.translateKey);

        const nodoSuite: NavigationItem = {
            id: this.suite.codigoSuite || '',
            title: suiteTitleKey,
            type: 'group',
            icon: 'feather icon-monitor',
            children: hijosDelNodoSuite
        };
        return [nodoSuite];
    }

    getNavigationItems(): void {
        this.aplicacion = this._localStorageService.getAplicaicionLocalStorage();
        this.suite = this._localStorageService.getSuiteLocalStorage();
        console.log('aplicacion para el menu');

        // const apps = this._aplicacionesService.getBAplicacionesActuales()
        // apps.forEach((app: PTLAplicacionModel) => {
        const codigoApp = this.aplicacion.codigoAplicacion;
        switch (codigoApp) {
            case 'e1a8fa99-15db-479b-a0a4-9c2be72273b5':
                this.subscriptions.add(
                    this._modulosService.getRegistros().subscribe(data => {
                        const nuevosModulos = data.modulos;
                        if (nuevosModulos.length > 0) {
                            const ordenado = nuevosModulos.sort((a: any, b: any) => {
                                const nombreA = a.nombreModulo || '';
                                const nombreB = b.nombreModulo || '';
                                return nombreA.localeCompare(nombreB);
                            });
                            const menu = this.getAplicacionSuiteItems(ordenado);
                            this.menuSubject.next(menu);
                        } else {
                            this.menuSubject.next([]);
                        }
                    })
                );
                break;
            case '3eb98a9f-cc5d-417d-95ea-a2b8abc3b5fa':
                this.subscriptions.add(
                    this._modulosService.getRegistros().subscribe(data => {
                        const nuevosModulos = data.modulos;
                        if (nuevosModulos.length > 0) {
                            const ordenado = nuevosModulos.sort((a: any, b: any) => {
                                const nombreA = a.nombreModulo || '';
                                const nombreB = b.nombreModulo || '';
                                return nombreA.localeCompare(nombreB);
                            });
                            const menu = this.getAplicacionSuiteItems(ordenado);
                            console.log('********* todo el menu', menu);

                            this.menuSubject.next(menu);
                        } else {
                            this.menuSubject.next([]);
                        }
                    })
                );
                break;
            default:
                this.menuSubject.next([]);
                break;
        }
        // })

    }

    navigateNodoMenu(url: any) {
        console.log('===============datos del modulo', url);

        const modulos = this._modulosService.getModulosActuales();
        console.log('===============modulos', modulos);
        const modulo = modulos.find(x => x.codigoModulo == url.id);

        if (!modulo) {
            console.warn('No se encontró el módulo en la lista actual', url.id);
            return;
        }
        console.log('===============datos del modulo', modulo);

        this._localStorageService.setModuloLocalStorage(modulo);

        if (modulo.codigoModulo !== undefined) {
            this._localStorageService.setObject('regId', modulo.codigoModulo)
            this.router.navigate([modulo.rutaModulo]);
        } else {
            this.router.navigate([modulo.rutaModulo]);
        }
    }
}

// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @angular-eslint/contextual-lifecycle */
// import { Injectable, OnDestroy, OnInit } from '@angular/core'
// import { PtlmodulosApService } from './ptlmodulos-ap.service'
// import { Subscription, Observable, BehaviorSubject, tap, catchError, of, Subject } from 'rxjs'
// import { PTLAplicacionModel } from '../_helpers/models/PTLAplicacion.model'
// import { PTLModuloAP } from '../_helpers/models/PTLModuloAP.model'
// import { PTLSuiteAPModel } from '../_helpers/models/PTLSuiteAP.model'
// import { LocalStorageService } from './local-storage.service'
// import { TranslateService } from '@ngx-translate/core'
// import { LanguageService } from './lenguage.service'
// import { Router } from '@angular/router'
// import { NavigationItem } from '../_helpers/models/Navigation.model'
// import { PtlBibliotecasService } from './ptlbibliotecas.service'

// @Injectable({
//   providedIn: 'root'
// })
// export class NavigationService implements OnInit, OnDestroy {
//   aplicaciones: PTLAplicacionModel[] = []
//   suites: PTLSuiteAPModel[] = []
//   suitesApp: PTLSuiteAPModel[] = []
//   modulos: PTLModuloAP[] = []
//   modulosSu: PTLModuloAP[] = []
//   modulosSu2: PTLModuloAP[] = []
//   aplicacionesSub?: Subscription
//   suitesSub?: Subscription
//   modulosSub?: Subscription
//   aplicacion: PTLAplicacionModel = new PTLAplicacionModel()
//   suite: PTLSuiteAPModel = new PTLSuiteAPModel()
//   modulo: PTLModuloAP = new PTLModuloAP()
//   modulo2: PTLModuloAP = new PTLModuloAP()

//   menuSubject = new BehaviorSubject<NavigationItem[]>([])
//   menuItems$: Observable<NavigationItem[]> = this.menuSubject.asObservable()
//   langSubscription: Subscription | undefined
//   lockScreenSubject = new Subject<string>()
//   lockScreenEvent$: Observable<string> = this.lockScreenSubject.asObservable()

//   constructor (
//     private router: Router,
//     private _modulosService: PtlmodulosApService,
//     private _bibliotecasService: PtlBibliotecasService,
//     private _localStorageService: LocalStorageService,
//     private _languageService: LanguageService,
//     private translate: TranslateService
//   ) {
//     this.langSubscription = this._languageService.currentLang$.subscribe(lang => {
//       console.log(`[NavigationService] Detectado cambio de idioma a: ${lang}. Actualizando menú.`)
//       this.getNavigationItems()
//     })
//   }

//   ngOnInit () {}

//   ngOnDestroy (): void {
//     if (this.langSubscription) {
//       this.langSubscription.unsubscribe()
//     }
//   }

//   emitLockScreen (message: string): void {
//     // console.log('Navigation: Emitiendo evento de bloqueo:', message);
//     this.lockScreenSubject.next(message)
//   }

//   private getAbsoluteUrl (url: string | undefined): string | undefined {
//     if (!url) {
//       return undefined
//     }
//     return url.startsWith('/') ? url : `/${url}`
//   }

//   private createTranslationKey (base: string, name: string): string {
//     if (!name) return `${base}.DEFAULT`
//     const safeName = name
//       .toUpperCase()
//       .replace(/[^A-Z0-9]/g, '_')
//       .replace(/_{2,}/g, '_')
//     return `${base}.${safeName}`
//   }

//   private sortMenuItems (items: NavigationItem[]): NavigationItem[] {
//     if (!items || items.length === 0) {
//       return []
//     }

//     items.sort((a, b) => {
//       const titleA = a.title || ''
//       const titleB = b.title || ''
//       return titleA.localeCompare(titleB, 'es', { sensitivity: 'base' })
//     })

//     items.forEach(item => {
//       if (item.children && item.children.length > 0) {
//         item.children = this.sortMenuItems(item.children)
//       }
//     })

//     return items
//   }

//   private consultarNodosHijos (codModulo: string, modulos: PTLModuloAP[]) {
//     const hijos = modulos.filter(x => x.codigoPadre == codModulo)
//     return hijos
//   }

//   private buildMenuItems (modulosPadre: PTLModuloAP[], todosLosModulos: PTLModuloAP[]): NavigationItem[] {
//     const menuItems: NavigationItem[] = []
//     modulosPadre.forEach((modulo: any) => {
//       const childrenNodes = this.consultarNodosHijos(modulo.codigoModulo, todosLosModulos)
//       const hasChildren = modulo.hijos == true
//       const type: 'collapse' | 'item' = hasChildren ? 'collapse' : 'item'
//       const titleKey = this.translate.instant('PLATAFORMA.MODULOS.' + modulo.translateKey)
//       const item: NavigationItem = {
//         id: modulo.codigoModulo,
//         title: titleKey,
//         type: type,
//         icon: modulo.icon
//       }
//       if (hasChildren) {
//         item.children = this.buildMenuItems(childrenNodes, todosLosModulos)
//       } else {
//         item.url = this.getAbsoluteUrl(modulo.rutaModulo)
//       }
//       menuItems.push(item)
//     })
//     return menuItems
//   }

//   private getAplicacionSuiteItems (todosLosModulos: PTLModuloAP[]): NavigationItem[] {
//     const codigoSuiteActual = this.suite.codigoSuite
//     const modulosDeLaSuite = todosLosModulos.filter(x => x.codigoSuite === codigoSuiteActual)
//     if (modulosDeLaSuite.length === 0) {
//       return []
//     }
//     const modulosPadreRaiz = modulosDeLaSuite.filter(x => x.codigoPadre === '0')
//     let hijosDelNodoSuite = this.buildMenuItems(modulosPadreRaiz, modulosDeLaSuite)
//     hijosDelNodoSuite = this.sortMenuItems(hijosDelNodoSuite)
//     const suiteTitleKey = this.translate.instant('PLATAFORMA.SUITES.' + this.suite.translateKey)

//     const nodoSuite: NavigationItem = {
//       id: this.suite.codigoSuite || '',
//       title: suiteTitleKey,
//       type: 'group',
//       icon: 'feather icon-monitor',
//       children: hijosDelNodoSuite
//     }
//     return [nodoSuite]
//   }

//   getNavigationItems (): void {
//     //// console.log('2');
//     this.aplicacion = this._localStorageService.getAplicaicionLocalStorage()
//     this.suite = this._localStorageService.getSuiteLocalStorage()
//     const codigoApp = this.aplicacion.codigoAplicacion
//     // console.log('==============codigo aplicacion', codigoApp);
//     switch (codigoApp) {
//       case 'e1a8fa99-15db-479b-a0a4-9c2be72273b5':
//         this._modulosService.getRegistros().subscribe(data => {
//           const nuevosModulos = data.modulos
//           if (nuevosModulos.length > 0) {
//             const ordenado = nuevosModulos.sort((a: any, b: any) => a.nombreModulo - b.nombreModulo)
//             const menu = this.getAplicacionSuiteItems(ordenado)
//             this.menuSubject.next(menu)
//           } else {
//             this.menuSubject.next([])
//           }
//         })
//         break
//       default:
//         this.menuSubject.next([])
//         break
//     }
//   }

//   navigateNodoMenu (url: any) {
//     // const bibliotecas = this._bibliotecasService.getBibliotecasActuales()
//     const modulos = this._modulosService.getModulosActuales()
//     const modulo = modulos.filter(x => x.codigoModulo == url.id)[0]
//     // const biblio = bibliotecas.filter(x => x.codigoModulo == url.id)[0]
//     // console.log('bibioteca', biblio);

//     if (modulo) {
//     //   modulo.codigoBiblioteca = biblio.codigoBiblioteca || ''
//     //   modulo.nomBiblioteca = biblio.nombreBiblioteca || ''
//       this._localStorageService.setModuloLocalStorage(modulo)
//     }
//     if (modulo.codigoModulo !== undefined) {
//       this.router.navigate([modulo.rutaModulo], { queryParams: { regId: modulo.codigoModulo } })
//     } else {
//       this.router.navigate([modulo.rutaModulo])
//     }
//   }
// }
