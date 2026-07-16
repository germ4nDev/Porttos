import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { PTLClaseTicketModel } from 'src/app/theme/shared/_helpers/models/PTLClaseTicket.model';
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component';
import { NavigationService, LocalStorageService, UploadFilesService, PtllogActividadesService, SwalAlertService } from 'src/app/theme/shared/service';
import { PtlclasesticketService } from 'src/app/theme/shared/service/ptlclasesticket.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { v4 as uuidv4 } from 'uuid';

@Component({
    selector: 'app-gestion-clases-ticket',
    standalone: true,
    imports: [CommonModule, SharedModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-clases-ticket.component.html',
    styleUrl: './gestion-clases-ticket.component.scss'
})
export class GestionClasesTicketComponent {
    @Output() toggleSidebar = new EventEmitter<void>();
    menuItems!: Observable<NavigationItem[]>;
    FormRegistro: PTLClaseTicketModel = new PTLClaseTicketModel();
    form: undefined;
    isSubmit: boolean = false;
    modoEdicion: boolean = false;
    claseTicketId: string = '';
    codigoClase = uuidv4();

    tipoEditorTexto = 'basica';
    lockScreenSubscription: Subscription | undefined;
    isLocked: boolean = false;
    lockMessage: string = '';

    selectedFile: File | null = null;
    previewUrl: string | ArrayBuffer | null = null;
    userPhotoUrl: string = '';
    fileName: string | null = null;
    selectedFileUrl: string | null = null;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private _navigationService: NavigationService,
        private _localStorageService: LocalStorageService,
        private _registrosService: PtlclasesticketService,
        private _uploadService: UploadFilesService,
        private _logActividadesService: PtllogActividadesService,
        private _swalAlertService: SwalAlertService,
    ) {
        this.isSubmit = false;
        this.claseTicketId = this._localStorageService.getObject<string>('regId') || 'nuevo'
        console.log('============ clase-ticketId', this.claseTicketId);
        if (this.claseTicketId != 'nuevo') {
            this.modoEdicion = true;
            this._registrosService.getRegistroById(this.claseTicketId).subscribe({
                next: (resp: any) => {
                    this.FormRegistro = resp.claseTicket;
                    console.log('formRegistro Clase', this.FormRegistro);
                },
                error: () => {
                    this._swalAlertService.getAlertError('No se pudo obtener la clase.');
                }
            });
        } else {
            this.modoEdicion = false;
        }
    }
    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems = this._navigationService.menuItems$;
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
        if (!this.modoEdicion) {
            console.log('modo edicion', this.modoEdicion);
            this.FormRegistro.codigoClase = uuidv4();
            console.log('FormRegistro', this.FormRegistro);
        }
    }

    btnGestionarRegistroClick(form: any) {
        this.isSubmit = true;
        if (!form.valid) {
            return;
        }
        const registroData = form.value as PTLClaseTicketModel;
        console.log('insertar formRegistro', registroData);
        if (this.modoEdicion) {
            registroData.codigoUsuarioCreacion = this.FormRegistro.codigoUsuarioCreacion;
            registroData.fechaCreacion = this.FormRegistro.fechaCreacion;
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            registroData.fechaModificacion = new Date().toISOString();
            this._registrosService.putModificarRegistro(registroData, this.codigoClase).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PLATAFORMA.MODIFICAR')
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.MODIFICAR'));
                        this.router.navigate(['/tickets/clases-ticket']);
                    } else {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO')
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        this._swalAlertService.getAlertError(resp.message || this.translate.instant('PLATAFORMA.NOMODIFICO'));
                    }
                },
                error: (err: any) => {
                    console.error(err);
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('PLATAFORMA.NOMODIFICO') + ', ' + err.message
                    };
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                    this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOMODIFICO'));
                }
            });
        } else {
            console.log('nuevo formRegistro', this.FormRegistro);
            registroData.codigoClase = uuidv4();
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            registroData.fechaCreacion = new Date().toISOString();
            registroData.codigoUsuarioModificacion = '';
            registroData.fechaModificacion = '';
            console.log('insertar registro', registroData);
            this._registrosService.postCrearRegistro(registroData).subscribe({
                next: (resp: any) => {
                    console.log('reesp', resp.claseTicket);
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PLATAFORMA.INSERTAR')
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.INSERTAR'));
                        form.resetForm();
                        this.isSubmit = false;
                        this.router.navigate(['/tickets/clases-ticket']);
                    }
                },
                error: (err: any) => {
                    console.error(err);
                    const logData = {
                        codigoTipoLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this.translate.instant('PLATAFORMA.NOINSERTO') + ', ' + err.message
                    };
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                    this._swalAlertService.getAlertError(this.translate.instant('PLATAFORMA.NOINSERTO') + ', ' + err);
                }
            });
        }
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcionClase = nuevoContenido;
        console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionClase);
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    btnRegresarClick() {
        console.log('codigo Clase-ticket', this.claseTicketId);
        this.router.navigate(['/tickets/clases-ticket/'], { queryParams: { regId: this.claseTicketId } });
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}

