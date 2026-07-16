/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'
import { ColorPickerModule } from 'ngx-color-picker'
import { Subscription, tap, catchError, of } from 'rxjs'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { PTLSuiteAPModel } from 'src/app/theme/shared/_helpers/models/PTLSuiteAP.model'
import { LocalStorageService } from 'src/app/theme/shared/service/local-storage.service'
import { PtlSuitesAPService } from 'src/app/theme/shared/service/ptlsuites-ap.service'
import { SharedModule } from 'src/app/theme/shared/shared.module'
import { LanguageSelectorComponent } from 'src/app/theme/shared/components/language-selector/language-selector.component'
import { environment } from 'src/environments/environment'
import { FullScreenSliderComponent } from 'src/app/theme/shared/components/fullscreen-slider/fullscreen-slider.component'
import { PtlAplicacionesService, ThemeService } from 'src/app/theme/shared/service'
import { NavSettings } from 'src/app/theme/shared/_helpers/models/navSettings.model'

const base_url = environment.apiUrl

@Component({
    selector: 'app-inicio-suites',
    standalone: true,
    imports: [NgbDropdownModule, RouterModule, ColorPickerModule, SharedModule, LanguageSelectorComponent, FullScreenSliderComponent],
    templateUrl: './inicio-suites.component.html',
    styleUrl: './inicio-suites.component.scss'
})
export class InicioSuitesComponent implements OnInit {
    nomAplicacion: string = ''
    app: PTLAplicacionModel = new PTLAplicacionModel()
    suitesSub?: Subscription
    suites: PTLSuiteAPModel[] = []
    suscriptor: string = ''
    navSettings: NavSettings = new NavSettings()

    constructor(
        private router: Router,
        private _localStorageService: LocalStorageService,
        private _themeStorage: ThemeService,
        private _suitesService: PtlSuitesAPService
    ) {
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
        console.log('no hay suscriptor suscriptor')
    }

    ngOnInit(): void {
        const navSetts = this._localStorageService.getObject<any>('navsettings');
        const app = navSetts.aplicacion;
        console.log('navSettings storage', navSetts.aplicacion)
        this.nomAplicacion = app.nombreAplicacion || ''
        this.navSettings = this._localStorageService.getNavSettingsLocalStorage()
        this.app = this.navSettings.aplicacion || {}
        this.consultarSuites()
    }

    consultarSuites() {
        const suis = this._suitesService.getSuitesActuales()
        const suitesApp = suis.filter(x => x.codigoAplicacion == this.app.codigoAplicacion)
        suitesApp.forEach(suite => {
            suite.imagenInicio = `${base_url}/upload/${this.suscriptor}/suites/${suite.imagenInicio}`
        })
        this.suites = suitesApp
    }

    ingresaSuiteaplicacion(suite: PTLSuiteAPModel) {
        console.log('ingresar a la suite', suite)
        this._localStorageService.setSuiteLocalStorage(suite)
        this._themeStorage.saveThemeSettings()
        this.router.navigate([suite.rutaInicio])
        // this._suitesService.geSuitesAP().subscribe((resp) => {
        //   const suites = resp.suites.filter((x: { codigoAplicacion: string }) => x.codigoAplicacion == app.codigoAplicacion);
        //   if (suites.length < 2) {
        //     this._localStorageService.setSuiteLocalStorage(suites[0]);
        //   } else {
        //     this.router.navigate(['/starter/inicio-suites']);
        //   }
        // });
    }
}
