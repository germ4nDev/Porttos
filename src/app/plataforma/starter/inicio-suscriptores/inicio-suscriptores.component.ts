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
import { PTLSuscriptorModel } from 'src/app/theme/shared/_helpers/models/PTLSuscriptor.model';
import { PTLUsuaioEmpresasSCModel } from 'src/app/theme/shared/_helpers/models/PTLUsuarioEmpresaSC.model';
import { PTLUsuarioSCModel } from 'src/app/theme/shared/_helpers/models/PTLUsuarioSC.model';
import { FullScreenSliderComponent } from 'src/app/theme/shared/components/fullscreen-slider/fullscreen-slider.component';
import { LanguageSelectorComponent } from 'src/app/theme/shared/components/language-selector/language-selector.component';
import {
  PTLSuscriptoresService,
  UploadFilesService,
  LocalStorageService,
  PtlusuariosScService,
  PtlusuariosEmpresasScService,
  PtlEmpresasScService
} from 'src/app/theme/shared/service';

@Component({
  selector: 'app-inicio-suscriptores',
  standalone: true,
  imports: [NgbDropdownModule, RouterModule, ColorPickerModule, SharedModule, LanguageSelectorComponent, FullScreenSliderComponent],
  templateUrl: './inicio-suscriptores.component.html',
  styleUrl: './inicio-suscriptores.component.scss'
})
export class InicioSuscriptoresComponent implements OnInit, OnDestroy {
  public suscCode: string = '';
  suscriptores: PTLSuscriptorModel[] = [];
  suscriptor: string = '';
  subscriptions = new Subscription();
  usuariosSC: PTLUsuarioSCModel[] = [];
  empresasSC: PTLEmpresaSCModel[] = [];
  usuariosEmpresas: PTLUsuaioEmpresasSCModel[] = [];
  usuarioSC: PTLUsuarioSCModel = {} as PTLUsuarioSCModel;
  usuarioEmpresaSC: PTLUsuaioEmpresasSCModel = {} as PTLUsuaioEmpresasSCModel;

  constructor(
    private _suscriptoresService: PTLSuscriptoresService,
    private _usuariosSCService: PtlusuariosScService,
    private _usuariosEmpresasSCService: PtlusuariosEmpresasScService,
    private _empresasSCService: PtlEmpresasScService,
    private _uploadService: UploadFilesService,
    private _localStorageService: LocalStorageService,
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
    this.consultarSuscriptores();

    }, 500);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  consultarSuscriptores() {
    const codigoSuscriptor = this._localStorageService.getObject<string>('codigoSuscriptor') || ''
    this.subscriptions.add(
      this._suscriptoresService.suscriptores$.subscribe({
        next: (suscriptores: PTLUsuarioSCModel[]) => {
          suscriptores.forEach((susc: any) => {
            susc.logoSusucriptor = this._uploadService.getFilePath(codigoSuscriptor, 'suscriptores', susc.logoSusucriptor);
          });
          this.suscriptores = suscriptores;
          console.log('suscriptores:', this.suscriptores);
          this.consultarUusuariosEmpresasSC();
          this.consultarEempresasSC();
        },
        error: (err) => {
          console.error('Error al cargar los roles de suscriptores:', err);
          this.usuarioSC = {} as PTLUsuarioSCModel;
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

  consultarEempresasSC() {
    console.log('&&&&&&&& empresasSC');
    this.subscriptions.add(
      this._empresasSCService.empresasSC$.subscribe({
        next: (empresasSC: PTLEmpresaSCModel[]) => {
          this.empresasSC = empresasSC;
          console.log('****************empresasSC:', this.empresasSC);
          this.consultarUusuariosEmpresasSC();
        },
        error: (err) => {
          console.error('Error al cargar los roles de usuariosSC:', err);
          this.empresasSC = {} as PTLEmpresaSCModel[];
        }
      })
    );
  }

  consultarUusuariosEmpresasSC() {
    console.log('&&&&&&&& usuariosSC');
    this.subscriptions.add(
      this._usuariosEmpresasSCService._usuariosEmpresas$.subscribe({
        next: (usuariosEmpresas: PTLUsuaioEmpresasSCModel[]) => {
          this.usuariosEmpresas = usuariosEmpresas.filter((x) => x.codigoUsuarioSC == this.usuarioSC?.codigoUsuarioSC);
          this.usuarioEmpresaSC = this.usuariosEmpresas[0];
          console.log('-------------------usuariosEmpresas:', this.usuariosEmpresas);
        },
        error: (err) => {
          console.error('Error al cargar los roles de usuariosEmpresas:', err);
          this.usuariosEmpresas = {} as PTLUsuaioEmpresasSCModel[];
        }
      })
    );
  }

  ingresarPlataforma(susc: PTLSuscriptorModel) {
    console.log('empresas suscrioptor', this.empresasSC);
    const current = this._localStorageService.getCurrentUserLocalStorage();
    //TODO Validar las suscriptores y la vigencia de la licencia
    // if (this.usuariosEmpresas.length > 0) {
    //   current.empresas = [];
    //   this.usuariosEmpresas.forEach((empre: any) => {
    //     const empresaData = this.empresasSC.filter((x) => x.codigoEmpresaSC === empre.codigoEmpresaSC)[0];
    //     if (empresaData) {
    //       const existe = current.empresas?.filter((x: { codigoEmpresaSC: string; }) => x.codigoEmpresaSC === empresaData.codigoEmpresaSC);
    //       if (existe?.length === 0) {
    //         current.empresas?.push(empresaData);
    //       }
    //     }
    //   });
    // }
    console.log('&&&&&&&&&&&&&&&&&&&& Current User Final', current);
    console.log('ingresar a', susc);
    // this._localStorageService.setEmpresasLocalStorage(current.empresas || []);
    this._localStorageService.setSuscriptorLocalStorage(susc);
    this.router.navigate(['/starter/inicio-empresas']);
  }
}
