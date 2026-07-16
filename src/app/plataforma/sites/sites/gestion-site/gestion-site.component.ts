/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { PTLSitiosAPService } from 'src/app/theme/shared/service/ptlsitios-ap.service';
import { PTLSitiosAPModel } from 'src/app/theme/shared/_helpers/models/PTLSitioAP.model';
import { PtlAplicacionesService } from 'src/app/theme/shared/service/ptlaplicaciones.service';
import { catchError, Observable, of, Subscription, tap } from 'rxjs';
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GradientConfig } from 'src/app/app-config';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { LayoutInitializerService } from 'src/app/theme/shared/service/layout-initializer.service';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import Swal from 'sweetalert2';
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component';
import { LocalStorageService } from 'src/app/theme/shared/service';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';

@Component({
  selector: 'app-gestion-site',
  standalone: true,
  imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
  templateUrl: './gestion-site.component.html',
  styleUrl: './gestion-site.component.scss'
})
export class GestionSiteComponent implements OnInit {
  // private props
  @Output() toggleSidebar = new EventEmitter<void>();
  FormRegistro: PTLSitiosAPModel = new PTLSitiosAPModel();
  menuItems!: Observable<NavigationItem[]>;
  gradientConfig: any;
  navCollapsed: boolean = false;
  navCollapsedMob: boolean = false;
  windowWidth: number = 0;
  form: undefined;
  isSubmit: boolean;
  modoEdicion: boolean = false;
  aplicacionesSub?: Subscription;
  aplicaciones: PTLAplicacionModel[] = [];
  tipoEditorTexto = 'basica';
  lockScreenSubscription: Subscription | undefined;
  isLocked: boolean = false;
  lockMessage: string = '';

  // constructor
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private _registrosService: PTLSitiosAPService,
    private _aplicacionesService: PtlAplicacionesService,
    private _layoutInitializer: LayoutInitializerService,
    private _navigationService: NavigationService,
    private _localStorageService: LocalStorageService
  ) {
    this.isSubmit = false;
    GradientConfig.header_fixed_layout = true;
    this.gradientConfig = GradientConfig;
    this.navCollapsed = this.windowWidth >= 992 ? GradientConfig.isCollapse_menu : false;
    this.navCollapsedMob = false;
    this.route.queryParams.subscribe((params) => {
      const registroId = params['regId'];
      if (registroId) {
        this.modoEdicion = true;
        this._registrosService.getRegistroById(registroId).subscribe({
          next: (resp: any) => {
            this.FormRegistro = resp.sitio;
            console.log('respuesta componente', this.FormRegistro);
          },
          error: () => {
            Swal.fire('Error', 'No se pudo obtener el sitio', 'error');
          }
        });
      } else {
        this.modoEdicion = false;
      }
    });
  }

  ngOnInit() {
    this._navigationService.getNavigationItems();
    this.menuItems = this._navigationService.menuItems$;
    this.consultarAplicaciones();
    this._layoutInitializer.applyLayout();
    this.lockScreenSubscription = this._navigationService.lockScreenEvent$.subscribe({
      next: (message: string) => {
        this._localStorageService.setFormRegistro(this.FormRegistro);
        this.isLocked = true;
        this.lockMessage = message;
      },
      error: (err) => console.error('Error al suscribirse al evento de bloqueo:', err)
    });
    const form = this._localStorageService.getFormRegistro();
    if (form != undefined) {
      this.FormRegistro = form;
      this._localStorageService.removeFormRegistro();
    }
  }

  consultarAplicaciones() {
    this.aplicacionesSub = this._aplicacionesService
      .getAplicaciones()
      .pipe(
        tap((resp: any) => {
          if (resp.ok) {
            this.aplicaciones = resp.aplicaciones;
            console.log('Todos las aplicaciones', this.aplicaciones);
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

  onAplicacionchangeClick(event: any) {
    const value = event.target.value;
    const app = this.aplicaciones.filter((x) => x.codigoAplicacion == value)[0];
    console.log('Código de aplicación seleccionado:', value);
    console.log('data aplicación seleccionado:', app);
    this.FormRegistro.aplicacionId = app.aplicacionId;
  }

  actualizarDescripcionSite(nuevoContenido: string): void {
    this.FormRegistro.descripcionSitio = nuevoContenido;
    console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionSitio);
    // if (this.validationForm && this.isSubmit) {
    // }
  }

  btnGestionarRegistroClick(form: any) {
    this.isSubmit = true;
    if (!form.valid) {
      return;
    }
    if (this.modoEdicion) {
      this._registrosService.putModificarRegistro(this.FormRegistro).subscribe({
        next: (resp: any) => {
          if (resp.ok) {
            Swal.fire('', this.translate.instant('PLATAFORMA.MODIFICAR'), 'success');
            this.router.navigate(['/sites/sites']);
          } else {
            Swal.fire('Error', resp.message || this.translate.instant('PLATAFORMA.NOMODIFICO'), 'error');
          }
        },
        error: (err: any) => {
          console.error(err);
          Swal.fire('Error', this.translate.instant('PLATAFORMA.NOMODIFICO'), 'error');
        }
      });
    } else {
      this._registrosService.postCrearRegistro(this.FormRegistro).subscribe({
        next: (resp: any) => {
          if (resp.ok) {
            Swal.fire('', this.translate.instant('PLATAFORMA.INSERTAR'), 'success');
            form.resetForm();
            this.isSubmit = false;
            this.router.navigate(['/sites/sites']);
          }
        },
        error: (err: any) => {
          console.error(err);
          Swal.fire('Error', this.translate.instant('PLATAFORMA.NOINSERTO'), 'error');
        }
      });
    }
  }

  btnRegresarClick() {
    this.router.navigate(['/sites/sites']);
  }

  toggleNav(): void {
    this.toggleSidebar.emit();
  }
}
