// angular import
import { Component } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CommonContentComponent } from '../common-content/common-content.component';

@Component({
  selector: 'app-theme-horizontal-l2',
  standalone: true,
  imports: [SharedModule, CommonContentComponent],
  templateUrl: './theme-horizontal-l2.component.html',
  styleUrls: ['./theme-horizontal-l2.component.scss']
})
export default class ThemeHorizontalL2Component {}
