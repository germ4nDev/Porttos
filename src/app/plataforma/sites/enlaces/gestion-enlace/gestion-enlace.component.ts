/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { PTLEnlacesSTService } from 'src/app/theme/shared/service/ptlenlaces-st.service';
import { PTLEnlaceSTModel } from 'src/app/theme/shared/_helpers/models/PTLEnlaceST.model';
import { PTLSitiosAPModel } from 'src/app/theme/shared/_helpers/models/PTLSitioAP.model';
import { catchError, Observable, of, Subscription, tap } from 'rxjs';
import { LocalStorageService, PTLSitiosAPService } from 'src/app/theme/shared/service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GradientConfig } from 'src/app/app-config';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { LayoutInitializerService } from 'src/app/theme/shared/service/layout-initializer.service';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import Swal from 'sweetalert2';
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';

@Component({
    selector: 'app-gestion-enlace',
    standalone: true,
    imports: [CommonModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-enlace.component.html',
    styleUrl: './gestion-enlace.component.scss'
})
export class GestionEnlaceComponent implements OnInit {
    // private props
    @Output() toggleSidebar = new EventEmitter<void>();
    FormRegistro: PTLEnlaceSTModel = new PTLEnlaceSTModel();
    menuItems!: Observable<NavigationItem[]>;
    gradientConfig: any;
    navCollapsed: boolean = false;
    navCollapsedMob: boolean = false;
    windowWidth: number = 0;

    form: undefined;
    isSubmit: boolean;
    modoEdicion: boolean = false;
    sitiosSub?: Subscription;
    sitios: PTLSitiosAPModel[] = [];
    tipoEditorTexto = 'basica';
    lockScreenSubscription: Subscription | undefined;
    isLocked: boolean = false;
    lockMessage: string = '';

    // constructor
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _localStorageService: LocalStorageService,
        private _registrosService: PTLEnlacesSTService,
        private _sitiosService: PTLSitiosAPService,
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
                        this.FormRegistro = resp.enlace;
                        console.log('respuesta componente', this.FormRegistro);
                    },
                    error: () => {
                        Swal.fire('Error', 'No se pudo obtener el enlace', 'error');
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
        this.consultarSitios();
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

    onSitiochangeClick(event: any) {
        const value = event.target.value;
        const sitio = this.sitios.filter((x) => x.codigoSitio == value)[0];
        console.log('Id del sitio seleccionado:', value);
        console.log('datal sitio seleccionado:', sitio);
        this.FormRegistro.codigoSitio = sitio.codigoSitio;
    }

    actualizarDescripcionEnlace(nuevoContenido: string): void {
        this.FormRegistro.descripcionEnlace = nuevoContenido;
        console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionEnlace);
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    btnGestionarRegistroClick(form: any) {
        this.isSubmit = true;
        if (!form.valid) {
            return;
        }
        if (this.modoEdicion) {
            console.log('Datos a enviar (FormRegistro):', this.FormRegistro);

            this._registrosService.putModificarRegistro(this.FormRegistro).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        Swal.fire('', this.translate.instant('PLATAFORMA.MODIFICAR'), 'success');
                        this.router.navigate(['/sites/enlaces']);
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
                        this.router.navigate(['/sites/enlaces']);
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
        this.router.navigate(['/sites/enlaces']);
    }
    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
