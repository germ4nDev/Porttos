/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { PTLContenidosELService } from 'src/app/theme/shared/service/ptlcontenidos-el.service';
import { PTLContenidoELModel } from 'src/app/theme/shared/_helpers/models/PTLContenidoEL.model';
import { PTLEnlaceSTModel } from 'src/app/theme/shared/_helpers/models/PTLEnlaceST.model';
import { catchError, Observable, of, Subscription, tap } from 'rxjs';
import { PTLEnlacesSTService } from 'src/app/theme/shared/service/ptlenlaces-st.service';
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
  selector: 'app-geston-contenido',
  standalone: true,
  imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
  templateUrl: './gestion-contenido.component.html',
  styleUrl: './gestion-contenido.component.scss'
})
export class GestonContenidoComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  FormRegistro: PTLContenidoELModel = new PTLContenidoELModel();
  menuItems!: Observable<NavigationItem[]>;
  gradientConfig: any;
  navCollapsed: boolean = false;
  navCollapsedMob: boolean = false;
  windowWidth: number = 0;
  tipoEditorTextoContenido = 'standard';
  tipoEditorTexto = 'basica';

  form: undefined;
  isSubmit: boolean;
  modoEdicion: boolean = false;
  enlaceSub?: Subscription;
  enlaces: PTLEnlaceSTModel[] = [];
  lockScreenSubscription: Subscription | undefined;
  isLocked: boolean = false;
  lockMessage: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private _registrosService: PTLContenidosELService,
    private _enlacesService: PTLEnlacesSTService,
    private _navigationService: NavigationService,
    private _localStorageService: LocalStorageService,
    private _layoutInitializer: LayoutInitializerService
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
            this.FormRegistro = resp.contenido;
            console.log('respuesta componente', this.FormRegistro);
          },
          error: () => {
            Swal.fire('Error', 'No se pudo obtener el contenido', 'error');
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
    this.consultarEnlaces();
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

  onContenidochangeClick(event: any) {
    const value = event.target.value;
    const enlace = this.enlaces.filter((x) => x.enlaceId == value)[0];
    console.log('Id del enlace seleccionado:', value);
    console.log('datal enlace seleccionado:', enlace);
    this.FormRegistro.codigoEnlace = enlace.codigoEnlace;
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
            this.router.navigate(['/sites/contenidos']);
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
            this.router.navigate(['/sites/contenidos']);
          }
        },
        error: (err: any) => {
          console.error(err);
          Swal.fire('Error', this.translate.instant('PLATAFORMA.NOINSERTO'), 'error');
        }
      });
    }
  }

  actualizarContenido(nuevoContenido: string): void {
    this.FormRegistro.contenido = nuevoContenido;
    console.log('Descripción de versión actualizada:', this.FormRegistro.contenido);
    // if (this.validationForm && this.isSubmit) {
    // }
  }

  actualizarDescripcionContenido(nuevoContenido: string): void {
    this.FormRegistro.descripcionContenido = nuevoContenido;
    console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionContenido);
    // if (this.validationForm && this.isSubmit) {
    // }
  }

  btnRegresarClick() {
    this.router.navigate(['/sites/contenidos']);
  }
  toggleNav(): void {
    this.toggleSidebar.emit();
  }
}
