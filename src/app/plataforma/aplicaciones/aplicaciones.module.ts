import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgbModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap'

import { AplicacionesRoutingModule } from './aplicaciones-routing.module'
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumb/breadcrumb.component'

@NgModule({
  declarations: [],
  imports: [CommonModule, AplicacionesRoutingModule, NgbModule, NgbDatepickerModule],
  providers: [BreadcrumbComponent]
})
export class AplicacionesModule {}
