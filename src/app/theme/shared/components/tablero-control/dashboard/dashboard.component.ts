/*
    Author: German Valencia
    Refactored for: QPLUS Architecture, Dashboard Operations & State Management
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'src/app/theme/shared/service/local-storage.service';
import { SwalAlertService } from 'src/app/theme/shared/service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-tablero-control-portuario',
    standalone: true,
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
