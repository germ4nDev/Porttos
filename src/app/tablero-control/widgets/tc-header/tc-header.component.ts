import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from "src/app/theme/shared/components/language-selector/language-selector.component";
import { ProfileDrpComponent } from "src/app/theme/shared/components/profile-drp/profile-drp.component";
import { Router } from '@angular/router';
import { DashboardService } from 'src/app/theme/shared/service/tablero-control/dashboard.service';
import { FiltroTableroService } from 'src/app/theme/shared/service/tablero-control/filtro-tablero.service';
import { MapaGeneralService } from 'src/app/theme/shared/service/tablero-control/mapa-general.service';
import { PuertosService } from 'src/app/theme/shared/service/tablero-control/puertos.service';
import { LocalStorageService } from 'src/app/theme/shared/service';
import { Puerto } from 'src/app/theme/shared/_helpers/models/tablero-control/puerto.model';

@Component({
    selector: 'app-tc-header',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, LanguageSelectorComponent, ProfileDrpComponent],
    templateUrl: './tc-header.component.html',
    styleUrl: './tc-header.component.scss'
})
export class TcHeaderComponent implements OnInit {
    // Entradas (Lo que le pasa el componente padre)
    @Input() titulo: string = 'Porttos 1.0';
    @Input() subtitulo: string = 'Plataforma para la gestión portuaria';
    @Input() nodos: any[] = []; // Lista de puertos/nodos
    @Input() tableroBloqueado: boolean = true;
    @Output() toggleBloqueo = new EventEmitter<void>();
    @Output() abrirCatalogo = new EventEmitter<void>();
    @Output() nodoCambiado = new EventEmitter<string>();

    nodoSeleccionado: string = 'Buenaventura';
    isOptionBloqueo: boolean = false;
    isBloqueado: boolean = false;
    public mapaPortuario: any[] = [];
    public listaCiudadesPortuarias: any[] = [];
    public newPuerto: Puerto = new Puerto();

    horaActual: string = '';
    fechaActual: string = '';
    private timer: any;

    constructor(
        private router: Router,
        private _dashboardService: DashboardService,
        private _mapaGeneralService: MapaGeneralService,
        private _puertosService: PuertosService,
        private _localStorageService: LocalStorageService,
        private _filtroTableroService: FiltroTableroService
    ) { }

    ngOnInit(): void {
        this.listaCiudadesPortuarias = this._puertosService.getPuertosActuales();
        this.newPuerto = this.listaCiudadesPortuarias.filter(x => x.id_puerto == 'BUENAVENTURA')[0] as Puerto;
        this.nodoSeleccionado = this.newPuerto.id_puerto || 'BUENAVENTURA';
        this._localStorageService.setPuertoLocalStorage(this.nodoSeleccionado)

        this.actualizarReloj();
        // Disparador cada 1 segundo para mantener la hora viva
        this.timer = setInterval(() => {
            this.actualizarReloj();
        }, 1000);
    }

    private actualizarReloj() {
        const ahora = new Date();

        // 1. Obtener la hora exacta HH:mm:ss
        this.horaActual = ahora.toTimeString().split(' ')[0];

        // 2. Arrays en español para asegurar la estructura exacta (DOMINGO, 09 DE AGOSTO DE 2026)
        const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
        const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

        const diaSemana = dias[ahora.getDay()];
        const diaMes = String(ahora.getDate()).padStart(2, '0');
        const mes = meses[ahora.getMonth()];
        const anio = ahora.getFullYear();

        this.fechaActual = `${diaSemana}, ${diaMes} DE ${mes} DE ${anio} · UTC-5`;
    }

    onCambioNodo(event: any) {
        console.log('nodo Seleccionado', event.target.value);
        this.newPuerto = this.listaCiudadesPortuarias.filter(x => x.id_puerto == event.target.value)[0] as Puerto;
        const ciudad = this.newPuerto.id_puerto || 'BUENAVENTURA';
        this.nodoCambiado.emit(ciudad.toUpperCase());
        this._localStorageService.setPuertoLocalStorage(ciudad)
        this._filtroTableroService.cambiarCiudad(ciudad.toUpperCase());
    }

    onPuertoChange(selectedOption: any) {
        this._localStorageService.setPuertoLocalStorage(selectedOption)
        this._mapaGeneralService.seleccionarPuerto(selectedOption.nombre);
    }

    consultarMapaPortuario() {
        this._dashboardService.cargarMapaPortuario().subscribe((mapa: any) => {
            this.mapaPortuario = mapa.data;
        })
    }

    onBloqueoClick() {
        this.isBloqueado = this.isBloqueado == true ? false : true;
        this.toggleBloqueo.emit();
    }

    goBack() {
        this.router.navigate(['/starter/inicio-suites']);
    }
}
