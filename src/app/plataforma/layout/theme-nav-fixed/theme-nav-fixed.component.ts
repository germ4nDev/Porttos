// angular import
import { Component } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CommonContentComponent } from '../common-content/common-content.component';

@Component({
  selector: 'app-theme-nav-fixed',
  standalone: true,
  imports: [SharedModule, CommonContentComponent],
  templateUrl: './theme-nav-fixed.component.html',
  styleUrls: ['./theme-nav-fixed.component.scss']
})
export default class ThemeNavFixedComponent {}
