import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListaPreciosRoutingModule } from './lista-precios-routing.module'
import { SharedModule } from 'src/app/theme/shared/shared.module';

@NgModule({
  imports: [
    CommonModule, ListaPreciosRoutingModule, SharedModule
  ],
  declarations: [],
  providers: []
})
export class ListaPreciosModule { }
