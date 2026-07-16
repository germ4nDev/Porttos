// angular import
import { Component } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CommonContentComponent } from '../common-content/common-content.component';

@Component({
  selector: 'app-theme-rtl-v',
  standalone: true,
  imports: [SharedModule, CommonContentComponent],
  templateUrl: './theme-rtl-v.component.html',
  styleUrls: ['./theme-rtl-v.component.scss']
})
export default class ThemeRtlVComponent {}
