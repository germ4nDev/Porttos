import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { PTLBiblioteca } from 'src/app/theme/shared/_helpers/models/PTLBiblioteca.model'
import { PTLFormatoGaleria } from 'src/app/theme/shared/_helpers/models/PTLFormatoGaleria.model'
import { PTLGaleria } from 'src/app/theme/shared/_helpers/models/PTLGaleria.model'
import { PTLModuloAP } from 'src/app/theme/shared/_helpers/models/PTLModuloAP.model'
import { PTLTiposGaleria } from 'src/app/theme/shared/_helpers/models/PTLTiposGaleria.model'
import { BibliotecaComponent } from 'src/app/theme/shared/components/biblioteca/biblioteca.component'
import {
  PtlBibliotecasService,
  PtlGaleriasService,
  PtlformatosGaleriaService,
  PtlTiposGaleriaService,
  LocalStorageService
} from 'src/app/theme/shared/service'
import { LanguageSelectorComponent } from "src/app/theme/shared/components/language-selector/language-selector.component";

@Component({
  selector: 'app-help-modulos',
  standalone: true,
  imports: [NavBarComponent, BibliotecaComponent, LanguageSelectorComponent],
  templateUrl: './help-modulos.component.html',
  styleUrl: './help-modulos.component.scss'
})
export class HelpModulosComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>()
  modulo: PTLModuloAP = new PTLModuloAP()
  biblioteca: PTLBiblioteca = new PTLBiblioteca()
  bibliotecas: PTLBiblioteca[] = []
  galerias: PTLGaleria[] = []
  galeriasModulo: PTLGaleria[] = []
  formatosGaleria: PTLFormatoGaleria[] = []
  tiposGaleria: PTLTiposGaleria[] = []
  codModulo = ''

  constructor (
    private _bibliotecasService: PtlBibliotecasService,
    private _galeriasService: PtlGaleriasService,
    private _formatosGaleriaService: PtlformatosGaleriaService,
    private _tiposGaleiaService: PtlTiposGaleriaService,
    private _localStorageService: LocalStorageService
  ) {}

  ngOnInit (): void {
    const navSettings = this._localStorageService.getNavSettingsLocalStorage()
    this.modulo = navSettings?.modulo || {}

    this.bibliotecas = this._bibliotecasService.getBibliotecasActuales()
    this.galerias = this._galeriasService.getGaleriasActuales()
    this.formatosGaleria = this._formatosGaleriaService.getFormatosGaleriaActuales()
    this.tiposGaleria = this._tiposGaleiaService.getTiposGaleriaActuales()

    if (this.modulo.codigoBiblioteca && this.modulo.codigoModulo) {
      this.galeriasModulo = this.galerias.filter(
        x => x.codigoBiblioteca === this.modulo.codigoBiblioteca && x.codigoModulo === this.modulo.codigoModulo
      )
    } else {
      this.galeriasModulo = []
    }
  }

  toggleNav (): void {
    this.toggleSidebar.emit()
  }
}
