// angular import
import { Component } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-common-content',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './common-content.component.html',
  styleUrls: ['./common-content.component.scss']
})
export class CommonContentComponent {}
