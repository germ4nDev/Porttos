/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataTablesModule } from 'angular-datatables';
import { Router } from '@angular/router';
import { PTLSitiosAPService } from 'src/app/theme/shared/service/ptlsitios-ap.service';
import { catchError, Observable, of, Subscription, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PTLSitiosAPModel } from 'src/app/theme/shared/_helpers/models/PTLSitioAP.model';
import { GradientConfig } from 'src/app/app-config';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component';
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model';
import { PtlAplicacionesService } from 'src/app/theme/shared/service/ptlaplicaciones.service';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';

@Component({
  selector: 'app-sites',
  standalone: true,
  imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
  templateUrl: './sites.component.html',
  styleUrl: './sites.component.scss'
})
export class SitesComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
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
  menuItems!: Observable<NavigationItem[]>;
  activeTab: 'menu' | 'filters' | 'main' = 'menu';
  //#endregion VARIABLES

  constructor(
    private router: Router,
    private translate: TranslateService,
    private _sitiosService: PTLSitiosAPService,
    private _navigationService: NavigationService,
    private _aplicacionesService: PtlAplicacionesService
  ) {
    this.gradientConfig = GradientConfig;
  }

  ngOnInit() {
    this._navigationService.getNavigationItems();
    this.menuItems = this._navigationService.menuItems$;
    this.hasFiltersSlot = true;
    this.consultarAplicaciones();
    this.consultarSitios();
    console.log('elementos menu componente', this.menuItems);
  }

  consultarSitios() {
    this.registrosSub = this._sitiosService
      .getRegistros()
      .pipe(
        tap((resp: any) => {
          if (resp.ok) {
            resp.sitios.forEach((app: any) => {
              app.nomEstado = app.estadoSitio == true ? 'Activa' : 'Inactiva';
              app.nomAplicacion = this.aplicaciones.filter((x) => x.aplicacionId == app.aplicacionId)[0].nombreAplicacion || '';
            });
            this.registros = resp.sitios;
            this.registrosFiltrado = resp.sitios;
            console.log('Todos los sitios', this.registrosFiltrado);
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
      name: 'nomAplicacion',
      header: 'SITIOS.NAMEAPLICATION',
      type: 'text'
    },
{
      name: 'nombreSitio',
      header: 'SITIOS.NAME',
      type: 'text'
    },
    {
      name: 'urlSitio',
      header: 'SITIOS.URL',
      type: 'text'
    },
    {
      name: 'puertoSitio',
      header: 'SITIOS.SITESPORT',
      type: 'text'
    },
    {
      name: 'nomEstado',
      header: 'SITIOS.STATUS',
      type: 'text'
    }
  ];

  columnasDetailRegistros: ColumnMetadata[] = [
    {
      name: 'descripcionSitio',
      header: 'SITIOS.DESCRIPTION',
      type: 'text'
    }
  ];

  consultarAplicaciones() {
    this.aplicacionesSub = this._aplicacionesService
      .getAplicaciones()
      .pipe(
        tap((resp: any) => {
          if (resp.ok) {
            this.aplicaciones = resp.aplicaciones;
          }
        }),
        catchError((err) => {
          console.error(err);
          return of([]);
        })
      )
      .subscribe();
  }

  OnNuevoRegistroClick() {
    this.router.navigate(['/sites/gestion-site']);
  }

  OnEditarRegistroClick(id: number) {
    this.router.navigate(['/sites/gestion-site'], { queryParams: { regId: id } });
  }

  OnEliminarRegistroClick(id: any) {
    Swal.fire({
      title: this.translate.instant('SITIOS.ELIMINARTITULO'),
      text: this.translate.instant('SITIOS.ELIMINARTEXTO'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
      cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
    }).then((result) => {
      console.log('Eliminado', id);
      if (result.isConfirmed) {
        this._sitiosService.deleteEliminarRegistro(id.id).subscribe({
          next: (resp: any) => {
            Swal.fire(this.translate.instant('SITIOS.ELIMINAREXITOSA'), resp.mensaje, 'success');
            this.consultarSitios();
          },
          error: (err: any) => {
            Swal.fire('Error', this.translate.instant('SITIOS.ELIMINARERROR'), 'error');
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
      this.registrosFiltrado = this.registrosFiltrado.filter((sitio) => (sitio.nombreSitio || '').toLowerCase().includes(textoFiltro));
      console.log('filtrados', this.registrosFiltrado);
    }
  }

  onFiltroDescripcionChangeClick(evento: any) {
    console.log('filtrar el descripcion ', evento.target.value);
    const textoFiltro = evento.target.value.toLowerCase();
    if (!textoFiltro) {
      this.registrosFiltrado = [...this.registros];
    } else {
      this.registrosFiltrado = this.registrosFiltrado.filter((app) => (app.descripcionSitio || '').toLowerCase().includes(textoFiltro));
      console.log('filtrados', this.registrosFiltrado);
    }
  }

  onFiltroEstadoChangeClick(evento: any) {
    console.log('filtrar el estado ', evento.target.value);
    if (evento.target.value == 'todos') {
      this.registrosFiltrado = this.registros;
    } else {
      const estado = evento.target.value == 'true' ? true : false;
      this.registrosFiltrado = this.registros.filter((x) => x.estadoSitio == estado);
    }
  }

  toggleNav(): void {
    this.toggleSidebar.emit();
  }
}
