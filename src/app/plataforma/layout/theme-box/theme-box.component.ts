// angular import
import { Component } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CommonContentComponent } from '../common-content/common-content.component';

@Component({
  selector: 'app-theme-box',
  standalone: true,
  imports: [SharedModule, CommonContentComponent],
  templateUrl: './theme-box.component.html',
  styleUrls: ['./theme-box.component.scss']
})
export default class ThemeBoxComponent {}
