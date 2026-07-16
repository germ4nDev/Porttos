import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { AdministracionBDRoutingModule } from './administracion-bd-routing.module'
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumb/breadcrumb.component'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'

@NgModule({
  declarations: [],
  imports: [CommonModule, AdministracionBDRoutingModule, NgbModule],
  providers: [BreadcrumbComponent]
})
export class AdministracionBDModule {}
