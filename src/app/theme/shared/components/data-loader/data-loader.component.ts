import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-data-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-loader.component.html',
  styleUrl: './data-loader.component.scss'
})
export class DataLoaderComponent {
  @Input() isLoading: boolean = false
  @Input() message: string = 'Cargando información...'
}
