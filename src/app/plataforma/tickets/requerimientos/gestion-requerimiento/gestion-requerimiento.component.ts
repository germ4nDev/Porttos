import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { param } from 'jquery';
import { catchError, Observable, of, Subscription, tap } from 'rxjs';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { PTLRequerimientoTKModel } from 'src/app/theme/shared/_helpers/models/PTLRequerimientoTK.model';
import { PTLTicketAPModel } from 'src/app/theme/shared/_helpers/models/PTLTicketAP.model';
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component';
import {
    LocalStorageService,
    NavigationService,
    PtllogActividadesService,
    PTLRequerimientosTkService,
    PTLTicketsService,
    SwalAlertService,
    UploadFilesService
} from 'src/app/theme/shared/service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { v4 as uuidv4 } from 'uuid';

@Component({
    selector: 'app-gestion-requerimiento',
    standalone: true,
    imports: [CommonModule, SharedModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-requerimiento.component.html',
    styleUrl: './gestion-requerimiento.component.scss'
})
export class GestionRequerimientoComponent {
    @Output() toggleSidebar = new EventEmitter<void>();
    menuItems!: Observable<NavigationItem[]>;
    FormRegistro: PTLRequerimientoTKModel = new PTLRequerimientoTKModel();
    form: undefined;
    isSubmit: boolean = false;
    modoEdicion: boolean = false;
    codigoRegistro: string = '';
    codigoRequerimiento = uuidv4();
    ticketSub?: Subscription;
    ticket: PTLTicketAPModel[] = [];
    codigoTicket: string = '';

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
        private _registrosService: PTLRequerimientosTkService,
        private _ticketsService: PTLTicketsService,
        private _uploadService: UploadFilesService,
        private _logActividadesService: PtllogActividadesService,
        private _swalAlertService: SwalAlertService
    ) {
        this.isSubmit = false;
        this.codigoRegistro = this._localStorageService.getObject<string>('regId') || ''
        this.codigoTicket = this._localStorageService.getObject<string>('tcId') || ''
        console.log('============ requerimiento', this.codigoRegistro);
        console.log('============ codigoTicket', this.codigoTicket);
        if (this.codigoRegistro != 'nuevo' || this.codigoTicket == '') {
            this.modoEdicion = true;
            this._registrosService.getRegistroById(this.codigoRegistro).subscribe({
                next: (resp: any) => {
                    this.FormRegistro = resp.requerimiento;
                    console.log('formRegistro requerimiento', this.FormRegistro);
                },
                error: () => {
                    this._swalAlertService.getAlertError('No se pudo obtener el requerimiento.');
                }
            });
        } else {
            this.modoEdicion = false;
        }
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems = this._navigationService.menuItems$;
        this.consultarTickets();
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
            this.FormRegistro.codigoTicket = '';
            this.FormRegistro.codigoRequerimiento = uuidv4();
            console.log('FormRegistro', this.FormRegistro);
        }
    }

    consultarTickets() {
        this.ticketSub = this._ticketsService
            .getRegistros()
            .pipe(
                tap((resp: any) => {
                    if (resp.ok) {
                        this.ticket = resp.tickets;
                        console.log('tickets:', this.ticket);
                    }
                }),
                catchError((err) => {
                    console.error('Error al consultar tickets:', err);
                    return of(null);
                })
            )
            .subscribe();
    }

    btnGestionarRegistroClick(form: any) {
        this.isSubmit = true;
        if (!form.valid) {
            return;
        }
        const registroData = form.value as PTLRequerimientoTKModel;
        console.log('insertar formRegistro', registroData);
        if (this.modoEdicion) {
            registroData.codigoTicket = this.FormRegistro.codigoTicket || '';
            registroData.codigoUsuarioCreacion = this.FormRegistro.codigoUsuarioCreacion;
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            registroData.fechaCreacion = this.FormRegistro.fechaCreacion;
            registroData.fechaModificacion = new Date().toISOString();
            console.log('que me trae estado', registroData.estadoRequerimiento);
            registroData.estadoRequerimiento = this.FormRegistro.estadoRequerimiento ? '1' : '0';

            this._registrosService.putModificarRegistro(registroData, this.codigoRequerimiento).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this.translate.instant('PLATAFORMA.MODIFICAR')
                        };
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'));
                        this._swalAlertService.getAlertSuccess(this.translate.instant('PLATAFORMA.MODIFICAR'));
                        if (this.codigoRegistro == 'nuevo') {
                            this.router.navigate(['/tickets/requerimientos/'], { queryParams: { regId: this.codigoTicket } });
                        }
                        else {
                            this.router.navigate(['/tickets/requerimientos/'], { queryParams: { regId: this.FormRegistro.codigoTicket } });
                        }
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
            registroData.codigoRequerimiento = uuidv4();
            registroData.codigoTicket = this.FormRegistro.codigoTicket;
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario;
            registroData.fechaCreacion = new Date().toISOString();
            registroData.codigoUsuarioModificacion = '';
            registroData.fechaModificacion = '';
            console.log('insertar registro', registroData);
            this._registrosService.postCrearRegistro(registroData).subscribe({
                next: (resp: any) => {
                    console.log('reesp', resp.requerimiento);
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
                        if (this.codigoRegistro == 'nuevo') {
                            this.router.navigate(['/tickets/requerimientos/'], { queryParams: { regId: this.codigoTicket } });
                        }
                        else {
                            this.router.navigate(['/tickets/requerimientos/'], { queryParams: { regId: this.FormRegistro.codigoTicket } });
                        }
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

    onTicketChangeClick(event: any) {
        const value = event.target.value;
        const ticket = this.ticket.filter((x) => x.codigoTicket == value)[0];
        this.FormRegistro.codigoTicket = ticket.codigoTicket;
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcionRequerimiento = nuevoContenido;
        console.log('Descripción de versión actualizada:', this.FormRegistro.descripcionRequerimiento);
    }

    btnRegresarClick() {
        if (this.codigoRegistro == 'nuevo') {
            console.log('NUEVO TICKET REGRESAR', this.codigoTicket);
            this._localStorageService.setObject('regId', this.codigoTicket)
            this.router.navigate(['/tickets/requerimientos/']);
        }
        else {
            console.log('MODIFICAR TICKET REGRESAR');
            this._localStorageService.setObject('regId', this.FormRegistro.codigoTicket)
            this.router.navigate(['/tickets/requerimientos/']);
        }
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
