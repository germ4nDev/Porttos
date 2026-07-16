/* eslint-disable @typescript-eslint/no-explicit-any */
// angular import
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { Subscription } from 'rxjs';
import { PTLEmpresaSCModel } from 'src/app/theme/shared/_helpers/models/PTLEmpresaSC.model';
// import { PTLSuscriptorModel } from 'src/app/theme/shared/_helpers/models/PTLSuscriptor.model';
import { PTLUsuaioEmpresasSCModel } from 'src/app/theme/shared/_helpers/models/PTLUsuarioEmpresaSC.model';
import { PTLUsuarioSCModel } from 'src/app/theme/shared/_helpers/models/PTLUsuarioSC.model';
import { FullScreenSliderComponent } from 'src/app/theme/shared/components/fullscreen-slider/fullscreen-slider.component';
import { LanguageSelectorComponent } from 'src/app/theme/shared/components/language-selector/language-selector.component';
import {
  UploadFilesService,
  LocalStorageService,
  PtlusuariosScService,
  PtlusuariosEmpresasScService,
  PtlEmpresasScService,
  UtilidadesService
} from 'src/app/theme/shared/service';

@Component({
  selector: 'app-inicio-empresas',
  standalone: true,
  imports: [NgbDropdownModule, RouterModule, ColorPickerModule, SharedModule, LanguageSelectorComponent, FullScreenSliderComponent],
  templateUrl: './inicio-empresas.component.html',
  styleUrl: './inicio-empresas.component.scss'
})
export class InicioEmpresasComponent implements OnInit, OnDestroy {
  public suscCode: string = '';
  subscriptions = new Subscription();
  usuariosSC: PTLUsuarioSCModel[] = [];
  usuarioSC: PTLUsuarioSCModel = {} as PTLUsuarioSCModel;
  empresasSC: PTLEmpresaSCModel[] = [];
  usuariosEmpresasSC: PTLUsuaioEmpresasSCModel[] = [];

  constructor(
    private _usuariosSCService: PtlusuariosScService,
    private _usuariosEmpresasSCService: PtlusuariosEmpresasScService,
    private _empresasSCService: PtlEmpresasScService,
    private _uploadService: UploadFilesService,
    private _localStorageService: LocalStorageService,
    private _utilidadesService: UtilidadesService,
    private router: Router
  ) {
    // const suscriptor = this._localStorageService.getSuscriptorLocalStorage();
    // if (suscriptor) {
    //   this.suscriptor = this._localStorageService.getSuscriptorLocalStorage()?.codigoSuscriptor || '';
    //   console.log('datos del suscriptor', suscriptor);
    // } else {
    // this.suscriptor = this._localStorageService.getSuscriptorPlataformaLocalStorage();
    console.log('no hay suscriptor suscriptor');
    // }
  }

  ngOnInit(): void {
    console.log('ingresa a la plataforma');
    setTimeout(() => {
      this.consultarRegistros();
    }, 500);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  consultarRegistros() {
    const suscriptor = this._localStorageService.getSuscriptorLocalStorage();
    if (!suscriptor || !suscriptor.codigoSuscriptor) {
      console.error('Error: No se pudo obtener el suscriptor o su código. Operación de carga de registros abortada.');
      this.empresasSC = [];
      this.usuarioSC = {} as PTLUsuarioSCModel;
      return;
    }
    const codigoSuscriptor = suscriptor.codigoSuscriptor;
    this.subscriptions.add(
      this._empresasSCService.empresasSC$.subscribe({
        next: (empresas: PTLEmpresaSCModel[]) => {
          empresas.forEach((susc: any) => {
            susc.logoEmpresa = this._uploadService.getFilePath(codigoSuscriptor, 'empresas', susc.logoEmpresa);
          });
          this.empresasSC = empresas;
          console.log('suscriptores:', this.empresasSC);
          this.consultarUusuariosEmpresasSC();
        },
        error: (err) => {
          console.error('Error al cargar los roles de suscriptores:', err);
          this.empresasSC = [];
        }
      })
    );
  }

  consultarUusuariosSC() {
    const user = this._localStorageService.getUsuarioLocalStorage();
    console.log('&&&&&&&& usuariosSC');
    this.subscriptions.add(
      this._usuariosSCService.usuariosSC$.subscribe({
        next: (usuariosSC: PTLUsuarioSCModel[]) => {
          this.usuariosSC = usuariosSC;
          this.usuarioSC = usuariosSC.filter((x) => x.codigoUsuario == user?.codigoUsuario)[0];
          console.log('usuarioSC:', this.usuarioSC);
          this.consultarUusuariosEmpresasSC();
        },
        error: (err: any) => {
          console.error('Error al cargar los roles de usuariosSC:', err);
          this.usuarioSC = {} as PTLUsuarioSCModel;
        }
      })
    );
  }

  consultarUusuariosEmpresasSC() {
    console.log('&&&&&&&& usuariosSC');
    this.usuariosEmpresasSC = [];
    this.subscriptions.add(
      this._usuariosEmpresasSCService._usuariosEmpresas$.subscribe({
        next: (usuariosEmpresas: PTLUsuaioEmpresasSCModel[]) => {
          usuariosEmpresas.forEach((usuario) => {
            if (this.usuarioSC && usuario.codigoUsuarioSC === this.usuarioSC.codigoUsuarioSC) {
              this.usuariosEmpresasSC.push(usuario);
            }
          });
          //   this.usuariosEmpresasSC = usuariosEmpresas;
          console.log('-------------------usuariosEmpresas:', this.usuariosEmpresasSC);
        },
        error: (err) => {
          console.error('Error al cargar los roles de usuariosEmpresas:', err);
          this.usuariosEmpresasSC = [];
        }
      })
    );
  }

  ingresarPlataforma(empre: PTLEmpresaSCModel) {
    const current = this._localStorageService.getCurrentUserLocalStorage();
    current.empresa = empre;
    console.log('&&&&&&&&&&&&&&&&&&&& Current User Final', current);
    console.log('ingresar a', empre);
    this._localStorageService.setEmpresasLocalStorage(empre);
    this.router.navigate(['/starter/inicio-aplicaciones']);
  }
}
