import { Component, OnInit } from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { FullScreenSliderComponent } from 'src/app/theme/shared/components/fullscreen-slider/fullscreen-slider.component'
import { LanguageSelectorComponent } from 'src/app/theme/shared/components/language-selector/language-selector.component'
import { SocialNetworksComponent } from 'src/app/theme/shared/components/social-networks/social-networks.component'

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [RouterModule, FullScreenSliderComponent, LanguageSelectorComponent, TranslateModule, SocialNetworksComponent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {
  classList!: { toggle: (arg0: string) => void }

  constructor (private router: Router) {}

  ngOnInit () {
    const toggleActualPassword = document.querySelector('#toggleActualPassword')
    const actualPassword = document.querySelector('#actualPassword')
    const toggleNewPassword = document.querySelector('#toggleNewPassword')
    const newPassword = document.querySelector('#newPassword')
    const toggleRetypePassword = document.querySelector('#toggleRetypePassword')
    const retypePassword = document.querySelector('#retypePassword')

    toggleActualPassword?.addEventListener('click', () => {
      // toggle the type attribute
      const type = actualPassword?.getAttribute('type') === 'password' ? 'text' : 'password'
      actualPassword?.setAttribute('type', type)

      // toggle the icon
      this.classList.toggle('icon-eye-off')
    })

    toggleNewPassword?.addEventListener('click', () => {
      // toggle the type attribute
      const type = newPassword?.getAttribute('type') === 'password' ? 'text' : 'password'
      newPassword?.setAttribute('type', type)

      // toggle the icon
      this.classList.toggle('icon-eye-off')
    })

    toggleRetypePassword?.addEventListener('click', () => {
      // toggle the type attribute
      const type = retypePassword?.getAttribute('type') === 'password' ? 'text' : 'password'
      retypePassword?.setAttribute('type', type)

      // toggle the icon
      this.classList.toggle('icon-eye-off')
    })
  }

  onRegresarClick () {
    this.router.navigate(['/autenticacion/login'])
  }
}
