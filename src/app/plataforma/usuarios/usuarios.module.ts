import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsuariosRoutingModule } from './usuarios-routing.module';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumb/breadcrumb.component';

@NgModule({
  declarations: [],
  imports: [CommonModule, UsuariosRoutingModule],
  providers: [BreadcrumbComponent]
})
export class UsuariosModule {}
