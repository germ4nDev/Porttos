import { Component, OnInit } from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { FullScreenSliderComponent } from 'src/app/theme/shared/components/fullscreen-slider/fullscreen-slider.component'
import { LanguageSelectorComponent } from 'src/app/theme/shared/components/language-selector/language-selector.component'
import { SocialNetworksComponent } from 'src/app/theme/shared/components/social-networks/social-networks.component'

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterModule, FullScreenSliderComponent, LanguageSelectorComponent, TranslateModule, SocialNetworksComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  nuevaClave: string = ''
  constructor (private router: Router) {}

  ngOnInit (): void {
    // Lo generamos al cargar la vista
    this.nuevaClave = this.generarCodigoAleatorio()
    console.log('Tu vector aleatorio es:', this.nuevaClave)
    // Ejemplo de salida: "aB3x9Yq2"
  }

  generarCodigoAleatorio (): string {
    const caracteresPermitidos = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let resultado = ''
    for (let i = 0; i < 8; i++) {
      resultado += caracteresPermitidos.charAt(Math.floor(Math.random() * caracteresPermitidos.length))
    }
    return resultado
  }

  onRegresarClick () {
    this.router.navigate(['/autenticacion/login'])
  }
}
