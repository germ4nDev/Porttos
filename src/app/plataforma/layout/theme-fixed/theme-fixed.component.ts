// angular import
import { Component } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CommonContentComponent } from '../common-content/common-content.component';

@Component({
  selector: 'app-theme-fixed',
  standalone: true,
  imports: [SharedModule, CommonContentComponent],
  templateUrl: './theme-fixed.component.html',
  styleUrls: ['./theme-fixed.component.scss']
})
export default class ThemeFixedComponent {}
