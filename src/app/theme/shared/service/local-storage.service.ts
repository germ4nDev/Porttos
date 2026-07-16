// // /*
// //     Author: German Valencia
// // */
// // /* eslint-disable @typescript-eslint/no-explicit-any */
// // import { Injectable } from '@angular/core'
// // import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model'
// // import { PTLAplicacionModel } from '../_helpers/models/PTLAplicacion.model'
// // import { PTLSuiteAPModel } from '../_helpers/models/PTLSuiteAP.model'
// // import { PTLModuloAP } from '../_helpers/models/PTLModuloAP.model'
// // import { BaseSessionModel } from '../_helpers/models/BaseSession.model'
// // import { ThemeSettingsModel } from '../_helpers/models/ThemeSettings.model'
// // import { NavSettings } from '../_helpers/models/navSettings.model'
// // import { PTLSuscriptorModel } from '../_helpers/models/PTLSuscriptor.model'
// // import { CurrentUserModel } from '../_helpers/models/CurrentUser.model'
// // import { PTLRoleAPModel } from '../_helpers/models/PTLRoleAP.model'
// // import { PTLEmpresaSCModel } from '../_helpers/models/PTLEmpresaSC.model'
// // import { PTLActividadModel } from '../_helpers/models/PTLActividades.model'
// // import { Puerto } from '../_helpers/models/tablero-control/puerto.model'
// // import { CurrentTableroModel } from '../_helpers/models/CurrentTableroSettings.model'
// // import { LayoutService } from './tablero-control/layout.service'
// // import { firstValueFrom } from 'rxjs';
// // @Injectable({
// //     providedIn: 'root'
// // })
// // export class LocalStorageService {
// //     DataModel: BaseSessionModel = new BaseSessionModel()
// //     navsettings: NavSettings = new NavSettings()
// //     tableroSettings: CurrentTableroModel = new CurrentTableroModel()
// //     public usuario: any = {}
// //     public token: any
// //     public currentUser: any
// //     public currentTablero: any
// //     public puerto: any
// //     public pestana: string = ''
// //     public aplicacion: any = {}
// //     public suite: any = {}
// //     public modulo: any = {}
// //     public suscriptor: any = {}
// //     public empresa: any = {}
// //     public FormRegistro: any
// //     public lang: string = 'en'
// //     public themeSettings: any
// //     public roles: PTLRoleAPModel[] = []
// //     public actividades: PTLActividadModel[] = []

// //     constructor(private _layoutService: LayoutService) { }

// //     // #region MÉTODOS GENÉRICOS (BASE)
// //     getObject<T>(key: string): T | null {
// //         const value = sessionStorage.getItem(key);
// //         if (!value) return null;
// //         try {
// //             return JSON.parse(value) as T;
// //         } catch (error) {
// //             console.error(`Error al recuperar la clave ${key}:`, error);
// //             return null;
// //         }
// //     }

// //     setObject(key: string, value: any): void {
// //         if (value === null || value === undefined) return;
// //         sessionStorage.setItem(key, JSON.stringify(value));
// //     }

// //     removeObject(key: string): void {
// //         sessionStorage.removeItem(key);
// //     }
// //     // #endregion

// //     // #region GETTERS
// //     getCurrentUserLocalStorage(): any {
// //         return this.getObject<any>('currentUser');
// //     }

// //     getUsuarioLocalStorage() {
// //         const currentUser = this.getCurrentUserLocalStorage();
// //         return currentUser ? currentUser.usuario : null;
// //     }

// //     getTokenLocalStorage() {
// //         const currentUser = this.getCurrentUserLocalStorage();
// //         return currentUser ? currentUser.token : null;
// //     }

// //     getNavSettingsLocalStorage(): NavSettings {
// //         return this.getObject<NavSettings>('navsettings') || new NavSettings();
// //     }

// //     getAplicaicionLocalStorage(): PTLAplicacionModel {
// //         const navSetts = this.getNavSettingsLocalStorage();
// //         return navSetts.aplicacion || new PTLAplicacionModel();
// //     }

// //     getSuiteLocalStorage(): PTLSuiteAPModel {
// //         const navSetts = this.getNavSettingsLocalStorage();
// //         return navSetts.suite || new PTLSuiteAPModel();
// //     }

// //     getModuloLocalStorage(): PTLModuloAP {
// //         const navSetts = this.getNavSettingsLocalStorage();
// //         return navSetts.modulo || new PTLModuloAP();
// //     }

// //     getSuscriptorPlataformaLocalStorage() {
// //         return 'plataforma'
// //     }

// //     getSuscriptorLocalStorage(): PTLSuscriptorModel | null {
// //         const currentUser = this.getCurrentUserLocalStorage();
// //         return currentUser && currentUser.suscriptor ? currentUser.suscriptor : new PTLSuscriptorModel();
// //     }

// //     getDataModelsLocalStorage() {
// //         // Nota: Revisa si de verdad querías hacer .aplicacion aquí, podría ser un bug de tu versión anterior
// //         this.usuario = this.getUsuarioLocalStorage() || new PTLUsuarioModel();
// //         this.aplicacion = this.getAplicaicionLocalStorage();
// //         this.suite = this.getSuiteLocalStorage();
// //         this.modulo = this.getModuloLocalStorage();

// //         const modelo: BaseSessionModel = {
// //             codigoAplicacion: this.aplicacion.codigoAplicacion,
// //             codigoSuite: this.suite.codigoSuite,
// //             codigoModulo: this.modulo.codigoModulo,
// //             usuarioCreacion: this.usuario.codigoUsuario,
// //             usuarioModificacion: this.usuario.codigoUsuario,
// //             fechaCreacion: new Date(),
// //             fechaModificacion: new Date(),
// //             dataLog: []
// //         }
// //         return modelo;
// //     }

// //     getLanguage(): string {
// //         return this.lang;
// //     }

// //     getFormRegistro() {
// //         this.FormRegistro = this.getObject<any>('FormRegistro') || [];
// //         return this.FormRegistro;
// //     }

// //     getPuertoSeleccionado() {
// //         this.puerto = this.getObject<any>('puerto') || [];
// //         return this.puerto;
// //     }

// //     getThemeSettings() {
// //         const localSettings = localStorage.getItem('themeSettings');
// //         if (localSettings) {
// //             this.themeSettings = JSON.parse(localSettings);
// //         } else {
// //             this.themeSettings = {
// //                 isDarkTheme: false,
// //                 navbarColor: '#346BA6',
// //                 iconosColor: '', // ¡Vacío!
// //                 textoColor: '',  // ¡Vacío!
// //                 buttonsHoverColor: '#346BA6'
// //             } as ThemeSettingsModel;
// //         }
// //         return this.themeSettings;
// //     }

// //         async getTableroLocalStorage() {
// //         const localTablero = localStorage.getItem('currentTablero');
// //         if (localTablero) {
// //             this.currentTablero = JSON.parse(localTablero);
// //         } else {
// //             this.currentTablero = {
// //                 puerto: 'BUENAVENTURA',
// //                 pestana: 'TLC_MARITIMO_001',
// //                 layout: await this.getLayoutPestanaUsuario('SISTEMA_DEFAULT', 'TLC_MARITIMO_001')
// //             } as CurrentTableroModel;
// //         }
// //         return this.currentTablero;
// //     }

// //     getLanguageUrl() {
// //         return `//cdn.datatables.net/plug-ins/1.10.25/i18n/${this.lang === 'es' ? 'Spanish' : 'English'}.json`;
// //     }

// //     async getLayoutPestanaUsuario(usuario: any, pestana: string) {
// //         try {
// //             const response: any = await firstValueFrom(
// //                 this._layoutService.obtenerLayoutPorUsuario(usuario, pestana)
// //             );
// //             return response.data;

// //         } catch (err) {
// //             console.error("❌ Error cargando el layout:", err);
// //             return [];
// //         }
// //     }
// //     // #endregion GETTERS

// //     // #region SETTERS
// //     setNavSettingsLocalStorage(navsettings: NavSettings) {
// //         this.setObject('navsettings', navsettings);
// //         this.navsettings = navsettings;
// //     }

// //     setThemeSettingsLocalStorage(settings: ThemeSettingsModel) {
// //         localStorage.setItem('themeSettings', JSON.stringify(settings));
// //         this.themeSettings = settings;
// //     }

// //     setCurrentUserLocalStorage(data: CurrentUserModel) {
// //         this.setObject('currentUser', data);
// //         this.currentUser = data;
// //     }

// //     // Uso del spread operator (...) para mantener el código DRY y evitar typos como "acttividades"
// //     setUsuarioLocalStorage(usuario: PTLUsuarioModel) {
// //         const currentUser = { ...this.getCurrentUserLocalStorage(), usuario };
// //         this.setCurrentUserLocalStorage(currentUser);
// //         this.usuario = usuario;
// //     }

// //     setSuscriptorLocalStorage(data: PTLSuscriptorModel) {
// //         const currentUser = { ...this.getCurrentUserLocalStorage(), suscriptor: data };
// //         this.setCurrentUserLocalStorage(currentUser);
// //         this.suscriptor = data;
// //     }

// //     setRolesLocalStorage(roles: PTLRoleAPModel[]) {
// //         const currentUser = { ...this.getCurrentUserLocalStorage(), roles };
// //         this.setCurrentUserLocalStorage(currentUser);
// //         this.roles = roles;
// //     }

// //     setActividadesLocalStorage(actividades: PTLActividadModel[]) {
// //         const currentUser = { ...this.getCurrentUserLocalStorage(), actividades };
// //         this.setCurrentUserLocalStorage(currentUser);
// //         this.actividades = actividades;
// //     }

// //     setEmpresasLocalStorage(empresa: PTLEmpresaSCModel) {
// //         const currentUser = { ...this.getCurrentUserLocalStorage(), empresa };
// //         this.setCurrentUserLocalStorage(currentUser);
// //         this.empresa = empresa;
// //     }

// //     setTokenLocalStorage(token: any) {
// //         const currentUser = { ...this.getCurrentUserLocalStorage(), token };
// //         this.setCurrentUserLocalStorage(currentUser);
// //         this.token = token;
// //     }

// //     setAplicacionLocalStorage(aplicacion: PTLAplicacionModel) {
// //         const navSetts = { ...this.getNavSettingsLocalStorage(), aplicacion };
// //         this.setNavSettingsLocalStorage(navSetts);
// //         this.aplicacion = aplicacion;
// //     }

// //     setSuiteLocalStorage(suite: PTLSuiteAPModel) {
// //         const navSetts = { ...this.getNavSettingsLocalStorage(), suite };
// //         this.setNavSettingsLocalStorage(navSetts);
// //         this.suite = suite;
// //     }

// //     setModuloLocalStorage(modulo: PTLModuloAP) {
// //         const navSetts = { ...this.getNavSettingsLocalStorage(), modulo };
// //         this.setNavSettingsLocalStorage(navSetts);
// //         this.modulo = modulo;
// //     }

// //     setLanguage(lang: string) {
// //         localStorage.setItem('lang', lang);
// //         this.lang = lang;
// //     }

// //     setFormRegistro(FormRegistro: any) {
// //         this.setObject('FormRegistro', FormRegistro);
// //         this.FormRegistro = FormRegistro;
// //     }

// //     setPuertoLocalStorage(data: Puerto) {
// //         const navSetts = { ...this.getTableroLocalStorage(), data };
// //         this.setTableroLocalStorage(navSetts);

// //         this.puerto = data;
// //     }

// //     setTableroLocalStorage(data: CurrentTableroModel) {
// //         this.setObject('pestana', data);
// //         this.tableroSettings = data;
// //     }
// //     // #endregion SETTERS

// //     // #region REMOVERS
// //     removeFormRegistro() {
// //         this.removeObject('FormRegistro');
// //     }

// //     setLogOut() {
// //         this.removeObject('currentUser');
// //         this.removeObject('navsettings');
// //     }
// //     // #endregion  REMOVERS
// // }


/*
    Author: German Valencia
    Refactorizado: Resolución de conflictos de estado asíncrono y almacenamiento
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
import { PTLAplicacionModel } from '../_helpers/models/PTLAplicacion.model';
import { PTLSuiteAPModel } from '../_helpers/models/PTLSuiteAP.model';
import { PTLModuloAP } from '../_helpers/models/PTLModuloAP.model';
import { BaseSessionModel } from '../_helpers/models/BaseSession.model';
import { ThemeSettingsModel } from '../_helpers/models/ThemeSettings.model';
import { NavSettings } from '../_helpers/models/navSettings.model';
import { PTLSuscriptorModel } from '../_helpers/models/PTLSuscriptor.model';
import { CurrentUserModel } from '../_helpers/models/CurrentUser.model';
import { PTLRoleAPModel } from '../_helpers/models/PTLRoleAP.model';
import { PTLEmpresaSCModel } from '../_helpers/models/PTLEmpresaSC.model';
import { PTLActividadModel } from '../_helpers/models/PTLActividades.model';
import { Puerto } from '../_helpers/models/tablero-control/puerto.model';
import { CurrentTableroModel } from '../_helpers/models/CurrentTableroSettings.model';
import { LayoutService } from './tablero-control/layout.service';
import { PuertosService } from './tablero-control/puertos.service';
import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    DataModel: BaseSessionModel = new BaseSessionModel();
    navsettings: NavSettings = new NavSettings();
    tableroSettings: CurrentTableroModel = new CurrentTableroModel();
    public tableroSubject = new BehaviorSubject<CurrentTableroModel>(this.getTableroLocalStorage());
    public usuario: any = {};
    public token: any;
    public currentUser: any;
    public currentTablero: any;
    public puertos: Puerto[] = [];
    public puerto: any;
    public layout: any;
    public pestana: string = '';
    public aplicacion: any = {};
    public suite: any = {};
    public modulo: any = {};
    public suscriptor: any = {};
    public empresa: any = {};
    public FormRegistro: any;
    public lang: string = 'es'; // 🟢 Asumo español por defecto basado en tu código
    public themeSettings: any;
    public roles: PTLRoleAPModel[] = [];
    public actividades: PTLActividadModel[] = [];

    constructor(private _layoutService: LayoutService,
        private _puertosService: PuertosService
    ) {

    }

    // ====================================================================
    // #region MÉTODOS GENÉRICOS DE ALMACENAMIENTO
    // ====================================================================

    // --- SESSION STORAGE (Se borra al cerrar la pestaña) ---
    getObject<T>(key: string): T | null {
        const value = sessionStorage.getItem(key);
        if (!value) return null;
        try { return JSON.parse(value) as T; }
        catch (error) { return null; }
    }

    setObject(key: string, value: any): void {
        if (value === null || value === undefined) return;
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    removeObject(key: string): void {
        sessionStorage.removeItem(key);
    }

    // --- LOCAL STORAGE (Persiste al cerrar el navegador) ---
    getLocalObject<T>(key: string): T | null {
        const value = localStorage.getItem(key);
        if (!value) return null;
        try { return JSON.parse(value) as T; }
        catch (error) { return null; }
    }

    setLocalObject(key: string, value: any): void {
        if (value === null || value === undefined) return;
        localStorage.setItem(key, JSON.stringify(value));
    }
    // #endregion


    // ====================================================================
    // #region MÉTODOS DEL TABLERO DE CONTROL (SYNC STATE)
    // ====================================================================
    getTableroLocalStorage(): CurrentTableroModel {
        const localTablero = localStorage.getItem('currentTablero');
        if (localTablero) {
            console.log('aca');
            this.currentTablero = JSON.parse(localTablero);
        } else {
            console.log('alla');
            // Valor por defecto
            this.currentTablero = {
                puerto: {},
                pestana: 'TLC_MARITIMO_001',
                layout: []
            };
            this.setPuertoLocalStorage('BUENAVENTURA')
            this.setTableroLocalStorage(this.currentTablero);
            this.setLayoutLocalStorage('SISTEMA_DEFAULT', this.currentTablero.pestana || '');
        }
        this.puerto = this.currentTablero.puerto;
        this.pestana = this.currentTablero.pestana || '';
        // this.setLocalObject('currentTablero', this.currentTablero);
        return this.currentTablero;
    }

    setTableroLocalStorage(data: CurrentTableroModel): void {
        this.setLocalObject('currentTablero', data);
        this.currentTablero = data;
        this.tableroSettings = data;
        this.puerto = data.puerto;
        this.pestana = data.pestana || '';

        // 🟢 Emitimos el cambio a todos los componentes suscritos
        this.tableroSubject.next(data);
    }

    setLayoutLocalStorage(usuario: string, pestana: string) {
        this._layoutService.obtenerLayoutPorUsuario(usuario, pestana).subscribe({
            next: (res: any) => {
                const updated = { ...this.currentTablero, layout: res.data || [] };
                this.setTableroLocalStorage(updated);
            },
            error: (err) => console.error("Error sincronizando layout:", err)
        });
    }

    setPuertoLocalStorage(idPuerto: string): void {
        this.puertos = this._puertosService.getPuertosActuales()
        const index = this.puertos.findIndex(x => x.id_puerto == idPuerto)
        console.log('puerto seleccionado localstorage', idPuerto, this.puertos[index]);
        const updated = { ...this.currentTablero, puerto: this.puertos[index] };
        this.setTableroLocalStorage(updated);
    }

    setPestanaLocalStorage(nuevaPestana: string, usuario: string = 'SISTEMA_DEFAULT'): void {
        const updated = { ...this.currentTablero, pestana: nuevaPestana };
        this.setTableroLocalStorage(updated);
        this.setLayoutLocalStorage(usuario, nuevaPestana);
    }

    getPuertoLocalStorage(): Puerto {
        return this.currentTablero?.puerto || { id_puerto: 'BUENAVENTURA', nombre_puerto: 'Buenaventura' } as Puerto;
    }

    getPestanaLocalStorage(): string {
        return this.currentTablero?.pestana || 'TLC_MARITIMO_001';
    }

    getLayoutLocalStorage(): string {
        return this.currentTablero?.layout || [];
    }
    // #endregion


    // ====================================================================
    // #region GETTERS Y SETTERS TRADICIONALES QPLUS
    // ====================================================================

    getCurrentUserLocalStorage(): any {
        return this.getObject<any>('currentUser');
    }

    getUsuarioLocalStorage() {
        const currentUser = this.getCurrentUserLocalStorage();
        return currentUser ? currentUser.usuario : null;
    }

    getTokenLocalStorage() {
        const currentUser = this.getCurrentUserLocalStorage();
        return currentUser ? currentUser.token : null;
    }

    getNavSettingsLocalStorage(): NavSettings {
        return this.getObject<NavSettings>('navsettings') || new NavSettings();
    }

    getAplicaicionLocalStorage(): PTLAplicacionModel {
        return this.getNavSettingsLocalStorage().aplicacion || new PTLAplicacionModel();
    }

    getSuiteLocalStorage(): PTLSuiteAPModel {
        return this.getNavSettingsLocalStorage().suite || new PTLSuiteAPModel();
    }

    getModuloLocalStorage(): PTLModuloAP {
        return this.getNavSettingsLocalStorage().modulo || new PTLModuloAP();
    }

    getSuscriptorPlataformaLocalStorage() {
        return 'plataforma';
    }

    getSuscriptorLocalStorage(): PTLSuscriptorModel | null {
        const currentUser = this.getCurrentUserLocalStorage();
        return currentUser && currentUser.suscriptor ? currentUser.suscriptor : new PTLSuscriptorModel();
    }

    getDataModelsLocalStorage() {
        this.usuario = this.getUsuarioLocalStorage() || new PTLUsuarioModel();
        this.aplicacion = this.getAplicaicionLocalStorage();
        this.suite = this.getSuiteLocalStorage();
        this.modulo = this.getModuloLocalStorage();

        const modelo: BaseSessionModel = {
            codigoAplicacion: this.aplicacion.codigoAplicacion,
            codigoSuite: this.suite.codigoSuite,
            codigoModulo: this.modulo.codigoModulo,
            usuarioCreacion: this.usuario.codigoUsuario,
            usuarioModificacion: this.usuario.codigoUsuario,
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            dataLog: []
        };
        return modelo;
    }

    getLanguage(): string {
        return this.lang;
    }

    getFormRegistro() {
        this.FormRegistro = this.getObject<any>('FormRegistro') || [];
        return this.FormRegistro;
    }

    getThemeSettings() {
        const localSettings = localStorage.getItem('themeSettings');
        if (localSettings) {
            this.themeSettings = JSON.parse(localSettings);
        } else {
            this.themeSettings = {
                isDarkTheme: false,
                navbarColor: '#346BA6',
                iconosColor: '',
                textoColor: '',
                buttonsHoverColor: '#346BA6'
            } as ThemeSettingsModel;
        }
        return this.themeSettings;
    }

    getLanguageUrl() {
        return `//cdn.datatables.net/plug-ins/1.10.25/i18n/${this.lang === 'es' ? 'Spanish' : 'English'}.json`;
    }

    // --- SETTERS GLOBALES ---
    setNavSettingsLocalStorage(navsettings: NavSettings) {
        this.setObject('navsettings', navsettings);
        this.navsettings = navsettings;
    }

    setThemeSettingsLocalStorage(settings: ThemeSettingsModel) {
        this.setLocalObject('themeSettings', settings);
        this.themeSettings = settings;
    }

    setCurrentUserLocalStorage(data: CurrentUserModel) {
        this.setObject('currentUser', data);
        this.currentUser = data;
    }

    setUsuarioLocalStorage(usuario: PTLUsuarioModel) {
        const currentUser = { ...this.getCurrentUserLocalStorage(), usuario };
        this.setCurrentUserLocalStorage(currentUser);
        this.usuario = usuario;
    }

    setSuscriptorLocalStorage(data: PTLSuscriptorModel) {
        const currentUser = { ...this.getCurrentUserLocalStorage(), suscriptor: data };
        this.setCurrentUserLocalStorage(currentUser);
        this.suscriptor = data;
    }

    setRolesLocalStorage(roles: PTLRoleAPModel[]) {
        const currentUser = { ...this.getCurrentUserLocalStorage(), roles };
        this.setCurrentUserLocalStorage(currentUser);
        this.roles = roles;
    }

    setActividadesLocalStorage(actividades: PTLActividadModel[]) {
        const currentUser = { ...this.getCurrentUserLocalStorage(), actividades };
        this.setCurrentUserLocalStorage(currentUser);
        this.actividades = actividades;
    }

    setEmpresasLocalStorage(empresa: PTLEmpresaSCModel) {
        const currentUser = { ...this.getCurrentUserLocalStorage(), empresa };
        this.setCurrentUserLocalStorage(currentUser);
        this.empresa = empresa;
    }

    setTokenLocalStorage(token: any) {
        const currentUser = { ...this.getCurrentUserLocalStorage(), token };
        this.setCurrentUserLocalStorage(currentUser);
        this.token = token;
    }

    setAplicacionLocalStorage(aplicacion: PTLAplicacionModel) {
        const navSetts = { ...this.getNavSettingsLocalStorage(), aplicacion };
        this.setNavSettingsLocalStorage(navSetts);
        this.aplicacion = aplicacion;
    }

    setSuiteLocalStorage(suite: PTLSuiteAPModel) {
        const navSetts = { ...this.getNavSettingsLocalStorage(), suite };
        this.setNavSettingsLocalStorage(navSetts);
        this.suite = suite;
    }

    setModuloLocalStorage(modulo: PTLModuloAP) {
        const navSetts = { ...this.getNavSettingsLocalStorage(), modulo };
        this.setNavSettingsLocalStorage(navSetts);
        this.modulo = modulo;
    }

    setLanguage(lang: string) {
        localStorage.setItem('lang', lang);
        this.lang = lang;
    }

    setFormRegistro(FormRegistro: any) {
        this.setObject('FormRegistro', FormRegistro);
        this.FormRegistro = FormRegistro;
    }

    // --- REMOVERS ---
    removeFormRegistro() {
        this.removeObject('FormRegistro');
    }

    setLogOut() {
        this.removeObject('currentUser');
        this.removeObject('navsettings');
        this.removeObject('FormRegistro');
        localStorage.removeItem('currentTablero'); // Opcional: limpiar settings al salir
    }
    // #endregion
}



/*
    Author: German Valencia
    Patrón: QPLUS Orchestrator Service - Sincronizado y Persistente
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Injectable } from '@angular/core';

// // Modelos
// import { PTLUsuarioModel } from '../_helpers/models/PTLUsuario.model';
// import { PTLAplicacionModel } from '../_helpers/models/PTLAplicacion.model';
// import { PTLSuiteAPModel } from '../_helpers/models/PTLSuiteAP.model';
// import { PTLModuloAP } from '../_helpers/models/PTLModuloAP.model';
// import { BaseSessionModel } from '../_helpers/models/BaseSession.model';
// import { ThemeSettingsModel } from '../_helpers/models/ThemeSettings.model';
// import { NavSettings } from '../_helpers/models/navSettings.model';
// import { PTLSuscriptorModel } from '../_helpers/models/PTLSuscriptor.model';
// import { CurrentUserModel } from '../_helpers/models/CurrentUser.model';
// import { PTLRoleAPModel } from '../_helpers/models/PTLRoleAP.model';
// import { PTLEmpresaSCModel } from '../_helpers/models/PTLEmpresaSC.model';
// import { PTLActividadModel } from '../_helpers/models/PTLActividades.model';
// import { Puerto } from '../_helpers/models/tablero-control/puerto.model';
// import { CurrentTableroModel } from '../_helpers/models/CurrentTableroSettings.model';

// // Servicios
// import { LayoutService } from './tablero-control/layout.service';
// import { PuertosService } from './tablero-control/puertos.service';

// @Injectable({
//     providedIn: 'root'
// })
// export class LocalStorageService {
//     // Estado Base
//     DataModel: BaseSessionModel = new BaseSessionModel();
//     navsettings: NavSettings = new NavSettings();
//     tableroSettings: CurrentTableroModel = new CurrentTableroModel();

//     public usuario: any = {};
//     public token: any;
//     public currentUser: any;
//     public currentTablero: CurrentTableroModel = new CurrentTableroModel();
//     public puerto: any;
//     public pestana: string = 'TLC_MARITIMO_001';
//     public aplicacion: any = {};
//     public suite: any = {};
//     public modulo: any = {};
//     public suscriptor: any = {};
//     public empresa: any = {};
//     public FormRegistro: any;
//     public lang: string = 'es';
//     public themeSettings: any;
//     public layout: any;
//     public roles: PTLRoleAPModel[] = [];
//     public actividades: PTLActividadModel[] = [];

//     constructor(
//         private _layoutService: LayoutService,
//         private _puertosService: PuertosService
//     ) {
//         // Inicialización automática
//         this.getTableroLocalStorage();
//     }

//     // ====================================================================
//     // #region MÉTODOS GENÉRICOS DE ALMACENAMIENTO
//     // ====================================================================
//     getObject<T>(key: string): T | null {
//         const value = sessionStorage.getItem(key);
//         if (!value) return null;
//         try { return JSON.parse(value) as T; } catch (error) { return null; }
//     }

//     setObject(key: string, value: any): void {
//         if (value === null || value === undefined) return;
//         sessionStorage.setItem(key, JSON.stringify(value));
//     }

//     removeObject(key: string): void {
//         sessionStorage.removeItem(key);
//     }

//     getLocalObject<T>(key: string): T | null {
//         const value = localStorage.getItem(key);
//         if (!value) return null;
//         try { return JSON.parse(value) as T; } catch (error) { return null; }
//     }

//     setLocalObject(key: string, value: any): void {
//         if (value === null || value === undefined) return;
//         localStorage.setItem(key, JSON.stringify(value));
//     }
//     // #endregion

//     // ====================================================================
//     // #region MÉTODOS DEL TABLERO DE CONTROL (SYNC STATE)
//     // ====================================================================
//     getTableroLocalStorage(): CurrentTableroModel {
//         const localTablero = localStorage.getItem('currentTablero');
//         if (localTablero) {
//             this.currentTablero = JSON.parse(localTablero);
//         } else {
//             // Valor por defecto
//             this.currentTablero = {
//                 puerto: this.setPuertoLocalStorage('BUENAVENTURA'),
//                 pestana: 'TLC_MARITIMO_001',
//                 layout: []
//             };
//             this.setTableroLocalStorage(this.currentTablero);
//             this.setLayoutLocalStorage('SISTEMA_DEFAULT', this.currentTablero.pestana || '');
//         }
//         this.puerto = this.currentTablero.puerto;
//         this.pestana = this.currentTablero.pestana || '';
//         return this.currentTablero;
//     }

//     setTableroLocalStorage(data: CurrentTableroModel): void {
//         this.setLocalObject('currentTablero', data);
//         this.currentTablero = data;
//         this.tableroSettings = data;
//         this.puerto = data.puerto;
//         this.layout = data.layout;
//         this.pestana = data.pestana || '';
//     }

//     setLayoutLocalStorage(usuario: string, pestana: string) {
//         this._layoutService.obtenerLayoutPorUsuario(usuario, pestana).subscribe({
//             next: (res: any) => {
//                 const updated = { ...this.currentTablero, layout: res.data || [] };
//                 this.setTableroLocalStorage(updated);
//             },
//             error: (err) => console.error("Error sincronizando layout:", err)
//         });
//     }

//     setPuertoLocalStorage(idPuerto: string): void {
//         this._puertosService.getPuertoByCode(idPuerto).subscribe({
//             next: (puertoCompleto) => {
//                 const updated = { ...this.currentTablero, puerto: puertoCompleto };
//                 this.setTableroLocalStorage(updated);
//             },
//             error: (err) => console.error("Error al sincronizar puerto completo:", err)
//         });
//     }

//     setPestanaLocalStorage(nuevaPestana: string, usuario: string = 'SISTEMA_DEFAULT'): void {
//         const updated = { ...this.currentTablero, pestana: nuevaPestana };
//         this.setTableroLocalStorage(updated);
//         this.setLayoutLocalStorage(usuario, nuevaPestana);
//     }

//     getPuertoLocalStorage(): Puerto {
//         return this.currentTablero?.puerto || { id_puerto: 'BUENAVENTURA', nombre_puerto: 'Buenaventura' } as Puerto;
//     }

//     getPestanaLocalStorage(): string {
//         return this.currentTablero?.pestana || 'TLC_MARITIMO_001';
//     }

//     getLayoutLocalStorage(): string {
//         return this.currentTablero?.layout || [];
//     }
//     // #endregion

//     // ====================================================================
//     // #region GETTERS QPLUS
//     // ====================================================================
//     getCurrentUserLocalStorage(): any { return this.getObject<any>('currentUser'); }

//     getUsuarioLocalStorage() {
//         const currentUser = this.getCurrentUserLocalStorage();
//         return currentUser ? currentUser.usuario : null;
//     }

//     getTokenLocalStorage() {
//         const currentUser = this.getCurrentUserLocalStorage();
//         return currentUser ? currentUser.token : null;
//     }

//     getNavSettingsLocalStorage(): NavSettings {
//         return this.getObject<NavSettings>('navsettings') || new NavSettings();
//     }

//     getAplicaicionLocalStorage(): PTLAplicacionModel {
//         const navSetts = this.getNavSettingsLocalStorage();
//         return navSetts.aplicacion || new PTLAplicacionModel();
//     }

//     getSuiteLocalStorage(): PTLSuiteAPModel {
//         const navSetts = this.getNavSettingsLocalStorage();
//         return navSetts.suite || new PTLSuiteAPModel();
//     }

//     getModuloLocalStorage(): PTLModuloAP {
//         const navSetts = this.getNavSettingsLocalStorage();
//         return navSetts.modulo || new PTLModuloAP();
//     }

//     getSuscriptorPlataformaLocalStorage() { return 'plataforma'; }

//     getSuscriptorLocalStorage(): PTLSuscriptorModel | null {
//         const currentUser = this.getCurrentUserLocalStorage();
//         return currentUser && currentUser.suscriptor ? currentUser.suscriptor : new PTLSuscriptorModel();
//     }

//     getDataModelsLocalStorage() {
//         this.usuario = this.getUsuarioLocalStorage() || new PTLUsuarioModel();
//         this.aplicacion = this.getAplicaicionLocalStorage();
//         this.suite = this.getSuiteLocalStorage();
//         this.modulo = this.getModuloLocalStorage();

//         return {
//             codigoAplicacion: this.aplicacion.codigoAplicacion,
//             codigoSuite: this.suite.codigoSuite,
//             codigoModulo: this.modulo.codigoModulo,
//             usuarioCreacion: this.usuario.codigoUsuario,
//             usuarioModificacion: this.usuario.codigoUsuario,
//             fechaCreacion: new Date(),
//             fechaModificacion: new Date(),
//             dataLog: []
//         } as BaseSessionModel;
//     }

//     getLanguage(): string { return this.lang; }

//     getFormRegistro() {
//         this.FormRegistro = this.getObject<any>('FormRegistro') || [];
//         return this.FormRegistro;
//     }

//     getPuertoSeleccionado() {
//         this.puerto = this.getObject<any>('puerto') || [];
//         return this.puerto;
//     }

//     getThemeSettings() {
//         const localSettings = localStorage.getItem('themeSettings');
//         if (localSettings) {
//             this.themeSettings = JSON.parse(localSettings);
//         } else {
//             this.themeSettings = {
//                 isDarkTheme: false,
//                 navbarColor: '#346BA6',
//                 iconosColor: '',
//                 textoColor: '',
//                 buttonsHoverColor: '#346BA6'
//             } as ThemeSettingsModel;
//         }
//         return this.themeSettings;
//     }

//     getLanguageUrl() {
//         return `//cdn.datatables.net/plug-ins/1.10.25/i18n/${this.lang === 'es' ? 'Spanish' : 'English'}.json`;
//     }
//     // #endregion

//     // ====================================================================
//     // #region SETTERS QPLUS
//     // ====================================================================
//     setNavSettingsLocalStorage(navsettings: NavSettings) {
//         this.setObject('navsettings', navsettings);
//         this.navsettings = navsettings;
//     }

//     setThemeSettingsLocalStorage(settings: ThemeSettingsModel) {
//         this.setLocalObject('themeSettings', settings);
//         this.themeSettings = settings;
//     }

//     setCurrentUserLocalStorage(data: CurrentUserModel) {
//         this.setObject('currentUser', data);
//         this.currentUser = data;
//     }

//     setUsuarioLocalStorage(usuario: PTLUsuarioModel) {
//         const currentUser = { ...this.getCurrentUserLocalStorage(), usuario };
//         this.setCurrentUserLocalStorage(currentUser);
//         this.usuario = usuario;
//     }

//     setSuscriptorLocalStorage(data: PTLSuscriptorModel) {
//         const currentUser = { ...this.getCurrentUserLocalStorage(), suscriptor: data };
//         this.setCurrentUserLocalStorage(currentUser);
//         this.suscriptor = data;
//     }

//     setRolesLocalStorage(roles: PTLRoleAPModel[]) {
//         const currentUser = { ...this.getCurrentUserLocalStorage(), roles };
//         this.setCurrentUserLocalStorage(currentUser);
//         this.roles = roles;
//     }

//     setActividadesLocalStorage(actividades: PTLActividadModel[]) {
//         const currentUser = { ...this.getCurrentUserLocalStorage(), actividades };
//         this.setCurrentUserLocalStorage(currentUser);
//         this.actividades = actividades;
//     }

//     setEmpresasLocalStorage(empresa: PTLEmpresaSCModel) {
//         const currentUser = { ...this.getCurrentUserLocalStorage(), empresa };
//         this.setCurrentUserLocalStorage(currentUser);
//         this.empresa = empresa;
//     }

//     setTokenLocalStorage(token: any) {
//         const currentUser = { ...this.getCurrentUserLocalStorage(), token };
//         this.setCurrentUserLocalStorage(currentUser);
//         this.token = token;
//     }

//     setAplicacionLocalStorage(aplicacion: PTLAplicacionModel) {
//         const navSetts = { ...this.getNavSettingsLocalStorage(), aplicacion };
//         this.setNavSettingsLocalStorage(navSetts);
//         this.aplicacion = aplicacion;
//     }

//     setSuiteLocalStorage(suite: PTLSuiteAPModel) {
//         const navSetts = { ...this.getNavSettingsLocalStorage(), suite };
//         this.setNavSettingsLocalStorage(navSetts);
//         this.suite = suite;
//     }

//     setModuloLocalStorage(modulo: PTLModuloAP) {
//         const navSetts = { ...this.getNavSettingsLocalStorage(), modulo };
//         this.setNavSettingsLocalStorage(navSetts);
//         this.modulo = modulo;
//     }

//     setLanguage(lang: string) {
//         localStorage.setItem('lang', lang);
//         this.lang = lang;
//     }

//     setFormRegistro(FormRegistro: any) {
//         this.setObject('FormRegistro', FormRegistro);
//         this.FormRegistro = FormRegistro;
//     }

//     // ====================================================================
//     // #region REMOVERS
//     // ====================================================================
//     removeFormRegistro() {
//         this.removeObject('FormRegistro');
//     }

//     setLogOut() {
//         this.removeObject('currentUser');
//         this.removeObject('navsettings');
//         this.removeObject('FormRegistro');
//         localStorage.removeItem('currentTablero');
//     }
//     // #endregion
// }
