import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

// Componentes del Menú Lateral
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component';
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavigationService } from 'src/app/theme/shared/service/navigation.service';
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model';

// Modelos y Servicios
import { PTLTiposScriptsService } from 'src/app/theme/shared/service/ptltipos-scripts.service';
import { PTLTiposScriptsModel } from 'src/app/theme/shared/_helpers/models/PTLTiposScript.model';
import { LocalStorageService } from 'src/app/theme/shared/service';

@Component({
    selector: 'app-gestion-tipo',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        TranslateModule,
        NavBarComponent, // <- Importado para el HTML
        NavContentComponent // <- Importado para el HTML
    ],
    templateUrl: './gestion-tipo.component.html',
    styleUrl: './gestion-tipo.component.scss'
})
export class GestionTipoComponent implements OnInit {
    tipoForm!: FormGroup;
    esNuevo: boolean = true;
    tipoId: string = '';

    menuItems$!: Observable<NavigationItem[]>;
    @Output() toggleSidebar = new EventEmitter<void>();

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private _tiposScriptsService: PTLTiposScriptsService,
        private _localStorageService: LocalStorageService,
        private translate: TranslateService,
        private _navigationService: NavigationService
    ) {
        this.crearFormulario();
        const registroId = this._localStorageService.getObject<string>('regId') || 'nuevo'
        if (registroId && registroId !== 'nuevo') {
            this.esNuevo = false;
            this.tipoId = registroId;
            this.cargarTipo(registroId);
        }
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems();
        this.menuItems$ = this._navigationService.menuItems$;
    }

    crearFormulario(): void {
        this.tipoForm = this.fb.group({
            codigoTipo: ['', [Validators.required]],
            nombreTipo: ['', [Validators.required]],
            descripcionTipo: [''],
            estadoTipo: [true, [Validators.required]]
        });
    }

    cargarTipo(id: string): void {
        this._tiposScriptsService.getRegistroById(id).subscribe({
            next: (resp: any) => {
                if (resp.ok && resp.tipoScript) {
                    this.tipoForm.patchValue({
                        codigoTipo: resp.tipoScript.codigoTipo,
                        nombreTipo: resp.tipoScript.nombreTipo,
                        descripcionTipo: resp.tipoScript.descripcionTipo,
                        estadoTipo: resp.tipoScript.estadoTipo
                    });
                    this.tipoForm.get('codigoTipo')?.disable();
                }
            },
            error: () => {
                Swal.fire('Error', 'No se pudo cargar la información del tipo de script', 'error');
                this.volver();
            }
        });
    }

    guardar(): void {
        if (this.tipoForm.invalid) {
            Object.values(this.tipoForm.controls).forEach((control) => control.markAsTouched());
            return;
        }

        const tipoData: PTLTiposScriptsModel = {
            ...this.tipoForm.getRawValue(),
            codigoUsuarioCreacion: 'ADMIN',
            fechaCreacion: new Date().toISOString(),
            codigoUsuarioModificacion: 'ADMIN',
            fechaModificacion: new Date().toISOString()
        };

        if (this.esNuevo) {
            this._tiposScriptsService.postCrearRegistro(tipoData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Tipo de script creado correctamente', 'success');
                    this.volver();
                },
                error: (err) => {
                    console.error(err);
                    Swal.fire('Error', 'Ocurrió un error al crear el tipo de script', 'error');
                }
            });
        } else {
            this._tiposScriptsService.putModificarRegistro(tipoData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Tipo de script actualizado correctamente', 'success');
                    this.volver();
                },
                error: (err) => {
                    console.error(err);
                    Swal.fire('Error', 'Ocurrió un error al actualizar el tipo de script', 'error');
                }
            });
        }
    }

    volver(): void {
        this.router.navigate(['/administracion-bd/tipos-scripts']);
    }

    campoNoValido(campo: string): boolean {
        return this.tipoForm.get(campo)?.invalid && this.tipoForm.get(campo)?.touched ? true : false;
    }

    toggleNav(): void {
        this.toggleSidebar.emit();
    }
}
