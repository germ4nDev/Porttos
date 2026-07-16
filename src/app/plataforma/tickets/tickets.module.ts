import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TicketsRoutingModule } from './tickets-routing.module';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumb/breadcrumb.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule, TicketsRoutingModule
  ],
      providers: [BreadcrumbComponent]
})
export class TicketsModule { }
