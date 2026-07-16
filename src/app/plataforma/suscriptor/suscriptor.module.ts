import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuscriptorRoutingModule } from './suscriptor-routing.module';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumb/breadcrumb.component';

@NgModule({
  declarations: [],
  imports: [CommonModule, SuscriptorRoutingModule],
  providers: [BreadcrumbComponent]
})
export class SuscriptorModule {}
