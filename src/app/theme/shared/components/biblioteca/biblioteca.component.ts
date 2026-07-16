import { CommonModule } from '@angular/common'
import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { VideoPlayerComponent } from '../video-player/video-player.component'
import { PTLBiblioteca } from '../../_helpers/models/PTLBiblioteca.model'
import { TodoListRemoveDirective } from '../../directive/todo-list-remove.directive'
import { PTLGaleria } from '../../_helpers/models/PTLGaleria.model'
import { LocalStorageService, PtlBibliotecasService, PtlformatosGaleriaService, PtlGaleriasService, PtlTiposGaleriaService } from '../../service'
import { PTLModuloAP } from '../../_helpers/models/PTLModuloAP.model'
import { PTLFormatoGaleria } from '../../_helpers/models/PTLFormatoGaleria.model'
import { PTLTiposGaleria } from '../../_helpers/models/PTLTiposGaleria.model'

@Component({
  selector: 'app-biblioteca',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, VideoPlayerComponent],
  templateUrl: './biblioteca.component.html',
  styleUrl: './biblioteca.component.scss'
})
export class BibliotecaComponent implements OnInit, OnDestroy {
  @Input() galeriasModulo: PTLGaleria[] = []

  constructor () {}

  ngOnInit (): void {
  }

  ngOnDestroy (): void {}
}
