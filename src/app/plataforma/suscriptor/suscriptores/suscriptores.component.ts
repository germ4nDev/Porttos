/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataTablesModule } from 'angular-datatables';
import { Subscription, catchError, of, Observable, BehaviorSubject, switchMap, startWith, combineLatest, map, tap } from 'rxjs';
import { PTLSuscriptorModel } from 'src/app/theme/shared/_helpers/models/PTLSuscriptor.model';
import { PTLSuscriptoresService } from 'src/app/theme/shared/service/ptlsuscriptores.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DatatableComponent } from 'src/app/theme/shared/components/data-table/data-table.component';
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { GradientConfig } from 'src/app/app-config';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { ColumnMetadata } from 'src/app/theme/shared/_helpers/models/ColumnMetadata.model';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';
import { LocalStorageService, SwalAlertService, UploadFilesService } from 'src/app/theme/shared/service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-suscriptores',
    standalone: true,
    imports: [CommonModule, DataTablesModule, SharedModule, TranslateModule, NavBarComponent, NavContentComponent, DatatableComponent],
    templateUrl: './suscriptores.component.html',
    styleUrl: './suscriptores.component.scss'
})
export class SuscriptoresComponent implements OnInit, OnDestroy {
    @Output() toggleSidebar = new EventEmitter<void>();
    //#region VARIABLES
    subscriptions = new Subscription();
    //   filtroCodigoSubject = new BehaviorSubject<string>('todos');
    filtroNombreSubject = new BehaviorSubject<string>('');
    filtroIdentificacionSubject = new BehaviorSubject<string>('');
    filtroEstadoSubject = new BehaviorSubject<string>('todos');

    registrosTransformadas$: Observable<PTLSuscriptorModel[]> = of([]);
    registrosFiltrados$: Observable<PTLSuscriptorModel[]> = of([]);
    registros: PTLSuscriptorModel[] = [];

    lang: string = localStorage.getItem('lang') || '';
    tituloPagina: string = '';
    gradientConfig;
    hasFiltersSlot: boolean = false;
    menuItems!: Observable<NavigationItem[]>;
    activeTab: 'menu' | 'filters' | 'main' = 'menu';

    colorOpcion1 = '#0BD9D2';
    letraOpcion1 = 'E';

    colorOpcion2 = '#e08815';
    letraOpcion2 = 'U';
    //#endregion VARIABLES

    constructor(
        private router: Router,
        private translate: TranslateService,
        private _suscriptoresService: PTLSuscriptoresService,
        private _navigationService: NavigationService,
        private _localStorageService: LocalStorageService,
        private _uploadService: UploadFilesService,
        private _swalService: SwalAlertService
    ) {
        this.gradientConfig = GradientConfig;
    }

    ngOnInit() {
        this._navigationService.getNavigationItems();
        this.menuItems = this._navigationService.menuItems$;
        this.hasFiltersSlot = true;
        this.setupRegistrosStream();
        this.subscriptions.add(
            this._suscriptoresService.getRegistros().subscribe(
                () => console.log('Suscriptores cargados y guardadas en el servicio'),
                (err) => console.error('Error al cargar los Suscriptores:', err)
            )
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    setupRegistrosStream(): void {
        // 1. Intentamos obtener el suscriptor
        const suscriptor = this._localStorageService.getSuscriptorLocalStorage();
        const codigoSuscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()

        this.registrosTransformadas$ = this._suscriptoresService.suscriptores$.pipe(
            map((regs: PTLSuscriptorModel[]) => {
                if (!regs || regs.length === 0) return [];

                return regs.map((reg: any) => {
                    const newReg = { ...reg };
                    newReg.nomEstado = newReg.estadoSuscriptor ? 'Activo' : 'Inactivo';

                    if (codigoSuscriptor) {
                        newReg.logoSuscriptor = this._uploadService.getFilePath(
                            codigoSuscriptor,
                            'suscriptores',
                            newReg.logoSuscriptor || 'no-imagen.png'
                        );
                    }
                    return newReg as PTLSuscriptorModel;
                });
            }),
            tap((regs) => (this.registros = regs)),
            catchError((err) => {
                console.error('Error en el stream de datos:', err);
                return of([]);
            })
        );

        this.registrosFiltrados$ = combineLatest([
            this.registrosTransformadas$.pipe(startWith([])),
            this.filtroNombreSubject,
            this.filtroIdentificacionSubject,
            this.filtroEstadoSubject
        ]).pipe(
            map(([regs, nombre, identificacion, estado]) => {
                return regs.filter((reg) => {
                    const cumpleNombre = !nombre || (reg.nombreSuscriptor || '').toLowerCase().includes(nombre.toLowerCase());
                    const cumpleIdent = !identificacion || (reg.identificacionSuscriptor || '').includes(identificacion);
                    const cumpleEstado = estado === 'todos' || reg.estadoSuscriptor === (estado === 'true');
                    return cumpleNombre && cumpleIdent && cumpleEstado;
                });
            })
        );

        if (!codigoSuscriptor) {
            console.warn('Advertencia: No hay código de suscriptor en LocalStorage. Los logos podrían no cargar correctamente.');
        }
    }

    //   setupRegistrosStream(): void {
    //     const suscriptor = this._localStorageService.getSuscriptorLocalStorage();
    //     if (!suscriptor || !suscriptor.codigoSuscriptor) {
    //       console.error('Error: No se pudo obtener el suscriptor o su código. Operación de carga de registros abortada.');
    //       return;
    //     }
    //     const codigoSuscriptor = suscriptor.codigoSuscriptor;
    //     this.registrosTransformadas$ = this._suscriptoresService.suscriptores$.pipe(
    //       switchMap((regs: PTLSuscriptorModel[]) => {
    //         if (!regs) return of([]);
    //         const transformedRegs = regs.map((reg: any) => {
    //           // CORRECCIÓN: Usar la propiedad correcta del suscriptor
    //           reg.nomEstado = reg.estadoSuscriptor ? 'Activo' : 'Inactivo';

    //           // Asegúrate de que logoSuscriptor no venga nulo para evitar errores en getFilePath
    //           reg.logoSuscriptor = this._uploadService.getFilePath(codigoSuscriptor, 'suscriptores', reg.logoSuscriptor || 'default.png');
    //           return reg as PTLSuscriptorModel;
    //         });
    //         this.registros = transformedRegs;
    //         return of(transformedRegs);
    //       }),
    //       catchError((err) => {
    //         console.error('Error en el stream de aplicaciones:', err);
    //         return of([]);
    //       })
    //     );
    //     this.registrosFiltrados$ = combineLatest([
    //       this.registrosTransformadas$.pipe(startWith([])),
    //       //   this.filtroCodigoSubject,
    //       this.filtroNombreSubject,
    //       this.filtroIdentificacionSubject,
    //       this.filtroEstadoSubject
    //     ]).pipe(
    //       map(([regs, nombre, identificacion, estado]) => {
    //         let filteredRegs = regs;
    //         console.log('quien putas es estado', estado);
    //         // if (codigo !== 'todos') {
    //         //   filteredRegs = filteredRegs.filter((app) => app.codigoAplicacion === codigo);
    //         // }
    //         if (nombre) {
    //           const textoFiltro = nombre.toLowerCase();
    //           filteredRegs = filteredRegs.filter((reg) => (reg.nombreSuscriptor || '').toLowerCase().includes(textoFiltro));
    //         }
    //         if (identificacion) {
    //           filteredRegs = filteredRegs.filter((reg) => (reg.identificacionSuscriptor || '').toLowerCase().includes(identificacion));
    //         }
    //         if (estado !== 'todos') {
    //           const estadoBoolean = estado === 'true';
    //           filteredRegs = filteredRegs.filter((app) => app.estadoSuscriptor === estadoBoolean);
    //         }
    //         console.log('filtrado2s', filteredRegs);
    //         return filteredRegs;
    //       })
    //     );
    //   }

    onFiltroNombreChangeClick(evento: any) {
        console.log('filtrar el NOMBRE ', evento.target.value);
        this.filtroNombreSubject.next(evento.target.value);
    }

    onFiltroIdentificacionChangeClick(evento: any) {
        console.log('filtrar el descripcion ', evento.target.value);
        this.filtroIdentificacionSubject.next(evento.target.value);
    }

    onFiltroEstadoChangeClick(evento: any) {
        console.log('filtrar el estado ', evento.target.value);
        this.filtroEstadoSubject.next(evento.target.value);
    }

    columnasRegistros: any[] = [
        {
            name: 'logoSuscriptor',
            header: 'SUSCRIPTOR.SUSCRIPTORES.LOGO',
            type: 'image',
            isSortable: false,
            searchable: false
        },
        {
            name: 'nombreSuscriptor',
            header: 'SUSCRIPTOR.SUSCRIPTORES.NAME',
            type: 'text',
            isSortable: true,
            searchable: false
        },
        {
            name: 'identificacionSuscriptor',
            header: 'SUSCRIPTOR.SUSCRIPTORES.IDENTIFICATION',
            type: 'text',
            isSortable: true,
            searchable: false
        },
        {
            name: 'nomEstado',
            header: 'SUSCRIPTOR.SUSCRIPTORES.STATUS',
            type: 'estado',
            isSortable: true,
            searchable: false
        }
    ];

    //   columnasRegistros: ColumnMetadata[] = [
    //     {
    //       name: 'logoSuscriptor', // Debe coincidir con la propiedad del objeto
    //       header: 'SUSCRIPTORES.LOGO', // Cambié el header para que sea coherente
    //       type: 'image'
    //     },
    //     {
    //       name: 'nombreSuscriptor',
    //       header: 'SUSCRIPTORES.NAME',
    //       type: 'text'
    //     },
    //     {
    //       name: 'identificacionSuscriptor',
    //       header: 'SUSCRIPTORES.IDENTIFICATION',
    //       type: 'text'
    //     },
    //     {
    //       name: 'nomEstado', // Esta es la propiedad que creamos en el paso anterior
    //       header: 'SUSCRIPTORES.STATUS',
    //       type: 'estado'
    //     }
    //   ];

    columnasDetailRegistros: ColumnMetadata[] = [
        {
            name: 'codigoSuscriptor',
            header: 'SUSCRIPTOR.SUSCRIPTORES.CODE',
            type: 'text'
        },
        {
            name: 'direccionSuscriptor',
            header: 'SUSCRIPTOR.SUSCRIPTORES.DIRECCION',
            type: 'text'
        },
        {
            name: 'telefonoContacto',
            header: 'SUSCRIPTOR.SUSCRIPTORES.TELEFONO',
            type: 'text'
        },
        {
            name: 'numeroEmpresas',
            header: 'SUSCRIPTOR.SUSCRIPTORES.NUMEROEMPRESA',
            type: 'text'
        },
        {
            name: 'numeroUsuarios',
            header: 'SUSCRIPTOR.SUSCRIPTORES.NUMEROUSUARIO',
            type: 'text'
        },
        {
            name: 'usuarioAdministrador',
            header: 'SUSCRIPTOR.SUSCRIPTORES.USUARIOADMIN',
            type: 'text'
        },
        {
            name: 'descripcionSuscriptor',
            header: 'SUSCRIPTOR.SUSCRIPTORES.DESCRIPTION',
            type: 'text'
        }
    ];

    OnNuevoRegistroClick() {
        this.router.navigate(['/suscriptor/gestion-suscriptor'], { queryParams: { regId: 'nuevo' } });
    }

    OnEditarRegistroClick(id: number) {
        this.router.navigate(['/suscriptor/gestion-suscriptor'], { queryParams: { regId: id } });
    }

    OnOption1Click(event: any) {
        console.log('ejecutando opcion 1 empresas Suscriptor', event);
        this.router.navigate(['/suscriptor/empresas'], { queryParams: { regId: event } });
    }

    OnOption2Click(event: any) {
        console.log('ejecutando opcion 2 UsuariosSuscriptor', event);
        this.router.navigate(['/suscriptor/usuarios-suscriptor'], { queryParams: { regId: event } });
    }

    OnEliminarRegistroClick(id: any) {
        const suscriptor = this.registros.filter((x) => x.codigoSuscriptor == id.id)[0];
        const titulo = this.translate.instant('SUSCRIPTOR.SUSCRIPTORES.ELIMINARTITULO');
        const confirmText = this.translate.instant('PLATAFORMA.DELETE');
        const cancelText = this.translate.instant('PLATAFORMA.CANCEL');
        const htmlBody = `
        <div style="margin-bottom: 10px;">
            ${this.translate.instant('SUSCRIPTOR.SUSCRIPTORES.ELIMINARTEXTO')}
        </div>
        <small><b>"${suscriptor?.nombreSuscriptor}"</b></small>
    `;
        // this._swalService.getAlertConfirmDelete(titulo, htmlBody, confirmText, cancelText)
        //     .then((confirmado) => {
        //         if (confirmado) {
        //             this._suscriptoresService.eliminarSuscripctor(id.id).subscribe({
        //             next: (resp: any) => {
        //                 Swal.fire(this.translate.instant('SUSCRIPTOR.SUSCRIPTORES.ELIMINAREXITOSA'), resp.mensaje, 'success');
        //                 this.subscriptions.add(
        //                         this._suscriptoresService.getRegistros().subscribe(
        //                             () => console.log('Suscriptores cargados y guardadas en el servicio'),
        //                             err => console.error('Error al cargar los Suscriptores:', err)
        //                         )
        //                     )
        //             },
        //             error: (err: any) => {
        //                 Swal.fire('Error', this.translate.instant('SUSCRIPTOR.SUSCRIPTORES.ELIMINARERROR'), 'error');
        //                 console.error('Error eliminando', err);
        //             }
        //             });
        //         }
        //     });
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
