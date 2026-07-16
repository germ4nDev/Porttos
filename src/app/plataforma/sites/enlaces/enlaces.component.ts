/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import Swal from 'sweetalert2';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PTLEnlacesSTService } from 'src/app/theme/shared/service/ptlenlaces-st.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, Observable, of, Subscription, tap } from 'rxjs';
import { GradientConfig } from 'src/app/app-config';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { PTLEnlaceSTModel } from 'src/app/theme/shared/_helpers/models/PTLEnlaceST.model';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component';
import { PTLSitiosAPModel } from 'src/app/theme/shared/_helpers/models/PTLSitioAP.model';
import { PTLSitiosAPService } from 'src/app/theme/shared/service/ptlsitios-ap.service';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';

@Component({
  selector: 'app-enlaces',
  standalone: true,
  imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
  templateUrl: './enlaces.component.html',
  styleUrls: ['./enlaces.component.scss']
})
export class EnlacesComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  //#region VARIABLES
  registrosSub?: Subscription;
  registros: PTLEnlaceSTModel[] = [];
  registrosFiltrado: PTLEnlaceSTModel[] = [];
  sitios: PTLSitiosAPModel[] = [];
  sitiosSub?: Subscription;
  lang: string = localStorage.getItem('lang') || '';
  tituloPagina: string = '';
  gradientConfig;
  hasFiltersSlot: boolean = false;
  menuItems!: Observable<NavigationItem[]>;
  activeTab: 'menu' | 'filters' | 'main' = 'menu';
  //#endregion VARIABLES

  constructor(
    private router: Router,
    private translate: TranslateService,
    private _enlacesService: PTLEnlacesSTService,
    private _navigationService: NavigationService,
    private _sitiosService: PTLSitiosAPService
  ) {
    this.gradientConfig = GradientConfig;
  }

  ngOnInit() {
    this._navigationService.getNavigationItems();
    this.menuItems = this._navigationService.menuItems$;
    this.hasFiltersSlot = true;
    this.consultarSitios();
    this.consultarRegistros();
  }

  consultarRegistros() {
    this.registrosSub = this._enlacesService
      .getRegistros()
      .pipe(
        tap((resp: any) => {
          if (resp.ok) {
            resp.enlaces.forEach((enlace: any) => {
              enlace.nomEstado = enlace.estadoEnlace == true ? 'Activa' : 'Inactiva';
              enlace.nomSitio = this.sitios.filter((x) => x.sitioId == enlace.sitioId)[0].nombreSitio || '';
            });
            this.registros = resp.enlaces;
            this.registrosFiltrado = resp.enlaces;
            console.log('Todos los enlaces', this.registros);
            return;
          }
        }),
        catchError((err) => {
          console.log('Ha ocurrido un error', err);
          return of(null);
        })
      )
      .subscribe();
  }

  columnasRegistros: ColumnMetadata[] = [
    {
      name: 'nomSitio',
      header: 'SITIOS.ENLACES.NAMESITIO',
      type: 'text'
    },
    {
      name: 'nombreEnlace',
      header: 'SITIOS.ENLACES.NAME',
      type: 'text'
    },
    {
      name: 'rutaEnlace',
      header: 'SITIOS.ENLACES.RUTA',
      type: 'text'
    },
    {
      name: 'nomEstado',
      header: 'SITIOS.ENLACES.STATUS',
      type: 'text'
    }
  ];

  columnasDetailRegistros: ColumnMetadata[] = [
    {
      name: 'descripcionEnlace',
      header: 'SITIOS.ENLACES.DESCRIPTION',
      type: 'text'
    }
  ];

  consultarSitios() {
    this.sitiosSub = this._sitiosService
      .getRegistros()
      .pipe(
        tap((resp: any) => {
          if (resp.ok) {
            this.sitios = resp.sitios;
            console.log('Todos las sitios', this.sitios);
            return;
          }
        }),
        catchError((err) => {
          console.log('Ha ocurrido un error', err);
          return of(null);
        })
      )
      .subscribe();
  }

  OnNuevoRegistroClick() {
    this.router.navigate(['/sites/gestion-enlace']);
  }

  OnEditarRegistroClick(id: number) {
    this.router.navigate(['/sites/gestion-enlace'], { queryParams: { regId: id } });
  }

  OnEliminarRegistroClick(id: any) {
    Swal.fire({
      title: this.translate.instant('SITIOS.ENLACES.ELIMINARTITULO'),
      text: this.translate.instant('SITIOS.ENLACES.ELIMINARTEXTO'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
      cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
    }).then((result) => {
      if (result.isConfirmed) {
        this._enlacesService.deleteEliminarRegistro(id.id).subscribe({
          next: (resp: any) => {
            Swal.fire(this.translate.instant('SITIOS.ENLACES.ELIMINAREXITOSA'), resp.mensaje, 'success');
            this.registros = this.registros.filter((s) => s.enlaceId !== id.id);
          },
          error: (err: any) => {
            Swal.fire('Error', this.translate.instant('SITIOS.ENLACES.ELIMINARERROR'), 'error');
            console.error('Error eliminando', err);
          }
        });
      }
    });
  }

  onFiltroNombreChangeClick(evento: any) {
    console.log('filtrar el NOMBRE ', evento.target.value);
    const textoFiltro = evento.target.value.toLowerCase();
    if (!textoFiltro) {
      this.registrosFiltrado = [...this.registros];
    } else {
      this.registrosFiltrado = this.registrosFiltrado.filter((enlace) => (enlace.nombreEnlace || '').toLowerCase().includes(textoFiltro));
      console.log('filtrados', this.registrosFiltrado);
    }
  }

  onFiltroDescripcionChangeClick(evento: any) {
    console.log('filtrar el descripcion ', evento.target.value);
    const textoFiltro = evento.target.value.toLowerCase();
    if (!textoFiltro) {
      this.registrosFiltrado = [...this.registros];
    } else {
      this.registrosFiltrado = this.registrosFiltrado.filter((enlace) =>
        (enlace.descripcionEnlace || '').toLowerCase().includes(textoFiltro)
      );
      console.log('filtrados', this.registrosFiltrado);
    }
  }

  onFiltroEstadoChangeClick(evento: any) {
    console.log('filtrar el estado ', evento.target.value);
    if (evento.target.value == 'todos') {
      this.registrosFiltrado = this.registros;
    } else {
      const estado = evento.target.value == 'true' ? true : false;
      this.registrosFiltrado = this.registros.filter((x) => x.estadoEnlace == estado);
    }
  }

  toggleNav(): void {
    this.toggleSidebar.emit();
  }
}
