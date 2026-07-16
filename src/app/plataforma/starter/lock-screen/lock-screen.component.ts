import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FullScreenSliderComponent } from "src/app/theme/shared/components/fullscreen-slider/fullscreen-slider.component";
import { LanguageSelectorComponent } from "src/app/theme/shared/components/language-selector/language-selector.component";

@Component({
  selector: 'app-lock-screen',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FullScreenSliderComponent, LanguageSelectorComponent],
  templateUrl: './lock-screen.component.html',
  styleUrl: './lock-screen.component.scss'
})
export class LockScreenComponent {
    constructor(private router: Router) {

    }
    unlokScreen() {
        this.router.navigate(['/starter/unlock-screen']);
    }
}
