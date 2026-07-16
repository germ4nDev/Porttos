/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataTablesModule } from 'angular-datatables';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PTLSitiosAPModel } from 'src/app/theme/shared/_helpers/models/PTLSitioAP.model';
import { GradientConfig } from 'src/app/app-config';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  textoBienvenida = '';
  //#region VARIABLES
  registrosSub?: Subscription;
  registros: PTLSitiosAPModel[] = [];
  registrosFiltrado: PTLSitiosAPModel[] = [];
  aplicaciones: PTLAplicacionModel[] = [];
  aplicacionesSub?: Subscription;
  lang: string = localStorage.getItem('lang') || '';
  tituloPagina: string = '';
  gradientConfig;
  hasFiltersSlot: boolean = false;
  menuItems$!: Observable<NavigationItem[]>;
  private menuSubscription: Subscription = new Subscription();
  activeTab: 'menu' | 'filters' | 'main' = 'menu';
  //#endregion VARIABLES

  constructor(
    private router: Router,
    private translate: TranslateService,
    private _navigationService: NavigationService
  ) {
    this.gradientConfig = GradientConfig;
  }

  ngOnInit() {
    this._navigationService.getNavigationItems();
    this.menuItems$ = this._navigationService.menuItems$;
    this.hasFiltersSlot = true;
  }

    ingresarQplusWeb(): void {
    this.router.navigate(['/websites/qplus']);
  }

  toggleNav(): void {
    this.toggleSidebar.emit();
  }

}
