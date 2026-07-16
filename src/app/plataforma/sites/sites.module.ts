import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SitesRoutingModule } from './sites-routing.module';
import { SharedModule } from '../../theme/shared/shared.module';

@NgModule({
  imports: [
    CommonModule, SitesRoutingModule, SharedModule
  ],
  declarations: [],
  providers: []
})
export class SitesModule { }
