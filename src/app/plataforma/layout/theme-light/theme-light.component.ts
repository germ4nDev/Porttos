// angular import
import { Component } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CommonContentComponent } from '../common-content/common-content.component';

@Component({
  selector: 'app-theme-light',
  standalone: true,
  imports: [SharedModule, CommonContentComponent],
  templateUrl: './theme-light.component.html',
  styleUrls: ['./theme-light.component.scss']
})
export default class ThemeLightComponent {}
