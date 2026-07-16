/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { GradientConfig } from 'src/app/app-config'
import { v4 as uuidv4 } from 'uuid'
import { Observable, Subscription } from 'rxjs'
import Swal from 'sweetalert2'

// Componentes del Menú Lateral
import { NavBarComponent } from 'src/app/theme/layout/admin/nav-bar/nav-bar.component'
import { NavContentComponent } from 'src/app/theme/layout/admin/navigation/nav-content/nav-content.component'
import { NavigationService } from 'src/app/theme/shared/service/navigation.service'
import { NavigationItem } from 'src/app/theme/shared/_helpers/models/Navigation.model'

// Modelos y Servicios
import { PTLScriptsService } from 'src/app/theme/shared/service/ptlscripts.service'
import { PTLTiposScriptsService } from 'src/app/theme/shared/service/ptltipos-scripts.service'
import { PTLScriptsModel } from 'src/app/theme/shared/_helpers/models/PTLScripts.model'
import { PtlAplicacionesService } from 'src/app/theme/shared/service/ptlaplicaciones.service'
import { LocalStorageService, PtllogActividadesService, SwalAlertService, UploadFilesService } from 'src/app/theme/shared/service'
import { PTLTiposScriptsModel } from 'src/app/theme/shared/_helpers/models/PTLTiposScript.model'
import { PTLAplicacionModel } from 'src/app/theme/shared/_helpers/models/PTLAplicacion.model'
import { TextEditorComponent } from 'src/app/theme/shared/components/text-editor/text-editor.component'

@Component({
    selector: 'app-gestion-script',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, TranslateModule, NavBarComponent, NavContentComponent, TextEditorComponent],
    templateUrl: './gestion-script.component.html',
    styleUrl: './gestion-script.component.scss'
})
export class GestionScriptComponent implements OnInit {
    @Output() toggleSidebar = new EventEmitter<void>()
    menuItems$!: Observable<NavigationItem[]>
    FormRegistro: PTLScriptsModel = new PTLScriptsModel()
    registroId: string = ''
    codigoScript: string = ''
    form: undefined
    isSubmit: boolean
    modoEdicion: boolean = false
    gradientConfig: any
    suscriptor: string = ''
    tipoEditorTexto = 'basica'

    //   scriptForm!: FormGroup
    //   esNuevo: boolean = true
    //   scriptId: string = ''

    tiposScripts: PTLTiposScriptsModel[] = []
    aplicaciones: PTLAplicacionModel[] = []
    lockScreenSubscription: Subscription | undefined
    isLocked: boolean = false
    lockMessage: string = ''

    selectedFile: File | null = null
    previewUrl: string | ArrayBuffer | null = null
    userPhotoUrl: string = ''
    fileName: string | null = null
    selectedFileUrl: string | null = null

    // Variables para el menú lateral

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private _scriptsService: PTLScriptsService,
        private _tiposScriptsService: PTLTiposScriptsService,
        private _aplicacionesService: PtlAplicacionesService,
        private _localStorageService: LocalStorageService,
        private _logActividadesService: PtllogActividadesService,
        private _uploadService: UploadFilesService,
        private _translate: TranslateService,
        private _swalService: SwalAlertService,
        private _navigationService: NavigationService
    ) {
        // this.crearFormulario()
        this.isSubmit = false
        GradientConfig.header_fixed_layout = true
        this.gradientConfig = GradientConfig
        this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage()
        this.registroId = this._localStorageService.getObject<string>('regId') || 'nuevo'
        if (this.registroId != 'nuevo') {
            this.modoEdicion = true
            this._scriptsService.getRegistroById(this.registroId).subscribe({
                next: (resp: any) => {
                    this.FormRegistro = resp.script
                    this.codigoScript = resp.script.codigoScript
                    this.selectedFileUrl = this._uploadService.getFilePath(this.suscriptor, 'suites', resp.suite.imagenInicio)
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo obtener script por ese codigo', 'error')
                }
            })
        } else {
            this.FormRegistro.codigoScript = uuidv4()
            this.modoEdicion = false
        }
    }

    ngOnInit(): void {
        this._navigationService.getNavigationItems()
        this.menuItems$ = this._navigationService.menuItems$
        this.cargarTiposScripts()
        this.cargarAplicaciones()
        this.lockScreenSubscription = this._navigationService.lockScreenEvent$.subscribe({
            next: (message: string) => {
                this._localStorageService.setFormRegistro(this.FormRegistro)
                this.isLocked = true
                this.lockMessage = message
            },
            error: err => console.error('Error al suscribirse al evento de bloqueo:', err)
        })
        const form = this._localStorageService.getFormRegistro()
        if (form != undefined) {
            this.FormRegistro = form
            this._localStorageService.removeFormRegistro()
        }
        if (!this.modoEdicion) {
            console.log('modo edicion', this.modoEdicion)
            this.FormRegistro.codigoScript = uuidv4()
            this.FormRegistro.codigoAplicacion = ''
            // this.FormRegistro.codigoModulo = uuidv4();
            console.log('FormRegistro', this.FormRegistro)
        }
        // this.route.queryParams.subscribe(params => {
        //   const regId = params['regId']
        //   if (params['regId'] === 'nuevo') {
        //     this.esNuevo = true
        //     const numeroAleatorio = Math.floor(Math.random() * 10000)
        //       .toString()
        //       .padStart(4, '0')
        //     const codigoGenerado = `SCR-${numeroAleatorio}`
        //     this.scriptForm.patchValue({
        //       codigoScript: codigoGenerado
        //     })
        //   } else {
        //     this.esNuevo = false
        //     this.scriptId = regId
        //     this.cargarScript(regId)
        //   }

        //   if (regId && regId !== 'nuevo') {
        //     this.esNuevo = false
        //   }
        // })
    }

    cargarAplicaciones(): void {
        this._aplicacionesService.getAplicaciones().subscribe({
            next: (resp: any) => {
                if (resp.ok) {
                    this.aplicaciones = resp.aplicaciones.filter((a: any) => a.estadoAplicacion === true)
                } else if (Array.isArray(resp)) {
                    this.aplicaciones = resp.filter((a: any) => a.estadoAplicacion === true)
                }
            },
            error: (err: any) => console.error('Error cargando Aplicaciones', err)
        })
    }

    //   crearFormulario (): void {
    //     this.scriptForm = this.fb.group({
    //       codigoScript: [{ value: '', disabled: true }],
    //       nombreScript: ['', [Validators.required]],
    //       descripcionScript: [''],
    //       codigoAplicacion: ['', [Validators.required]],
    //       codigoTipoScript: ['', [Validators.required]],
    //       estadoScript: [true, [Validators.required]]
    //     })
    //   }

    cargarTiposScripts(): void {
        this._tiposScriptsService.getRegistros().subscribe({
            next: (resp: any) => {
                if (resp.ok) {
                    this.tiposScripts = resp.tiposScripts.filter((t: any) => t.estadoTipo === true)
                }
            },
            error: err => console.error('Error cargando Tipos de Scripts', err)
        })
    }

    onAplicacionChangeClick(event: any) {
        const value = event.target.value
        const app = this.aplicaciones.filter(x => x.codigoAplicacion == value)[0]
        this.FormRegistro.codigoAplicacion = app.codigoAplicacion || ''
    }

    onTipoScriptChangeClick(event: any) {
        const value = event.target.value
        const tipo = this.tiposScripts.filter(x => x.codigoTipoScript == value)[0]
        this.FormRegistro.codigoTipoScript = tipo.codigoTipoScript || ''
    }

    actualizarDescripcionVersion(nuevoContenido: string): void {
        this.FormRegistro.descripcionScript = nuevoContenido
        console.log('Descripción de descripcionScript actualizada:', this.FormRegistro.descripcionScript)
        // if (this.validationForm && this.isSubmit) {
        // }
    }

    //   cargarScript (id: string): void {
    //     this._scriptsService.getRegistroById(id).subscribe({
    //       next: (resp: any) => {
    //         if (resp.ok && resp.script) {
    //           this.scriptForm.patchValue({
    //             codigoScript: resp.script.codigoScript,
    //             nombreScript: resp.script.nombreScript,
    //             descripcionScript: resp.script.descripcionScript,
    //             codigoAplicacion: resp.script.codigoAplicacion,
    //             codigoTipoScript: resp.script.codigoTipoScript,
    //             estadoScript: resp.script.estadoScript
    //           })
    //           this.scriptForm.get('codigoScript')?.disable()
    //         }
    //       },
    //       error: () => {
    //         Swal.fire('Error', 'No se pudo cargar la información del script', 'error')
    //         this.volver()
    //       }
    //     })
    //   }

    onFileSelectedClick(event: any) {
        const file: File = event.target.files[0]
        const objUpload = {
            suc: this.suscriptor,
            tipo: 'scripts',
            id: '0'
        }
        if (file) {
            //   const reader = new FileReader()
            //   reader.onload = (e: any) => {
            //     this.selectedFileUrl = e.target.result
            //   }
            //   reader.readAsDataURL(file)
            this._uploadService.uploadUserPhoto(file, objUpload).subscribe({
                next: (path: any) => {
                    console.log('resultado', path)
                    this.FormRegistro.rutaArchivo = path.nombreArchivo
                },
                error: () => {
                    this._swalService.getAlertError(this._translate.instant('PLATAFORMA.UPLOADPHOTOERROR'))
                }
            })
        } else {
            this.selectedFileUrl = null
            this.userPhotoUrl = ''
        }
    }

    btnGestionarRegistroClick(form: any) {
        this.isSubmit = true
        if (!form.valid) {
            return
        }
        const registroData = form.value as PTLScriptsModel
        if (this.modoEdicion) {
            registroData.codigoUsuarioCreacion = this.FormRegistro.codigoUsuarioCreacion
            registroData.fechaCreacion = this.FormRegistro.fechaCreacion
            registroData.codigoUsuarioModificacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaModificacion = new Date().toISOString()
            this._scriptsService.putModificarRegistro(this.FormRegistro).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoScriptLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this._translate.instant('PLATAFORMA.INSERTAR')
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalService.getAlertSuccess(this._translate.instant('PLATAFORMA.MODIFICAR'))
                        this.router.navigate(['/aplicaciones/suites'])
                    } else {
                        const logData = {
                            codigoTipoScriptLog: '',
                            codigoRespuesta: '501',
                            descripcionLog: this._translate.instant('PLATAFORMA.NOMODIFICO') + ', ' + resp.message
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalService.getAlertError(resp.message || this._translate.instant('PLATAFORMA.NOMODIFICO'))
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoScriptLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this._translate.instant('PLATAFORMA.NOMODIFICO') + ', ' + err.message
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalService.getAlertError(this._translate.instant('PLATAFORMA.NOMODIFICO'))
                }
            })
        } else {
            registroData.codigoScript = uuidv4()
            registroData.codigoUsuarioCreacion = this._localStorageService.getUsuarioLocalStorage().codigoUsuario
            registroData.fechaCreacion = new Date().toISOString()
            registroData.codigoUsuarioModificacion = ''
            registroData.fechaModificacion = ''
            console.log('insertar registro', registroData)
            this._scriptsService.postCrearRegistro(this.FormRegistro).subscribe({
                next: (resp: any) => {
                    if (resp.ok) {
                        const logData = {
                            codigoTipoScriptLog: '',
                            codigoRespuesta: '201',
                            descripcionLog: this._translate.instant('PLATAFORMA.INSERTAR') + ' ' + resp.mensaje
                        }
                        this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                        this._swalService.getAlertSuccess(this._translate.instant('PLATAFORMA.INSERTAR'))
                        form.resetForm()
                        this.isSubmit = false
                        this.router.navigate(['/aplicaciones/suites'])
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    const logData = {
                        codigoTipoScriptLog: '',
                        codigoRespuesta: '501',
                        descripcionLog: this._translate.instant('PLATAFORMA.NOINSERTO') + ', ' + err.message
                    }
                    this._logActividadesService.postCrearRegistro(logData).subscribe(() => console.log('log creado exitosamente'))
                    this._swalService.getAlertError(this._translate.instant('PLATAFORMA.NOINSERTO'))
                }
            })
        }
    }

    //   guardar (): void {
    //     if (this.scriptForm.invalid) {
    //       Object.values(this.scriptForm.controls).forEach(control => control.markAsTouched())
    //       return
    //     }

    //     const scriptData: PTLScriptsModel = {
    //       ...this.scriptForm.getRawValue(),
    //       codigoUsuarioCreacion: 'ADMIN',
    //       fechaCreacion: new Date().toISOString(),
    //       codigoUsuarioModificacion: 'ADMIN',
    //       fechaModificacion: new Date().toISOString()
    //     }

    //     if (this.esNuevo) {
    //       this._scriptsService.postCrearRegistro(scriptData).subscribe({
    //         next: () => {
    //           Swal.fire('Éxito', 'Script creado correctamente', 'success')
    //           this.volver()
    //         },
    //         error: err => {
    //           console.error(err)
    //           Swal.fire('Error', 'Ocurrió un error al crear el script', 'error')
    //         }
    //       })
    //     } else {
    //       this._scriptsService.putModificarRegistro(scriptData).subscribe({
    //         next: () => {
    //           Swal.fire('Éxito', 'Script actualizado correctamente', 'success')
    //           this.volver()
    //         },
    //         error: err => {
    //           console.error(err)
    //           Swal.fire('Error', 'Ocurrió un error al actualizar el script', 'error')
    //         }
    //       })
    //     }
    //   }

    //   campoNoValido(campo: string): boolean {
    //     return this.scriptForm.get(campo)?.invalid && this.scriptForm.get(campo)?.touched ? true : false;
    //   }

    btnRegresarClick() {
        this.router.navigate(['/administracion-bd/scripts'])
    }

    // Función para abrir/cerrar el menú lateral
    toggleNav(): void {
        this.toggleSidebar.emit()
    }
}
