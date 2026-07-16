/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataTablesModule } from 'angular-datatables';
import { catchError, Observable, of, Subscription, tap } from 'rxjs';
import { GradientConfig } from 'src/app/app-config';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { PTLContenidoELModel } from 'src/app/theme/shared/_helpers/models/PTLContenidoEL.model';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { PTLContenidosELService } from 'src/app/theme/shared/service/ptlcontenidos-el.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component';
import { PTLEnlacesSTService } from 'src/app/theme/shared/service/ptlenlaces-st.service';
import { PTLEnlaceSTModel } from 'src/app/theme/shared/_helpers/models/PTLEnlaceST.model';
import Swal from 'sweetalert2';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';

@Component({
  selector: 'app-contenidos',
  standalone: true,
  imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
  templateUrl: './contenidos.component.html',
  styleUrls: ['./contenidos.component.scss']
})
export class ContenidosComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  //#region VARIABLES
  registrosSub?: Subscription;
  registros: PTLContenidoELModel[] = [];
  registrosFiltrado: PTLContenidoELModel[] = [];
  enlaceSub?: Subscription;
  enlaces: PTLEnlaceSTModel[] = [];
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
    private _contenidoService: PTLContenidosELService,
    private _navigationService: NavigationService,
    private _enlacesService: PTLEnlacesSTService
  ) {
    this.gradientConfig = GradientConfig;
  }

  ngOnInit() {
    this._navigationService.getNavigationItems();
    this.menuItems = this._navigationService.menuItems$;
    this.hasFiltersSlot = true;
    this.consultarEnlaces();
    this.consultarRegistros();
    console.log('elementos menu componente', this.menuItems);
  }

  consultarRegistros() {
    this.registrosSub = this._contenidoService
      .getRegistros()
      .pipe(
        tap((resp: any) => {
          if (resp.ok) {
            resp.contenidos.forEach((contenido: any) => {
              contenido.nomEstado = contenido.estadoContenido == true ? 'Activa' : 'Inactiva';
              contenido.nomEnlace = this.enlaces.filter((x) => x.enlaceId == contenido.enlaceId)[0].nombreEnlace || '';
            });
            this.registros = resp.contenidos;
            this.registrosFiltrado = resp.contenidos;
            console.log('Todos los contenidos', this.registros);
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
      name: 'nombreContenido',
      header: 'SITIOS.CONTENIDOS.NAME',
      type: 'text'
    },
    {
      name: 'descripcionContenido',
      header: 'SITIOS.CONTENIDOS.DESCRIPTION',
      type: 'text'
    },
    {
      name: 'nomEnlace',
      header: 'PRECIOS.TIPOS.NAMEENLACE',
      type: 'text'
    },
    {
      name: 'nomEstado',
      header: 'SITIOS.CONTENIDOS.STATUS',
      type: 'text'
    }
  ];

  columnasDetailRegistros: ColumnMetadata[] = [
    {
      name: 'contenido',
      header: 'SITIOS.CONTENIDOS.CONTENIDO',
      type: 'text'
    }
  ];

  consultarEnlaces() {
    this.enlaceSub = this._enlacesService
      .getRegistros()
      .pipe(
        tap((resp: any) => {
          if (resp.ok) {
            this.enlaces = resp.enlaces;
            console.log('Todos los enlaces', this.enlaces);
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
    this.router.navigate(['/sites/gestion-contenido']);
  }

  OnEditarRegistroClick(id: number) {
    this.router.navigate(['/sites/gestion-contenido'], { queryParams: { regId: id } });
  }

  OnEliminarRegistroClick(id: any) {
    Swal.fire({
      title: this.translate.instant('SITIOS.CONTENIDOS.ELIMINARTITULO'),
      text: this.translate.instant('SITIOS.CONTENIDOS.ELIMINARTEXTO'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('PLATAFORMA.DELETE'),
      cancelButtonText: this.translate.instant('PLATAFORMA.CANCEL')
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Eliminar', id);
        this._contenidoService.deleteEliminarRegistro(id.id).subscribe({
          next: (resp: any) => {
            Swal.fire(this.translate.instant('SITIOS.CONTENIDOS.ELIMINAREXITOSA'), resp.mensaje, 'success');
            this.consultarRegistros();
          },
          error: (err: any) => {
            Swal.fire('Error', this.translate.instant('SITIOS.CONTENIDOS.ELIMINARERROR'), 'error');
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
      this.registrosFiltrado = this.registrosFiltrado.filter((contenido) =>
        (contenido.nombreContenido || '').toLowerCase().includes(textoFiltro)
      );
      console.log('filtrados', this.registrosFiltrado);
    }
  }

  onFiltroDescripcionChangeClick(evento: any) {
    console.log('filtrar el descripcion ', evento.target.value);
    const textoFiltro = evento.target.value.toLowerCase();
    if (!textoFiltro) {
      this.registrosFiltrado = [...this.registros];
    } else {
      this.registrosFiltrado = this.registrosFiltrado.filter((contenido) =>
        (contenido.descripcionContenido || '').toLowerCase().includes(textoFiltro)
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
      this.registrosFiltrado = this.registros.filter((x) => x.estadoContenido == estado);
    }
  }
  toggleNav(): void {
    this.toggleSidebar.emit();
  }
}
