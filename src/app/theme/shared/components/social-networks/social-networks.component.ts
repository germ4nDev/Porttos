import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-social-networks',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './social-networks.component.html',
  styleUrl: './social-networks.component.scss'
})
export class SocialNetworksComponent {
  constructor (private translate: TranslateService) {}
}
