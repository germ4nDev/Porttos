/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { LocalStorageService, UploadFilesService } from 'src/app/theme/shared/service';
import { LanguageSelectorComponent } from "src/app/theme/shared/components/language-selector/language-selector.component";
import { SliderComponent } from "src/app/theme/shared/components/slider/slider.component";

@Component({
  selector: 'app-qplus',
  standalone: true,
  imports: [CommonModule, LanguageSelectorComponent, SliderComponent],
  templateUrl: './qplus.component.html',
  styleUrl: './qplus.component.scss'
})
export class QplusComponent implements OnInit, OnDestroy {
  private autoSlideInterval: any;
  carouselImages: any[] = [];
  currentIndex = signal(0);
  suscPlataforma: string = '';
  LogoQplus: string = '';
  carrusel1: string = '';
  carrusel2: string = '';
  carrusel3: string = '';
  carrusel4: string = '';
  carrusel5: string = '';
  videoInicio: string = '';
  qplusSG: string = '';
  qplusVD: string = '';
  qplusTH: string = '';

  caract1: string = '';
  nube2: string = '';
  multiempresa: string = '';
  equipo1: string = '';
  logoDM: string = '';
  logoProtecnica: string = '';
  logoquimicalider: string = '';
  logonutresol: string = '';
  logocomfandi3: string = '';
  logosos: string = '';
  logogangana: string = '';
  logosuchance: string = '';
  logoreditos: string = '';
  logoproductecnica: string = '';
  contactUs: string = '';

  constructor(
    private _localStorageService: LocalStorageService,
    private _uploadService: UploadFilesService
  ) {}

  ngOnInit(): void {
    console.log('Qplus Website iniciado correctamente');
    this.suscPlataforma = this._localStorageService.getSuscriptorPlataformaLocalStorage();
    this.videoInicio = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10', 'Qplus 2024- Corto.mp4');
    this.qplusSG = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10', 'SG_Qplus.png');
    this.qplusVD = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10', 'VD_Qplus.png');
    this.qplusTH = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10', 'TH_Qplus.png');
    this.contactUs = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10', 'contact us.png');
    this.caract1 = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10', 'Caract-1.png');
    this.nube2 = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10', 'La_nube2.png');
    this.multiempresa = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10', 'Multiempresa.png');
    this.equipo1 = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10', 'Equipo_1.png');

    this.LogoQplus = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10', 'logo_Qplus2.jpg');
    this.carrusel1 = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10carrusel', '1.png');
    this.carrusel2 = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10carrusel', '2.png');
    this.carrusel3 = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10carrusel', '3.png');
    this.carrusel4 = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10carrusel', '4.png');
    this.carrusel5 = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10carrusel', '5.png');

    this.carouselImages = [
      this.carrusel1,
      this.carrusel2,
      this.carrusel3,
      this.carrusel4,
      this.carrusel5
    ];

    this.logoDM = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10clientes', 'Logo_D&M.png');
    this.logoProtecnica = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10clientes', 'logo_Protecnica.png');
    this.logoquimicalider = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10clientes', 'logoquimicalider.png');
    this.logonutresol = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10clientes', 'logonutresol.png');
    this.logocomfandi3 = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10clientes', 'logo_Comfandi3.jpg');
    this.logosos = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10clientes', 'logo_SOS.png');
    this.logogangana = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10clientes', 'logo_gangana.png');
    this.logosuchance = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10clientes', 'logo_Suchance.png');
    this.logoreditos = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10clientes', 'logoreditos.png');
    this.logoproductecnica = this._uploadService.getFilePath(this.suscPlataforma, 'qplus10clientes', 'logoproductecnica.png');
  }

  ngOnDestroy(): void {
      console.log('ok');
  }
}
