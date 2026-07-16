import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableroControlRoutingModule } from './tablero-control-routing.module';
import { NgxMapLibreGLModule } from 'ngx-maplibre-gl';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        FormsModule,
        NgxMapLibreGLModule,
        TableroControlRoutingModule
    ]
})
export class TableroControlModule { }
