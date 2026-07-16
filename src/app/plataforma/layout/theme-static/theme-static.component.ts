// angular import
import { Component } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CommonContentComponent } from '../common-content/common-content.component';

@Component({
  selector: 'app-theme-static',
  standalone: true,
  imports: [SharedModule, CommonContentComponent],
  templateUrl: './theme-static.component.html',
  styleUrls: ['./theme-static.component.scss']
})
export default class ThemeStaticComponent {}
